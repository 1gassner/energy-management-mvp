#!/bin/bash

# Force Vercel deployment with cache busting
# This script addresses the single bundle deployment issue

echo "🚀 Starting Vercel deployment with cache busting..."

# Step 1: Clean local build
cd frontend
echo "📦 Cleaning local build artifacts..."
rm -rf dist node_modules/.vite .vite

# Step 2: Fresh install
echo "📥 Installing dependencies..."
npm ci

# Step 3: Clean build
echo "🔨 Building with cache busting..."
npm run build

# Step 4: Verify single bundle was created
echo "✅ Verifying build output..."
ls -la dist/assets/js/

if ls dist/assets/js/index-*.js 1> /dev/null 2>&1; then
    echo "✅ Single bundle created successfully"
else
    echo "❌ ERROR: Single bundle not found!"
    exit 1
fi

# Step 5: Update build comment for cache busting
cd ..
TIMESTAMP=$(date +%s)
sed -i.bak "s/Single bundle build v[0-9]*/Single bundle build v$TIMESTAMP/g" vercel.json
rm vercel.json.bak 2>/dev/null || true

echo "🎯 Updated build comment with timestamp: $TIMESTAMP"

# Step 6: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment complete!"
echo "🔍 Check the deployment at your Vercel domain"