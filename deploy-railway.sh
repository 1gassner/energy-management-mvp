#!/bin/bash

# Railway Deployment Script for Energy Management MVP Backend
# Jürgen Gassner - August 2025

set -e

echo "🚀 Starting Railway Deployment Process..."

# Navigate to project directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"

# Check if we're logged in to Railway
echo "👤 Checking Railway authentication..."
railway whoami

echo "🔧 Setting additional environment variables..."

# Add missing environment variables
railway variables --set "JWT_SECRET=$(openssl rand -hex 32)" --service energy-management-backend
railway variables --set "JWT_EXPIRES_IN=24h" --service energy-management-backend
railway variables --set "ALLOWED_ORIGINS=*" --service energy-management-backend
railway variables --set "BCRYPT_ROUNDS=12" --service energy-management-backend

echo "🗄️ Adding PostgreSQL database..."
# This will be handled in Railway dashboard since CLI is interactive

echo "🚀 Starting deployment..."
railway up --service energy-management-backend --detach

echo "📊 Checking deployment status..."
sleep 10
railway status

echo "🌐 Getting service URL..."
railway domain

echo "✅ Deployment process completed!"
echo "🔗 Check your Railway dashboard for the live URL"