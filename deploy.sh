#!/bin/bash

# Energy Management MVP - Deployment Script

echo "🚀 Starting Energy Management MVP Deployment..."

# 1. Build Docker Image
echo "📦 Building Docker image..."
docker build -f Dockerfile.nginx -t energy-management:latest .

# 2. Stop existing container
echo "🛑 Stopping existing container..."
docker stop energy-management 2>/dev/null || true
docker rm energy-management 2>/dev/null || true

# 3. Create SSL directory if not exists
echo "🔐 Setting up SSL..."
mkdir -p ssl

# 4. Start new container
echo "🚀 Starting new container..."
docker run -d \
  --name energy-management \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/ssl:/etc/nginx/ssl:ro \
  -v $(pwd)/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  energy-management:latest

# 5. Check status
echo "✅ Checking deployment status..."
sleep 3
if docker ps | grep -q energy-management; then
    echo "✨ Deployment successful!"
    echo "🌐 Application running at:"
    echo "   HTTP:  http://localhost"
    echo "   HTTPS: https://localhost"
else
    echo "❌ Deployment failed!"
    docker logs energy-management
fi