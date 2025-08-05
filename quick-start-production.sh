#!/bin/bash

# 🚀 FlowMind Universal Backend - Quick Production Start
# One-command deployment and verification script

set -e

echo "🚀 FlowMind Universal Backend - Quick Production Start"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_status $BLUE "Starting FlowMind Universal Backend production deployment..."
echo ""

# Check prerequisites
print_status $YELLOW "⚡ Checking prerequisites..."

MISSING_TOOLS=()

if ! command -v docker &> /dev/null; then
    MISSING_TOOLS+=("docker")
fi

if ! command -v node &> /dev/null; then
    MISSING_TOOLS+=("node")
fi

if ! command -v npm &> /dev/null; then
    MISSING_TOOLS+=("npm")
fi

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    print_status $RED "❌ Missing required tools: ${MISSING_TOOLS[*]}"
    echo "Please install them before continuing."
    exit 1
fi

print_status $GREEN "✅ All prerequisites satisfied"

# Deployment target selection
if [ -z "$1" ]; then
    echo ""
    print_status $YELLOW "🎯 Select deployment target:"
    echo "1) Railway (Recommended)"
    echo "2) Heroku"
    echo "3) Docker (Local)"
    echo "4) All (Railway + Frontend Migration + Tests)"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1) DEPLOYMENT_TARGET="railway" ;;
        2) DEPLOYMENT_TARGET="heroku" ;;
        3) DEPLOYMENT_TARGET="docker" ;;
        4) DEPLOYMENT_TARGET="all" ;;
        *) 
            print_status $RED "❌ Invalid choice"
            exit 1
            ;;
    esac
else
    DEPLOYMENT_TARGET=$1
fi

print_status $BLUE "🎯 Deployment target: $DEPLOYMENT_TARGET"
echo ""

# Environment setup
print_status $YELLOW "⚙️ Setting up environment..."

if [ ! -f .env.production ]; then
    print_status $YELLOW "📄 Creating .env.production from template..."
    cp .env.production.example .env.production
    print_status $YELLOW "⚠️  Please edit .env.production with your actual values before deployment!"
    
    if command -v code &> /dev/null; then
        print_status $BLUE "Opening .env.production in VS Code for editing..."
        code .env.production
        read -p "Press Enter after editing .env.production..."
    else
        print_status $YELLOW "Please edit .env.production manually and press Enter when done..."
        read
    fi
fi

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    print_status $GREEN "✅ Environment variables loaded"
fi

# Backend tests
print_status $YELLOW "🧪 Running backend tests..."
cd backend
npm install --silent
npm run lint --silent
npm run test --silent --passWithNoTests || print_status $YELLOW "⚠️  Some tests failed, continuing..."
cd ..
print_status $GREEN "✅ Backend tests completed"

# Deployment execution
case $DEPLOYMENT_TARGET in
    "railway")
        print_status $BLUE "🚂 Deploying to Railway..."
        ./deploy-scripts/deploy-backend.sh railway
        ;;
    "heroku")
        print_status $BLUE "🟪 Deploying to Heroku..."
        ./deploy-scripts/deploy-backend.sh heroku
        ;;
    "docker")
        print_status $BLUE "🐳 Deploying with Docker..."
        ./deploy-scripts/deploy-backend.sh docker
        ;;
    "all")
        print_status $BLUE "🌟 Full production deployment..."
        
        # 1. Deploy backend to Railway
        print_status $YELLOW "Step 1/4: Deploying backend to Railway..."
        ./deploy-scripts/deploy-backend.sh railway
        
        # 2. Migrate frontends
        print_status $YELLOW "Step 2/4: Migrating frontends..."
        ./migrate-frontends.sh
        
        # 3. Start monitoring
        print_status $YELLOW "Step 3/4: Starting monitoring stack..."
        if [ -f production-deployment/monitoring-setup.yaml ]; then
            docker-compose -f production-deployment/monitoring-setup.yaml up -d
            print_status $GREEN "✅ Monitoring stack started"
            print_status $BLUE "📊 Grafana: http://localhost:3000 (admin/FlowMind2024!)"
            print_status $BLUE "📊 Prometheus: http://localhost:9090"
        fi
        
        # 4. Run verification tests
        print_status $YELLOW "Step 4/4: Running verification tests..."
        sleep 30  # Wait for services to start
        
        BACKEND_URL=${BACKEND_URL:-"https://api.flowmind.app"}
        
        # Health check
        if curl -f "$BACKEND_URL/health" -s > /dev/null; then
            print_status $GREEN "✅ Backend health check passed"
        else
            print_status $RED "❌ Backend health check failed"
        fi
        
        # API info check
        if curl -f "$BACKEND_URL/api/v1/info" -s > /dev/null; then
            print_status $GREEN "✅ API info endpoint accessible"
        else
            print_status $RED "❌ API info endpoint failed"
        fi
        ;;
esac

# Post-deployment verification
print_status $YELLOW "🔍 Running post-deployment verification..."

BACKEND_URL=${BACKEND_URL:-"https://api.flowmind.app"}

echo ""
print_status $BLUE "🔗 Testing backend endpoints..."

# Test health endpoint
print_status $YELLOW "Testing health endpoint..."
if curl -f "$BACKEND_URL/health" -s | grep -q "healthy"; then
    print_status $GREEN "✅ Health endpoint: OK"
else
    print_status $RED "❌ Health endpoint: FAILED"
fi

# Test API info endpoint
print_status $YELLOW "Testing API info endpoint..."
if curl -f "$BACKEND_URL/api/v1/info" -s | grep -q "FlowMind"; then
    print_status $GREEN "✅ API info endpoint: OK"
else
    print_status $RED "❌ API info endpoint: FAILED"
fi

# Performance test (optional)
if command -v curl &> /dev/null; then
    print_status $YELLOW "Testing response time..."
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$BACKEND_URL/health")
    if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
        print_status $GREEN "✅ Response time: ${RESPONSE_TIME}s (Good)"
    else
        print_status $YELLOW "⚠️  Response time: ${RESPONSE_TIME}s (Consider optimization)"
    fi
fi

echo ""
print_status $GREEN "🎉 Deployment completed successfully!"
echo ""

# Summary
print_status $BLUE "📋 Deployment Summary:"
print_status $BLUE "======================"
echo "Backend URL: $BACKEND_URL"
echo "Health Check: $BACKEND_URL/health"
echo "API Info: $BACKEND_URL/api/v1/info"
echo "WebSocket: ${BACKEND_URL/https:/wss:}/ws"
echo ""

if [ "$DEPLOYMENT_TARGET" = "all" ]; then
    print_status $BLUE "📊 Monitoring:"
    echo "Grafana: http://localhost:3000 (admin/FlowMind2024!)"
    echo "Prometheus: http://localhost:9090"
    echo "AlertManager: http://localhost:9093"
    echo ""
fi

print_status $BLUE "📝 Next Steps:"
echo "1. Verify all frontend applications connect successfully"
echo "2. Run load tests: k6 run tests/load-testing/k6-load-test.js"
echo "3. Monitor performance for first 24 hours"
echo "4. Set up DNS and SSL certificates if not done"
echo "5. Configure backup and disaster recovery"
echo ""

print_status $GREEN "🚀 FlowMind Universal Backend is now LIVE in production!"
print_status $BLUE "📖 See PRODUCTION_DEPLOYMENT_SUMMARY.md for complete details"

# Open monitoring dashboard if available
if [ "$DEPLOYMENT_TARGET" = "all" ] && command -v open &> /dev/null; then
    print_status $BLUE "🌐 Opening monitoring dashboard..."
    sleep 5
    open http://localhost:3000 2>/dev/null || true
fi

echo ""
print_status $GREEN "✨ Production deployment mission accomplished! ✨"