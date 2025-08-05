import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { supabase, dbHelpers } from '../../config/supabase.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { authorizeUsageLimits } from '../../middleware/authorize.js';
import winston from 'winston';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Initialize AI providers
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
}) : null;

const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY
}) : null;

/**
 * @route   GET /api/v1/ai/models
 * @desc    Get available AI models
 * @access  Private (FlowMind)
 */
router.get('/models', asyncHandler(async (req, res) => {
  try {
    const { data: models, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_enabled', true)
      .order('name');

    if (error) throw error;

    // Add provider availability
    const modelsWithAvailability = models.map(model => ({
      ...model,
      available: checkProviderAvailability(model.provider)
    }));

    res.json({
      models: modelsWithAvailability,
      defaultModel: 'claude-3-haiku'
    });

  } catch (error) {
    logger.error('Get models error:', error);
    res.status(500).json({
      error: 'Failed to get AI models',
      message: error.message
    });
  }
}));

/**
 * @route   GET /api/v1/ai/sessions
 * @desc    Get user's chat sessions
 * @access  Private (FlowMind)
 */
router.get('/sessions', [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('archived').optional().isBoolean().toBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { limit = 50, archived = false } = req.query;

  try {
    let query = supabase
      .from('chat_sessions')
      .select(`
        *,
        message_count:ai_messages(count),
        latest_message:ai_messages!inner(content, created_at)
      `)
      .eq('user_id', req.user.userId)
      .eq('is_archived', archived)
      .order('updated_at', { ascending: false })
      .limit(limit);

    const { data: sessions, error } = await query;

    if (error) throw error;

    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        title: session.title,
        modelId: session.model_id,
        totalTokens: session.total_tokens,
        totalCost: session.total_cost,
        messageCount: session.message_count?.[0]?.count || 0,
        latestMessage: session.latest_message?.[0],
        isArchived: session.is_archived,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      }))
    });

  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Failed to get chat sessions',
      message: error.message
    });
  }
}));

/**
 * @route   POST /api/v1/ai/sessions
 * @desc    Create new chat session
 * @access  Private (FlowMind)
 */
router.post('/sessions', [
  body('title').optional().isLength({ min: 1, max: 100 }).trim(),
  body('modelId').isIn(['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus', 'gpt-4o', 'llama-70b']),
  body('systemPrompt').optional().isLength({ max: 2000 }).trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { title = 'New Chat', modelId, systemPrompt } = req.body;

  try {
    // Check if model exists and is available
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('id', modelId)
      .eq('is_enabled', true)
      .single();

    if (modelError || !model) {
      return res.status(400).json({
        error: 'Invalid model',
        message: 'The specified AI model is not available'
      });
    }

    // Check provider availability
    if (!checkProviderAvailability(model.provider)) {
      return res.status(503).json({
        error: 'Provider unavailable',
        message: `${model.provider} service is currently unavailable`
      });
    }

    // Create session
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: req.user.userId,
        title,
        model_id: modelId,
        system_prompt: systemPrompt
      })
      .select()
      .single();

    if (error) throw error;

    // Log session creation
    await dbHelpers.logActivity(
      req.user.userId,
      'flowmind',
      'chat_session_created',
      { sessionId: session.id, modelId, title }
    );

    res.status(201).json({
      message: 'Chat session created',
      session: {
        id: session.id,
        title: session.title,
        modelId: session.model_id,
        systemPrompt: session.system_prompt,
        createdAt: session.created_at
      }
    });

  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({
      error: 'Failed to create chat session',
      message: error.message
    });
  }
}));

/**
 * @route   GET /api/v1/ai/sessions/:id/messages
 * @desc    Get messages from a chat session
 * @access  Private (FlowMind)
 */
router.get('/sessions/:id/messages', [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session not found or access denied'
      });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      messages: messages.map(message => ({
        id: message.id,
        role: message.role,
        content: message.content,
        modelId: message.model_id,
        tokensUsed: message.tokens_used,
        cost: message.cost,
        processingTime: message.processing_time_ms,
        createdAt: message.created_at
      })),
      pagination: {
        limit,
        offset,
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      error: 'Failed to get messages',
      message: error.message
    });
  }
}));

/**
 * @route   POST /api/v1/ai/chat
 * @desc    Send message to AI and get response
 * @access  Private (FlowMind)
 */
router.post('/chat', [
  authorizeUsageLimits({ aiRequests: true }),
  body('sessionId').isUUID(),
  body('message').isLength({ min: 1, max: 10000 }).trim(),
  body('stream').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { sessionId, message, stream = false } = req.body;
  const startTime = Date.now();

  try {
    // Get session with model info
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        model:ai_models(*)
      `)
      .eq('id', sessionId)
      .eq('user_id', req.user.userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session not found or access denied'
      });
    }

    // Check provider availability
    if (!checkProviderAvailability(session.model.provider)) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: `${session.model.provider} service is currently unavailable`
      });
    }

    // Save user message
    const { data: userMessage, error: messageError } = await supabase
      .from('ai_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        model_id: session.model_id
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Get conversation history
    const { data: conversationHistory, error: historyError } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    // Generate AI response
    const aiResponse = await generateAIResponse(
      session.model,
      conversationHistory,
      session.system_prompt,
      stream
    );

    if (stream) {
      // Handle streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream the response (simplified for now)
      res.write(`data: ${JSON.stringify({ content: aiResponse.content })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Save AI response
      const processingTime = Date.now() - startTime;
      const { data: assistantMessage, error: assistantError } = await supabase
        .from('ai_messages')
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: aiResponse.content,
          model_id: session.model_id,
          tokens_used: aiResponse.tokensUsed,
          cost: aiResponse.cost,
          processing_time_ms: processingTime
        })
        .select()
        .single();

      if (assistantError) throw assistantError;

      // Update session stats
      await supabase
        .from('chat_sessions')
        .update({
          total_tokens: session.total_tokens + aiResponse.tokensUsed,
          total_cost: session.total_cost + aiResponse.cost,
          message_count: session.message_count + 2, // user + assistant
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Log chat activity
      await dbHelpers.logActivity(
        req.user.userId,
        'flowmind',
        'ai_chat_message',
        {
          sessionId,
          modelId: session.model_id,
          tokensUsed: aiResponse.tokensUsed,
          processingTime
        }
      );

      res.json({
        message: 'Response generated successfully',
        userMessage: {
          id: userMessage.id,
          role: 'user',
          content: message,
          createdAt: userMessage.created_at
        },
        assistantMessage: {
          id: assistantMessage.id,
          role: 'assistant',
          content: aiResponse.content,
          tokensUsed: aiResponse.tokensUsed,
          cost: aiResponse.cost,
          processingTime,
          createdAt: assistantMessage.created_at
        }
      });
    }

  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message
    });
  }
}));

/**
 * @route   DELETE /api/v1/ai/sessions/:id
 * @desc    Delete chat session
 * @access  Private (FlowMind)
 */
router.delete('/sessions/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership and delete
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.userId);

    if (error) throw error;

    // Log deletion
    await dbHelpers.logActivity(
      req.user.userId,
      'flowmind',
      'chat_session_deleted',
      { sessionId: id }
    );

    res.json({
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    logger.error('Delete session error:', error);
    res.status(500).json({
      error: 'Failed to delete chat session',
      message: error.message
    });
  }
}));

/**
 * Helper function to check provider availability
 */
function checkProviderAvailability(provider) {
  switch (provider) {
    case 'openai':
      return !!openai;
    case 'anthropic':
      return !!anthropic;
    case 'groq':
      return !!groq;
    default:
      return false;
  }
}

/**
 * Helper function to generate AI response
 */
async function generateAIResponse(model, conversationHistory, systemPrompt, stream = false) {
  const messages = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push(...conversationHistory);

  try {
    switch (model.provider) {
      case 'openai':
        return await generateOpenAIResponse(model, messages, stream);
      case 'anthropic':
        return await generateAnthropicResponse(model, messages, stream);
      case 'groq':
        return await generateGroqResponse(model, messages, stream);
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
  } catch (error) {
    logger.error(`${model.provider} API error:`, error);
    throw new Error(`AI service error: ${error.message}`);
  }
}

/**
 * Generate OpenAI response
 */
async function generateOpenAIResponse(model, messages, stream = false) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await openai.chat.completions.create({
    model: model.id === 'gpt-4o' ? 'gpt-4o' : 'gpt-3.5-turbo',
    messages,
    max_tokens: model.max_tokens,
    stream
  });

  if (stream) {
    return response; // Return stream
  }

  return {
    content: response.choices[0].message.content,
    tokensUsed: response.usage.total_tokens,
    cost: response.usage.total_tokens * (model.cost_per_token || 0)
  };
}

/**
 * Generate Anthropic response
 */
async function generateAnthropicResponse(model, messages, stream = false) {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  // Convert messages format for Anthropic
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const response = await anthropic.messages.create({
    model: model.id,
    max_tokens: model.max_tokens,
    messages: conversationMessages,
    system: systemMessage?.content,
    stream
  });

  if (stream) {
    return response; // Return stream
  }

  return {
    content: response.content[0].text,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    cost: (response.usage.input_tokens + response.usage.output_tokens) * (model.cost_per_token || 0)
  };
}

/**
 * Generate Groq response
 */
async function generateGroqResponse(model, messages, stream = false) {
  if (!groq) {
    throw new Error('Groq API key not configured');
  }

  const response = await groq.chat.completions.create({
    model: 'llama2-70b-4096',
    messages,
    max_tokens: model.max_tokens,
    stream
  });

  if (stream) {
    return response; // Return stream
  }

  return {
    content: response.choices[0].message.content,
    tokensUsed: response.usage.total_tokens,
    cost: response.usage.total_tokens * (model.cost_per_token || 0)
  };
}

export default router;