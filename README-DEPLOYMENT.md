# Docker Deployment Guide

This guide explains how to containerize and deploy the S/4HANA Migration Assistant using Docker. The application is ready for deployment to various Docker-compatible platforms.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Neon Database**: Set up a PostgreSQL database at [neon.tech](https://neon.tech)
3. **GitHub Repository**: Push your code to GitHub
4. **Docker**: Ensure Docker is available for local testing

## Step 1: Choose Your Deployment Platform

The Docker container can be deployed to various platforms:

### Option A: Railway (Recommended)
1. Visit [Railway](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect the Dockerfile
4. Configure environment variables in Railway dashboard

### Option B: Render
1. Visit [Render](https://render.com)
2. Create a new Web Service from GitHub
3. Select Docker environment
4. Configure environment variables

### Option C: Cloudflare Container Workers (Preview)
1. Wait for general availability (coming June 2025)
2. Use the provided wrangler.toml configuration
3. Deploy with `wrangler deploy`

## Step 2: Configure Environment Variables

In your Cloudflare Worker settings, add these environment variables:

### Production Environment Variables
```bash
DATABASE_URL=postgresql://your-neon-connection-string
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
NODE_ENV=production
PORT=8080
```

### Preview Environment Variables (Optional)
```bash
DATABASE_URL=postgresql://your-preview-neon-connection-string
SESSION_SECRET=preview-session-secret
NODE_ENV=development
PORT=8080
```

## Step 3: Set up GitHub Actions (Alternative)

If you prefer GitHub Actions deployment, add these secrets to your repository:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Get from Cloudflare → My Profile → API Tokens
   - `CLOUDFLARE_ACCOUNT_ID`: Found in Cloudflare dashboard sidebar

### Creating Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" with these permissions:
   - Account: `Cloudflare Workers:Edit`
   - Zone: `Zone:Read` (if using custom domain)
   - Account: `Account Settings:Read`

## Step 4: Database Setup

1. **Create Neon Database**:
   ```bash
   # Get your connection string from Neon dashboard
   DATABASE_URL="postgresql://username:password@ep-xxx.region.neon.tech/dbname"
   ```

2. **Run Database Migrations**:
   ```bash
   npm run db:push
   ```

## Step 5: Deploy

### Option A: Automated Testing
- Push to your main branch
- The workflow in `.github/workflows/deploy.yml` will trigger automatically
- GitHub Actions will build the Docker image and test it
- Check the Actions tab for build status
- Use the tested image for manual deployment to your chosen platform

### Option B: Manual Deployment
```bash
# Build the application
npm run build

# Build Docker image
docker build -t s4hana-migration-assistant .

# Test locally
docker run -p 8080:8080 \
  -e DATABASE_URL="your-database-url" \
  -e SESSION_SECRET="your-session-secret" \
  s4hana-migration-assistant

# Deploy to your chosen platform (Railway, Render, etc.)
# Follow platform-specific deployment guides
```

## Step 6: Custom Domain (Optional)

1. In Cloudflare Workers, go to "Settings" → "Triggers"
2. Add a custom domain route
3. Configure DNS settings as instructed

## Local Development

### Option A: Development Server
```bash
npm run dev
```

### Option B: Docker Development
```bash
# Use the provided test script
./scripts/local-docker-test.sh

# Or manually:
docker build -t s4hana-migration-assistant .
docker run -p 8080:8080 \
  -e NODE_ENV=development \
  -e DATABASE_URL="your-local-database-url" \
  -e SESSION_SECRET="development-secret" \
  s4hana-migration-assistant
```

### Option C: Docker Compose
```bash
docker-compose up
```

## Troubleshooting

### Common Issues

1. **Build Fails**: 
   - Check Node.js version (should be 20+ for Wrangler compatibility)
   - Ensure development dependencies are installed during Docker build
   - Verify `vite` and `esbuild` are available in the build stage

2. **Database Connection**: 
   - Verify DATABASE_URL format
   - Check Neon database connectivity
   - Ensure environment variables are properly set

3. **Docker Build Issues**:
   - "vite: not found" error: Fixed by installing dev dependencies during build
   - Permission errors: Ensure proper user permissions in Dockerfile
   - Health check failures: Verify `/api/health` endpoint is accessible

### Logs

Check deployment logs in:
- Cloudflare Workers dashboard → Logs
- GitHub Actions → Actions tab
- Docker container logs: `docker logs <container-id>`

### Environment Variables

Verify all required environment variables are set:
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`

## Architecture

- **Frontend**: React app served from Express.js (full-stack in one container)
- **Backend**: Express.js API running on Cloudflare Workers with Docker
- **Database**: PostgreSQL on Neon with connection pooling
- **Session Storage**: PostgreSQL-backed sessions
- **Container**: Full Node.js application in Alpine Linux Docker image

## Performance

- **CDN**: Cloudflare's global network
- **Serverless**: Auto-scaling Pages Functions
- **Database**: Neon's serverless PostgreSQL
- **Caching**: Automatic static asset caching

## Security

- Environment variables are encrypted
- HTTPS enabled by default
- Database connections are secure
- Session secrets should be strong (32+ characters)