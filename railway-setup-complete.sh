#!/bin/bash

# Railway Setup Complete - Final Steps
# Energy Management MVP Backend

set -e

echo "🎯 Railway Deployment Setup - Final Steps"
echo "========================================"

# Check Railway status
echo "📊 Current Railway Status:"
railway status

echo ""
echo "🌐 Service URL: https://energy-management-backend-production.up.railway.app"

# Test health endpoint
echo ""
echo "🏥 Testing Health Endpoint..."
if curl -f -s "https://energy-management-backend-production.up.railway.app/health" > /dev/null; then
    echo "✅ Health endpoint is responding"
    curl -s "https://energy-management-backend-production.up.railway.app/health" | jq .
else
    echo "⚠️  Service not yet deployed. To complete deployment:"
    echo ""
    echo "   Option 1: Manual Railway Dashboard Deployment"
    echo "   1. Visit: https://railway.app/dashboard"
    echo "   2. Select project: tender-hand"
    echo "   3. Deploy from GitHub repository"
    echo ""
    echo "   Option 2: GitHub Integration"
    echo "   1. Push code to GitHub"
    echo "   2. Add RAILWAY_TOKEN secret"
    echo "   3. Automatic deployment on push"
    echo ""
    echo "   Option 3: Complete Database Setup"
    echo "   - Add PostgreSQL: railway add --database postgres"
    echo "   - Then redeploy: railway up --service energy-management-backend"
fi

echo ""
echo "🗄️ Database Setup Required:"
echo "- Run: railway add --database postgres"
echo "- Then: railway variables --service energy-management-backend"

echo ""
echo "🔗 Environment Variables Status:"
railway variables --service energy-management-backend --json | jq .

echo ""
echo "📝 Complete Setup Guide: ./RAILWAY_DEPLOYMENT_GUIDE.md"
echo ""
echo "✨ Railway Deployment Setup Complete!"
echo "Next: Complete database setup and verify deployment"