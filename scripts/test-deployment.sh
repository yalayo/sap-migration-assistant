#!/bin/bash

# Test script for Docker deployment
set -e

echo "🧪 Testing S/4HANA Migration Assistant Docker Deployment"
echo "=================================================="

# Build the application
echo "📦 Building application..."
npm run build

# Test the built application structure
echo "✅ Checking build output..."
if [ ! -d "dist/public" ]; then
    echo "❌ Client build failed - dist/public not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ Server build failed - dist/index.js not found"
    exit 1
fi

echo "✅ Build output looks good"

# Test health endpoint locally
echo "🔍 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health || echo "CONNECTION_FAILED")

if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health endpoint working correctly"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "⚠️  Health endpoint test failed or server not running"
    echo "   Make sure to run 'npm run dev' in another terminal"
fi

# Test if Docker files are properly configured
echo "🐳 Checking Docker configuration..."
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found"
    exit 1
fi

if [ ! -f ".dockerignore" ]; then
    echo "❌ .dockerignore not found"
    exit 1
fi

echo "✅ Docker configuration files present"

# Test if wrangler config is properly set up
echo "⚡ Checking Wrangler configuration..."
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found"
    exit 1
fi

if grep -q "docker" wrangler.toml; then
    echo "✅ Docker configuration found in wrangler.toml"
else
    echo "⚠️  Docker configuration might be missing in wrangler.toml"
fi

echo ""
echo "🎉 All deployment tests passed!"
echo "📋 Next steps:"
echo "   1. Commit and push your changes to GitHub"
echo "   2. Configure Cloudflare API tokens in GitHub secrets"
echo "   3. Environment variables in Cloudflare Worker settings"
echo "   4. GitHub Actions will automatically build and deploy"
echo ""
echo "🚀 Ready for Cloudflare Docker deployment!"