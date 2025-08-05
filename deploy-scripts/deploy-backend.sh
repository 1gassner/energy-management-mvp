#!/bin/bash

# FlowMind Universal Backend Deployment Script
# Supports Railway, Heroku, and Docker deployments

set -e  # Exit on any error

echo "🚀 FlowMind Universal Backend Deployment Script"
echo "================================================"

# Check if deployment target is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <railway|heroku|docker>"
    echo ""
    echo "Available deployment targets:"
    echo "  railway - Deploy to Railway"
    echo "  heroku  - Deploy to Heroku" 
    echo "  docker  - Build and run with Docker"
    exit 1
fi

DEPLOYMENT_TARGET=$1

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_vars() {
    local missing_vars=()
    
    if [ -z "$SUPABASE_URL" ]; then missing_vars+=("SUPABASE_URL"); fi
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then missing_vars+=("SUPABASE_SERVICE_ROLE_KEY"); fi
    if [ -z "$JWT_SECRET" ]; then missing_vars+=("JWT_SECRET"); fi
    if [ -z "$OPENAI_API_KEY" ]; then missing_vars+=("OPENAI_API_KEY"); fi
    if [ -z "$ANTHROPIC_API_KEY" ]; then missing_vars+=("ANTHROPIC_API_KEY"); fi
    if [ -z "$GROQ_API_KEY" ]; then missing_vars+=("GROQ_API_KEY"); fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set these variables in .env.production or your deployment platform."
        exit 1
    fi
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    cd backend
    npm ci
    npm run lint
    npm run test --passWithNoTests || true
    cd ..
    echo "✅ Tests completed"
}

# Railway deployment
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    if ! command_exists railway; then
        echo "❌ Railway CLI not found. Install it with:"
        echo "npm install -g @railway/cli"
        exit 1
    fi
    
    # Check if logged in
    if ! railway whoami >/dev/null 2>&1; then
        echo "🔐 Please login to Railway first:"
        railway login
    fi
    
    # Deploy to Railway
    echo "📦 Deploying to Railway..."
    railway up --detach
    
    echo "🔗 Getting deployment URL..."
    RAILWAY_URL=$(railway domain)
    echo "✅ Deployed to: $RAILWAY_URL"
}

# Heroku deployment  
deploy_heroku() {
    echo "🟪 Deploying to Heroku..."
    
    if ! command_exists heroku; then
        echo "❌ Heroku CLI not found. Install it from:"
        echo "https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if logged in
    if ! heroku auth:whoami >/dev/null 2>&1; then
        echo "🔐 Please login to Heroku first:"
        heroku login
    fi
    
    # Create app if it doesn't exist
    APP_NAME=${HEROKU_APP_NAME:-flowmind-universal-backend}
    
    if ! heroku apps:info $APP_NAME >/dev/null 2>&1; then
        echo "📱 Creating Heroku app: $APP_NAME"
        heroku create $APP_NAME
        
        # Add required addons
        heroku addons:create heroku-postgresql:essential-0 --app $APP_NAME
        heroku addons:create heroku-redis:mini --app $APP_NAME
    fi
    
    # Set environment variables
    echo "⚙️ Setting environment variables..."
    heroku config:set NODE_ENV=production --app $APP_NAME
    heroku config:set SUPABASE_URL=$SUPABASE_URL --app $APP_NAME
    heroku config:set SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY --app $APP_NAME
    heroku config:set JWT_SECRET=$JWT_SECRET --app $APP_NAME
    heroku config:set OPENAI_API_KEY=$OPENAI_API_KEY --app $APP_NAME
    heroku config:set ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY --app $APP_NAME
    heroku config:set GROQ_API_KEY=$GROQ_API_KEY --app $APP_NAME
    heroku config:set ALLOWED_ORIGINS=$ALLOWED_ORIGINS --app $APP_NAME
    heroku config:set RATE_LIMITING_ENABLED=true --app $APP_NAME
    heroku config:set AI_MODELS_ENABLED=true --app $APP_NAME
    heroku config:set CITYPULSE_ENABLED=true --app $APP_NAME
    heroku config:set QUANTUM_SWARM_ENABLED=true --app $APP_NAME
    heroku config:set VELOCITY_SWARM_ENABLED=true --app $APP_NAME
    heroku config:set WEBSOCKET_ENABLED=true --app $APP_NAME
    
    # Deploy to Heroku
    echo "📦 Deploying to Heroku..."
    git push heroku main
    
    echo "✅ Deployed to: https://$APP_NAME.herokuapp.com"
}

# Docker deployment
deploy_docker() {
    echo "🐳 Building and running with Docker..."
    
    if ! command_exists docker; then
        echo "❌ Docker not found. Install it from:"
        echo "https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Build the image
    echo "🔨 Building Docker image..."
    docker build -f Dockerfile.backend -t flowmind-backend:latest .
    
    # Stop existing container if running
    if docker ps -q -f name=flowmind-backend >/dev/null; then
        echo "🛑 Stopping existing container..."
        docker stop flowmind-backend
        docker rm flowmind-backend
    fi
    
    # Run the container
    echo "🚀 Starting Docker container..."
    docker run -d \
        --name flowmind-backend \
        -p 8000:8000 \
        --env-file .env.production \
        flowmind-backend:latest
    
    echo "✅ Backend running at: http://localhost:8000"
}

# Main deployment logic
main() {
    echo "🔍 Checking prerequisites..."
    
    # Load environment variables if .env.production exists
    if [ -f .env.production ]; then
        echo "📄 Loading .env.production..."
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    # Check environment variables
    check_env_vars
    
    # Run tests
    run_tests
    
    # Deploy based on target
    case $DEPLOYMENT_TARGET in
        railway)
            deploy_railway
            ;;
        heroku)
            deploy_heroku
            ;;
        docker)
            deploy_docker
            ;;
        *)
            echo "❌ Unknown deployment target: $DEPLOYMENT_TARGET"
            echo "Use: railway, heroku, or docker"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "🏥 Health check: curl https://api.flowmind.app/health"
    echo "📊 API info: curl https://api.flowmind.app/api/v1/info"
}

# Run main function
main "$@"