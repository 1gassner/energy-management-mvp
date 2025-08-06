#!/bin/bash

# 🔐 PRODUCTION SECRETS GENERATOR
# Generates cryptographically secure secrets for production deployment
# Usage: ./scripts/generate-production-secrets.sh

set -euo pipefail

echo "🔐 Generating Production Secrets for Energy Management MVP..."
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check dependencies
command -v openssl >/dev/null 2>&1 || { echo -e "${RED}Error: openssl is required but not installed.${NC}" >&2; exit 1; }

# Create secrets directory
mkdir -p secrets/

echo -e "${BLUE}Generating Backend Secrets...${NC}"

# Generate JWT Secret (64 bytes, base64 encoded)
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
echo "JWT_SECRET=${JWT_SECRET}" > secrets/.env.production.backend

# Generate Session Secret (32 bytes, hex encoded)  
SESSION_SECRET=$(openssl rand -hex 32)
echo "SESSION_SECRET=${SESSION_SECRET}" >> secrets/.env.production.backend

# Generate API Keys (for internal services)
API_KEY_V1=$(openssl rand -base64 32 | tr -d '\n')
echo "INTERNAL_API_KEY=${API_KEY_V1}" >> secrets/.env.production.backend

# Generate Database Encryption Key
DB_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')
echo "DATABASE_ENCRYPTION_KEY=${DB_ENCRYPTION_KEY}" >> secrets/.env.production.backend

# Generate CSRF Secret
CSRF_SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo "CSRF_SECRET=${CSRF_SECRET}" >> secrets/.env.production.backend

echo -e "${BLUE}Generating Frontend Secrets...${NC}"

# Generate Client-side encryption keys (for local storage encryption)
CLIENT_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')
echo "VITE_CLIENT_ENCRYPTION_KEY=${CLIENT_ENCRYPTION_KEY}" > secrets/.env.production.frontend

# Generate Analytics Salt (for user privacy)
ANALYTICS_SALT=$(openssl rand -hex 16)
echo "VITE_ANALYTICS_SALT=${ANALYTICS_SALT}" >> secrets/.env.production.frontend

echo -e "${BLUE}Creating Production Environment Files...${NC}"

# Backend Production Environment
cat > secrets/.env.production.backend.complete << EOF
# 🔐 PRODUCTION ENVIRONMENT - Energy Management MVP Backend
# Generated: $(date)
# SECURITY: Never commit this file to version control!

# Server Configuration
NODE_ENV=production
PORT=\${PORT:-8000}
HOST=0.0.0.0

# Database Configuration (Supabase)
SUPABASE_URL=\${SUPABASE_URL}
SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}

# Security Secrets (GENERATED - DO NOT CHANGE)
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
INTERNAL_API_KEY=${API_KEY_V1}
DATABASE_ENCRYPTION_KEY=${DB_ENCRYPTION_KEY}
CSRF_SECRET=${CSRF_SECRET}

# JWT Configuration
JWT_EXPIRES_IN=24h
JWT_ALGORITHM=HS512
JWT_ISSUER=energy-management-mvp
JWT_AUDIENCE=citypulse-hechingen

# CORS Configuration (Production URLs only)
ALLOWED_ORIGINS=https://citypulse-hechingen.vercel.app,https://energy-management-mvp.vercel.app
WEBSOCKET_CORS_ORIGINS=https://citypulse-hechingen.vercel.app,https://energy-management-mvp.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_STRICT_MODE=true

# Security Headers
HSTS_MAX_AGE=31536000
CSP_REPORT_URI=https://citypulse-hechingen.report-uri.com/r/d/csp/enforce

# Logging
LOG_LEVEL=warn
LOG_FORMAT=json
ENABLE_REQUEST_LOGGING=true

# Security
BCRYPT_SALT_ROUNDS=14
ENABLE_HELMET=true
ENABLE_COMPRESSION=true
TRUST_PROXY=true

# Feature Flags
AI_MODELS_ENABLED=false
CITYPULSE_ENABLED=true
WEBSOCKET_ENABLED=true
RATE_LIMITING_ENABLED=true
MOCK_DATA_ENABLED=false

# External APIs (Set your own keys)
WEATHER_API_KEY=\${WEATHER_API_KEY}
OPENAI_API_KEY=\${OPENAI_API_KEY}
ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}

# Railway/Deployment
RAILWAY_STATIC_URL=\${RAILWAY_STATIC_URL}
HEALTH_CHECK_PATH=/api/health
EOF

# Frontend Production Environment
cat > secrets/.env.production.frontend.complete << EOF
# 🔐 PRODUCTION ENVIRONMENT - Energy Management MVP Frontend
# Generated: $(date)
# SECURITY: Never commit this file to version control!

# Application Configuration
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0

# API Configuration (Production URLs)
VITE_API_URL=https://energy-management-backend.railway.app/api
VITE_WS_URL=wss://energy-management-backend.railway.app/ws
VITE_USE_MOCK=false

# Security (Client-side)
VITE_CLIENT_ENCRYPTION_KEY=${CLIENT_ENCRYPTION_KEY}
VITE_ANALYTICS_SALT=${ANALYTICS_SALT}
VITE_CSRF_ENABLED=true

# Performance
VITE_ENABLE_BUNDLE_ANALYZER=false
VITE_ENABLE_SOURCE_MAPS=false
VITE_CACHE_ASSETS=true

# Feature Flags
VITE_ENABLE_DEV_TOOLS=false
VITE_ENABLE_DEBUG_LOGS=false
VITE_DEMO_MODE=false

# External Services (Set your own keys)
VITE_SENTRY_DSN=\${VITE_SENTRY_DSN}
VITE_GOOGLE_ANALYTICS_ID=\${VITE_GOOGLE_ANALYTICS_ID}
VITE_OPENWEATHER_API_KEY=\${VITE_OPENWEATHER_API_KEY}

# CSP Configuration
VITE_CSP_REPORT_URI=https://citypulse-hechingen.report-uri.com/r/d/csp/enforce
EOF

echo -e "${GREEN}✅ Production secrets generated successfully!${NC}"
echo ""
echo -e "${YELLOW}📁 Generated Files:${NC}"
echo "   - secrets/.env.production.backend.complete"
echo "   - secrets/.env.production.frontend.complete"
echo ""
echo -e "${RED}⚠️  IMPORTANT SECURITY NOTES:${NC}"
echo "   1. Never commit secrets/ directory to version control"
echo "   2. Set these environment variables in your deployment platform:"
echo "      - Railway: Use the Variables tab"
echo "      - Vercel: Use the Environment Variables section"
echo "   3. Replace placeholder values (marked with \${}) with actual values"
echo "   4. Store backup copies in a secure password manager"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "   1. Copy contents to your deployment platform"
echo "   2. Replace placeholder values with real API keys"
echo "   3. Verify CORS origins match your domains"
echo "   4. Test the configuration in staging first"
echo ""
echo -e "${GREEN}🔐 Security Level: PRODUCTION READY${NC}"

# Create .gitignore entry
echo "" >> .gitignore
echo "# Production Secrets (NEVER COMMIT)" >> .gitignore
echo "secrets/" >> .gitignore
echo ".env.production*" >> .gitignore

echo -e "${GREEN}✅ Added secrets/ to .gitignore${NC}"