#!/bin/bash

# D1 Migration Setup Script for S/4HANA Migration Assistant
# This script sets up the complete D1 database migration pipeline

set -e

echo "🚀 Setting up Cloudflare D1 database migration..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Generate migrations from SQLite schema
echo "📝 Generating D1 migrations..."
npx drizzle-kit generate --config=drizzle-d1.config.ts

if [ $? -eq 0 ]; then
    echo "✅ D1 migrations generated successfully!"
else
    echo "❌ Failed to generate migrations. Please check your schema."
    exit 1
fi

# Set up local SQLite database for development
echo "🔧 Setting up local development database..."
npx tsx scripts/setup-local-d1.ts

if [ $? -eq 0 ]; then
    echo "✅ Local D1 development database ready!"
else
    echo "❌ Failed to setup local database."
    exit 1
fi

echo ""
echo "🎉 D1 migration setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create your D1 databases:"
echo "   wrangler d1 create s4hana-migration-db"
echo "   wrangler d1 create s4hana-migration-db-preview"
echo ""
echo "2. Update wrangler-d1.toml with your database IDs"
echo ""
echo "3. Apply migrations to D1:"
echo "   wrangler d1 migrations apply s4hana-migration-db"
echo "   wrangler d1 migrations apply s4hana-migration-db-preview --env preview"
echo ""
echo "4. Deploy to Cloudflare Workers:"
echo "   npm run build:d1"
echo "   wrangler deploy --config=wrangler-d1.toml"
echo ""
echo "🔗 Documentation: See scripts/d1-commands.md for detailed commands"