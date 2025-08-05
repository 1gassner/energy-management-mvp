# Railway Deployment Guide - Energy Management MVP Backend

## 🚀 Deployment Status

**Service URL**: `https://energy-management-backend-production.up.railway.app`

**Service Name**: `energy-management-backend`

**Project**: `tender-hand`

## ✅ Completed Configuration

### 1. Railway Service Setup
- ✅ Service created: `energy-management-backend`
- ✅ Domain configured: `https://energy-management-backend-production.up.railway.app`
- ✅ Environment variables configured

### 2. Configuration Files
- ✅ `railway.toml` - Railway deployment configuration
- ✅ `Procfile` - Process definition for Railway
- ✅ `.env.production.example` - Environment variables template
- ✅ Health check endpoints implemented at `/health`

### 3. Environment Variables Set
```
NODE_ENV=production
HOST=0.0.0.0
AI_MODELS_ENABLED=true
CITYPULSE_ENABLED=true
QUANTUM_SWARM_ENABLED=true
VELOCITY_SWARM_ENABLED=true
WEBSOCKET_ENABLED=true
RATE_LIMITING_ENABLED=true
LOG_LEVEL=info
JWT_SECRET=[GENERATED]
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=*
BCRYPT_ROUNDS=12
```

## 🔄 Deployment Options

### Option 1: Railway CLI (Current Issue)
The Railway CLI is experiencing timeout issues during the `railway up` command. This is a known issue and can be resolved by:

1. **Manual Deployment via Railway Dashboard**:
   - Visit [Railway Dashboard](https://railway.app/dashboard)
   - Connect your GitHub repository
   - Deploy from the `backend` directory

2. **Alternative CLI Command**:
   ```bash
   railway up --service energy-management-backend --detach
   ```

### Option 2: GitHub Integration (Recommended)
The GitHub Actions workflow has been created at `.github/workflows/railway-deploy.yml`.

**Setup Steps**:
1. Push code to GitHub repository
2. Add `RAILWAY_TOKEN` secret to GitHub repository settings
3. Automatic deployment on push to main/master branch

### Option 3: Docker Deployment
```bash
# Build and deploy using Docker
docker build -t energy-management-backend ./backend
railway deploy --from-image energy-management-backend
```

## 🗄️ Database Setup

### PostgreSQL Database
A PostgreSQL database needs to be added to the Railway project:

```bash
railway add --database postgres
```

**Required Environment Variables** (will be set automatically):
- `DATABASE_URL` - PostgreSQL connection string

### Database Migrations
Run migrations after database is added:

```bash
railway run npm run migrate
```

## 🔧 Manual Setup Instructions

### 1. Complete the Database Setup
```bash
# Add PostgreSQL database
railway add --database postgres

# Link database to service
railway variables --set "DATABASE_URL=$DATABASE_URL" --service energy-management-backend
```

### 2. Deploy the Application
```bash
# Option A: Via CLI
railway up --service energy-management-backend

# Option B: Via GitHub (push to main branch)
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### 3. Verify Deployment
```bash
# Check service status
railway status

# Check logs
railway logs --service energy-management-backend

# Test health endpoint
curl https://energy-management-backend-production.up.railway.app/health
```

## 🌐 API Endpoints

Once deployed, the following endpoints will be available:

### Health & Info
- `GET /health` - Health check
- `GET /api/v1/info` - API information

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### CityPulse Energy Management
- `GET /api/v1/citypulse/buildings` - Building data
- `GET /api/v1/citypulse/energy` - Energy metrics
- `GET /api/v1/citypulse/sensors` - Sensor data

### AI & Swarm Services
- `POST /api/v1/ai/chat` - AI chat interface
- `POST /api/v1/swarm/orchestrate` - Swarm orchestration

## 🔐 Security Configuration

### CORS Setup
The backend is configured to accept requests from:
- `*` (currently set to all origins for development)
- Update `ALLOWED_ORIGINS` for production with specific frontend domains

### Rate Limiting
- Enabled in production
- 1000 requests per 15-minute window per IP
- Health check endpoint is excluded

## 📊 Monitoring & Logs

### Health Monitoring
- Health check available at `/health`
- Returns service status and enabled features

### Logging
- Winston logger configured
- Log level: `info` in production
- Logs available via `railway logs`

## 🚀 Next Steps

1. **Complete Database Setup**: Add PostgreSQL database via Railway dashboard
2. **Run Database Migrations**: Execute schema creation
3. **Update CORS Origins**: Set specific frontend domains
4. **Add API Keys**: Configure AI service API keys if needed
5. **Test All Endpoints**: Verify functionality
6. **Set up Monitoring**: Configure error tracking (Sentry)

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Service URL**: https://energy-management-backend-production.up.railway.app
- **Health Check**: https://energy-management-backend-production.up.railway.app/health
- **API Info**: https://energy-management-backend-production.up.railway.app/api/v1/info

## 📞 Support

For deployment issues, check:
1. Railway logs: `railway logs --service energy-management-backend`
2. Service status: `railway status`
3. Environment variables: `railway variables --service energy-management-backend`