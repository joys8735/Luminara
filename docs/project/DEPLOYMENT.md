# Deployment & Setup Guide - Luminara

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Production Checklist](#production-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Local Development Setup

### Prerequisites

```bash
# Check Node.js version (18+)
node --version

# Check npm version (9+)
npm --version

# Install Git
git --version
```

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/luminara.git
cd luminara
```

### Step 2: Install Frontend Dependencies

```bash
# Install dependencies
npm install

# Verify installation
npm list react react-dom
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Create Environment Files

**Frontend (.env)**:
```bash
cp .env.example .env
```

**Backend (.env)**:
```bash
cp backend/.env.example backend/.env
```

### Step 5: Configure Environment Variables

**Frontend (.env)**:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Backend
VITE_BACKEND_URL=http://localhost:4000

# Blockchain
VITE_CHAIN_ID=97
VITE_RPC_URL=https://data-seed-prebsc-1-1.binance.org:8545
```

**Backend (.env)**:
```env
# Server
PORT=4000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Session
SESSION_SECRET=your-session-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI APIs
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
DEEPSEEK_API_KEY=your-deepseek-key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Blockchain
BSC_RPC_URL=https://data-seed-prebsc-1-1.binance.org:8545
```

### Step 6: Start Development Servers

**Terminal 1 - Frontend**:
```bash
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend**:
```bash
cd backend
npm start
# Runs on http://localhost:4000
```

### Step 7: Verify Setup

```bash
# Check frontend
curl http://localhost:5173

# Check backend
curl http://localhost:4000/api/health

# Check database connection
# Visit Supabase dashboard
```

---

## Environment Configuration

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456.apps.googleusercontent.com` |
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:4000` |
| `VITE_CHAIN_ID` | Blockchain chain ID | `97` (testnet) or `56` (mainnet) |
| `VITE_RPC_URL` | Blockchain RPC URL | `https://data-seed-prebsc-1-1.binance.org:8545` |

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development`, `production` |
| `SESSION_SECRET` | Session encryption key | `random-secret-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `DEEPSEEK_API_KEY` | DeepSeek API key | `sk-...` |
| `SUPABASE_URL` | Supabase URL | `https://abc.supabase.co` |
| `SUPABASE_KEY` | Supabase service role key | `eyJhbGc...` |
| `BSC_RPC_URL` | BSC RPC endpoint | `https://bsc-dataseed.binance.org` |

### Environment by Stage

**Development**:
```env
NODE_ENV=development
VITE_CHAIN_ID=97
VITE_BACKEND_URL=http://localhost:4000
```

**Staging**:
```env
NODE_ENV=staging
VITE_CHAIN_ID=97
VITE_BACKEND_URL=https://staging-api.luminara.dev
```

**Production**:
```env
NODE_ENV=production
VITE_CHAIN_ID=56
VITE_BACKEND_URL=https://api.luminara.dev
```

---

## Database Setup

### Supabase Project Creation

1. **Create Account**
   - Visit https://supabase.com
   - Sign up with email or GitHub

2. **Create Project**
   - Click "New Project"
   - Enter project name
   - Set password
   - Select region (closest to users)
   - Click "Create new project"

3. **Get Credentials**
   - Go to Settings → API
   - Copy `Project URL`
   - Copy `anon public` key
   - Copy `service_role` key

### Database Schema Setup

1. **Access SQL Editor**
   - Go to SQL Editor in Supabase dashboard
   - Click "New Query"

2. **Run Migrations**
   - Copy content from `src/points/migrations/supabase-schema.sql`
   - Paste into SQL editor
   - Click "Run"

3. **Verify Tables**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Row-Level Security (RLS) Setup

1. **Enable RLS on Tables**
   ```sql
   ALTER TABLE points ENABLE ROW LEVEL SECURITY;
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
   ```

2. **Create Policies**
   ```sql
   -- Users can only see their own points
   CREATE POLICY "Users can view own points"
   ON points FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Users can only see their own transactions
   CREATE POLICY "Users can view own transactions"
   ON transactions FOR SELECT
   USING (auth.uid() = user_id);
   ```

3. **Service Role Access**
   ```sql
   -- Service role can access all data
   CREATE POLICY "Service role can access all"
   ON points FOR ALL
   USING (auth.role() = 'service_role');
   ```

### Authentication Setup

1. **Enable Google OAuth**
   - Go to Authentication → Providers
   - Click "Google"
   - Enter Google Client ID and Secret
   - Click "Save"

2. **Configure Redirect URLs**
   - Go to Authentication → URL Configuration
   - Add redirect URLs:
     - `http://localhost:5173/auth/callback`
     - `https://luminara.vercel.app/auth/callback`
     - `https://luminara.dev/auth/callback`

---

## Frontend Deployment

### Vercel Deployment

#### Step 1: Connect Repository

1. Visit https://vercel.com
2. Click "New Project"
3. Select GitHub repository
4. Click "Import"

#### Step 2: Configure Environment

1. Go to Settings → Environment Variables
2. Add all `VITE_*` variables:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_GOOGLE_CLIENT_ID=...
   VITE_BACKEND_URL=...
   VITE_CHAIN_ID=56
   ```

#### Step 3: Configure Build

1. Go to Settings → Build & Development Settings
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Set Install Command: `npm install`

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at `https://your-project.vercel.app`

#### Step 5: Custom Domain

1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records
4. Verify domain

### Alternative: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod

# Configure environment variables in Netlify dashboard
```

### Alternative: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## Backend Deployment

### Railway Deployment

#### Step 1: Create Account
- Visit https://railway.app
- Sign up with GitHub

#### Step 2: Create Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Click "Deploy"

#### Step 3: Configure Environment
1. Go to Variables
2. Add all environment variables:
   ```
   PORT=4000
   FRONTEND_URL=https://luminara.vercel.app
   NODE_ENV=production
   SESSION_SECRET=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   OPENAI_API_KEY=...
   GEMINI_API_KEY=...
   DEEPSEEK_API_KEY=...
   SUPABASE_URL=...
   SUPABASE_KEY=...
   BSC_RPC_URL=...
   ```

#### Step 4: Deploy
- Railway automatically deploys on push to main
- Monitor deployment in dashboard

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set PORT=4000
heroku config:set FRONTEND_URL=https://luminara.vercel.app
heroku config:set NODE_ENV=production
# ... set all other variables

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
```

**Build and Deploy**:
```bash
# Build image
docker build -t luminara-backend .

# Run container
docker run -p 4000:4000 \
  -e PORT=4000 \
  -e FRONTEND_URL=https://luminara.vercel.app \
  -e NODE_ENV=production \
  luminara-backend
```

---

## Production Checklist

### Pre-Deployment

- [ ] All tests passing: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] RLS policies configured
- [ ] OAuth credentials set up
- [ ] API keys configured
- [ ] SSL certificates valid
- [ ] Backups configured

### Deployment

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Heroku
- [ ] Database backups created
- [ ] DNS records updated
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Logging configured
- [ ] Error tracking enabled

### Post-Deployment

- [ ] Verify frontend loads
- [ ] Verify backend API responds
- [ ] Test wallet connection
- [ ] Test authentication
- [ ] Test points system
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Verify backups

### Security

- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secrets not in code

### Performance

- [ ] CDN configured
- [ ] Caching enabled
- [ ] Database indexes created
- [ ] Images optimized
- [ ] Code minified
- [ ] Gzip compression enabled
- [ ] Load testing passed
- [ ] Performance monitoring enabled

---

## Monitoring & Maintenance

### Monitoring Setup

#### Frontend Monitoring

**Sentry Setup**:
```bash
npm install @sentry/react @sentry/tracing
```

**Configure in App.tsx**:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Backend Monitoring

**Datadog Setup**:
```bash
npm install dd-trace
```

**Configure in index.js**:
```javascript
const tracer = require('dd-trace').init();
```

### Logging

**Frontend Logs**:
- Console logs (development)
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance (Web Vitals)

**Backend Logs**:
```javascript
// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Error logging
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal error' });
});
```

### Backup Strategy

**Database Backups**:
- Supabase automatic daily backups
- Manual backups before major changes
- Backup retention: 30 days

**Code Backups**:
- GitHub repository (primary)
- Automated backups to S3

### Maintenance Tasks

**Daily**:
- Monitor error logs
- Check system health
- Verify backups

**Weekly**:
- Review performance metrics
- Check security logs
- Update dependencies

**Monthly**:
- Full system audit
- Performance optimization
- Security review
- Backup verification

### Scaling

**Horizontal Scaling**:
```
Load Balancer
├── Backend Instance 1
├── Backend Instance 2
└── Backend Instance N
```

**Vertical Scaling**:
- Increase server resources
- Upgrade database tier
- Increase API rate limits

### Disaster Recovery

**Recovery Plan**:
1. Identify issue
2. Activate backup
3. Restore from backup
4. Verify data integrity
5. Resume operations
6. Post-incident review

**RTO/RPO**:
- Recovery Time Objective: 1 hour
- Recovery Point Objective: 1 hour

---

## Troubleshooting

### Frontend Issues

**Build fails**:
```bash
rm -rf node_modules
npm cache clean --force
npm install
npm run build
```

**Port already in use**:
```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Backend Issues

**Port already in use**:
```bash
# Find process using port 4000
lsof -i :4000

# Kill process
kill -9 <PID>
```

**Database connection error**:
- Verify Supabase URL and key
- Check network connectivity
- Verify RLS policies
- Check user permissions

### Deployment Issues

**Vercel build fails**:
- Check build logs
- Verify environment variables
- Check Node.js version
- Clear build cache

**Railway deployment fails**:
- Check deployment logs
- Verify environment variables
- Check GitHub permissions
- Verify Procfile

---

## Support

- **Documentation**: See PROJECT_DOCUMENTATION.md
- **Issues**: GitHub Issues
- **Email**: support@luminara.dev
- **Discord**: [Join Community](https://discord.gg/luminara)

---

**Last Updated**: February 4, 2026
