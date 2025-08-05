#!/bin/bash

# FlowMind Universal Backend - Frontend Migration Script
# Migrates all 4 frontends to use the production backend

set -e  # Exit on any error

echo "🌐 FlowMind Frontend Migration Script"
echo "====================================="

# Default backend URL
BACKEND_URL=${BACKEND_URL:-"https://api.flowmind.app"}

echo "🔗 Backend URL: $BACKEND_URL"
echo ""

# Frontend directories (adjust paths as needed)
CITYPULSE_DIR="${CITYPULSE_DIR:-./frontend}"
FLOWMIND_DIR="${FLOWMIND_DIR:-../flowmind-chat}"
QUANTUM_DIR="${QUANTUM_DIR:-../quantum-swarm}" 
VELOCITY_DIR="${VELOCITY_DIR:-../velocity-swarm}"

# Function to update frontend configuration
update_frontend() {
    local frontend_name=$1
    local frontend_dir=$2
    local frontend_source=$3
    
    echo "🔧 Updating $frontend_name..."
    
    if [ ! -d "$frontend_dir" ]; then
        echo "⚠️ Directory not found: $frontend_dir"
        echo "   Skipping $frontend_name"
        return
    fi
    
    cd "$frontend_dir"
    
    # Create .env.production file
    cat > .env.production << EOF
# $frontend_name - Production Environment
NODE_ENV=production
VITE_NODE_ENV=production

# API Configuration  
VITE_API_BASE_URL=$BACKEND_URL
VITE_WEBSOCKET_URL=${BACKEND_URL/https:/wss:}/ws

# Frontend Identification
VITE_FRONTEND_SOURCE=$frontend_source
VITE_APP_NAME=$frontend_name
VITE_APP_VERSION=1.0.0

# Authentication
VITE_JWT_TOKEN_KEY=${frontend_source}_auth_token
VITE_REFRESH_TOKEN_KEY=${frontend_source}_refresh_token

# Feature Flags
VITE_MOCK_DATA_ENABLED=false
VITE_WEBSOCKET_ENABLED=true
VITE_REAL_TIME_ENABLED=true

# Performance
VITE_ENABLE_DEVTOOLS=false
VITE_API_TIMEOUT=30000
VITE_WEBSOCKET_RECONNECT_INTERVAL=5000

# Analytics & Monitoring  
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/$frontend_source
VITE_ANALYTICS_ENABLED=true
EOF
    
    # Update package.json scripts if they exist
    if [ -f package.json ]; then
        echo "  📦 Updating package.json scripts..."
        
        # Add production build script if not exists
        npm pkg set scripts.build:prod="vite build --mode production"
        npm pkg set scripts.preview:prod="vite preview --mode production"
        
        # Install dependencies if needed
        if [ ! -d node_modules ]; then
            echo "  📥 Installing dependencies..."
            npm install
        fi
    fi
    
    echo "  ✅ $frontend_name updated"
    cd - > /dev/null
}

# Function to create API service configuration
create_api_service() {
    local frontend_dir=$1
    local frontend_source=$2
    
    if [ ! -d "$frontend_dir/src/services" ]; then
        mkdir -p "$frontend_dir/src/services"
    fi
    
    cat > "$frontend_dir/src/services/apiConfig.ts" << EOF
// Production API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '$BACKEND_URL',
  websocketURL: import.meta.env.VITE_WEBSOCKET_URL || '${BACKEND_URL/https:/wss:}/ws',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'X-Frontend-Source': '$frontend_source'
  }
};

export const ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout'
  },
  
  // Feature-specific endpoints
  $([ "$frontend_source" = "citypulse" ] && echo "
  citypulse: {
    buildings: '/api/v1/citypulse/buildings',
    sensors: '/api/v1/citypulse/sensors',
    energy: '/api/v1/citypulse/energy',
    alerts: '/api/v1/citypulse/alerts',
    analytics: '/api/v1/citypulse/analytics'
  }," || echo "")
  
  $([ "$frontend_source" = "flowmind" ] && echo "
  ai: {
    chat: '/api/v1/ai/chat',
    models: '/api/v1/ai/models',
    history: '/api/v1/ai/history'
  }," || echo "")
  
  $([ "$frontend_source" = "quantum" ] || [ "$frontend_source" = "velocity" ] && echo "
  swarm: {
    orchestrate: '/api/v1/swarm/orchestrate',
    status: '/api/v1/swarm/status',
    tasks: '/api/v1/swarm/tasks',
    agents: '/api/v1/swarm/agents'
  }," || echo "")
  
  // Shared endpoints
  shared: {
    activity: '/api/v1/shared/activity',
    notifications: '/api/v1/shared/notifications'
  }
};
EOF
}

# Function to create production build configuration
create_build_config() {
    local frontend_dir=$1
    
    # Update vite.config.ts for production optimizations
    if [ -f "$frontend_dir/vite.config.ts" ]; then
        echo "  ⚙️ Updating Vite configuration..."
        
        # Backup original config
        cp "$frontend_dir/vite.config.ts" "$frontend_dir/vite.config.ts.backup"
        
        cat > "$frontend_dir/vite.config.ts" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: true
      },
      '/ws': {
        target: process.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
EOF
    fi
}

# Main migration function
main() {
    echo "🚀 Starting frontend migration..."
    echo ""
    
    # Update each frontend
    update_frontend "CityPulse Energy Management" "$CITYPULSE_DIR" "citypulse"
    create_api_service "$CITYPULSE_DIR" "citypulse"
    create_build_config "$CITYPULSE_DIR"
    
    update_frontend "FlowMind AI Chat" "$FLOWMIND_DIR" "flowmind"
    create_api_service "$FLOWMIND_DIR" "flowmind"
    create_build_config "$FLOWMIND_DIR"
    
    update_frontend "Quantum Swarm" "$QUANTUM_DIR" "quantum"
    create_api_service "$QUANTUM_DIR" "quantum" 
    create_build_config "$QUANTUM_DIR"
    
    update_frontend "Velocity Swarm" "$VELOCITY_DIR" "velocity"
    create_api_service "$VELOCITY_DIR" "velocity"
    create_build_config "$VELOCITY_DIR"
    
    echo ""
    echo "🎉 Frontend migration completed!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Review .env.production files in each frontend"
    echo "  2. Test API connections: npm run dev"
    echo "  3. Build for production: npm run build:prod" 
    echo "  4. Deploy frontends to your hosting platform"
    echo ""
    echo "🔗 Backend health check: curl $BACKEND_URL/health"
}

# Run main function
main "$@"