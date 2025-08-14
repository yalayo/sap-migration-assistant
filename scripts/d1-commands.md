# Cloudflare D1 Database Setup Commands

This guide shows how to set up and manage the D1 database for the S/4HANA Migration Assistant.

## 1. Create D1 Database

```bash
# Create production database
wrangler d1 create s4hana-migration-db

# Create preview/staging database
wrangler d1 create s4hana-migration-db-preview
```

After creation, update `wrangler-d1.toml` with the database IDs from the output.

## 2. Generate and Apply Migrations

```bash
# Generate migrations from schema
npm run db:d1:generate

# Apply migrations to production D1 database
wrangler d1 migrations apply s4hana-migration-db

# Apply migrations to preview D1 database
wrangler d1 migrations apply s4hana-migration-db-preview --env preview
```

## 3. Local Development Setup

```bash
# Set up local SQLite database for development
npm run db:d1:setup

# Generate migrations for local development
npm run db:d1:generate
```

## 4. Database Management Commands

```bash
# List all D1 databases
wrangler d1 list

# Execute SQL directly on D1 database
wrangler d1 execute s4hana-migration-db --command="SELECT COUNT(*) FROM users;"

# Export database data
wrangler d1 export s4hana-migration-db --output=backup.sql

# Query database interactively
wrangler d1 execute s4hana-migration-db --command="SELECT * FROM users LIMIT 5;"
```

## 5. Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:d1:generate": "tsx scripts/generate-d1-migrations.ts",
    "db:d1:setup": "tsx scripts/setup-local-d1.ts",
    "db:d1:push": "wrangler d1 migrations apply s4hana-migration-db",
    "db:d1:studio": "drizzle-kit studio --config=drizzle-d1.config.ts"
  }
}
```

## 6. Environment Variables

Set these environment variables for D1 operations:

```bash
# For wrangler operations
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export D1_DATABASE_ID="your-d1-database-id"

# For local development
export DATABASE_TYPE="sqlite"
export NODE_ENV="development"
```

## 7. Production Deployment

```bash
# Deploy to Cloudflare Workers with D1
wrangler deploy --config=wrangler-d1.toml

# Check deployment logs
wrangler tail

# Test the deployment
curl https://your-worker.your-subdomain.workers.dev/api/health
```

## 8. Data Migration from PostgreSQL

If you need to migrate existing data from PostgreSQL to D1:

```bash
# Export data from PostgreSQL
pg_dump --data-only --inserts your-postgres-db > postgres-data.sql

# Convert PostgreSQL data to SQLite format
# (This may require manual conversion of data types)

# Import data to D1
wrangler d1 execute s4hana-migration-db --file=converted-data.sql
```