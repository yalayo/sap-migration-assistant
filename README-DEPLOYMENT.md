# Cloudflare Deployment Guide

This guide explains how to deploy the S/4HANA Migration Assistant to Cloudflare Pages using GitHub Actions.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Neon Database**: Set up a PostgreSQL database at [neon.tech](https://neon.tech)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Set up Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "Pages" in the sidebar
3. Click "Create a project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `node build-scripts/build-cloudflare.js`
   - **Build output directory**: `dist/public`
   - **Root directory**: `/` (leave empty)

## Step 2: Configure Environment Variables

In your Cloudflare Pages project settings, add these environment variables:

### Production Environment Variables
```bash
DATABASE_URL=postgresql://your-neon-connection-string
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
NODE_ENV=production
```

### Preview Environment Variables (Optional)
```bash
DATABASE_URL=postgresql://your-preview-neon-connection-string
SESSION_SECRET=preview-session-secret
NODE_ENV=development
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
   - Account: `Cloudflare Pages:Edit`
   - Zone: `Zone:Read` (if using custom domain)

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

### Option A: Direct Cloudflare Pages
- Push to your main branch
- Cloudflare will automatically build and deploy

### Option B: GitHub Actions
- The workflow in `.github/workflows/deploy.yml` will trigger on push
- Check the Actions tab for deployment status

## Step 6: Custom Domain (Optional)

1. In Cloudflare Pages, go to "Custom domains"
2. Add your domain
3. Follow DNS setup instructions

## Local Development

Run locally with Cloudflare Pages simulation:
```bash
npm run build:cloudflare
npm run preview
```

## Troubleshooting

### Common Issues

1. **Build Fails**: Check Node.js version (should be 18+)
2. **Database Connection**: Verify DATABASE_URL format
3. **API Routes Not Working**: Ensure Functions are properly configured

### Logs

Check deployment logs in:
- Cloudflare Pages dashboard → Deployments
- GitHub Actions → Actions tab

### Environment Variables

Verify all required environment variables are set:
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`

## Architecture

- **Frontend**: React app served as static files
- **Backend**: Express.js API running on Cloudflare Pages Functions
- **Database**: PostgreSQL on Neon
- **Session Storage**: PostgreSQL-backed sessions

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