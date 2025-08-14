# Cloudflare D1 Database Migration Guide

This guide explains how to migrate the S/4HANA Migration Assistant from PostgreSQL to Cloudflare D1 (SQLite) database for serverless deployment.

## Overview

We've created a complete parallel database setup that maintains feature parity while adapting to SQLite/D1 constraints:

- **SQLite Schema**: Converted PostgreSQL schema to SQLite-compatible format
- **D1 Storage Layer**: New storage interface optimized for D1 operations  
- **Migration Scripts**: Automated setup and deployment scripts
- **Local Development**: SQLite-based local development environment

## Key Changes from PostgreSQL to SQLite

### Data Types
- **UUID → TEXT**: SQLite uses text-based UUIDs with `lower(hex(randomblob(16)))`
- **JSONB → TEXT**: JSON stored as text with `{ mode: "json" }` for type safety
- **TIMESTAMP → INTEGER**: Unix timestamps for better SQLite compatibility
- **BOOLEAN → INTEGER**: Boolean values stored as 0/1 with proper typing

### Schema Adaptations
- **Primary Keys**: Text-based UUIDs instead of PostgreSQL UUIDs
- **Timestamps**: Unix timestamp integers with SQLite `strftime` functions
- **JSON Fields**: Text fields with JSON mode for automatic parsing
- **Foreign Keys**: Text references instead of UUID references

## Migration Steps

### 1. Automatic Setup
```bash
# Run the complete setup script
./scripts/d1-migration-setup.sh
```

This script will:
- Generate D1 migrations from schema
- Set up local SQLite database
- Create necessary migration files

### 2. Create Cloudflare D1 Databases
```bash
# Create production database
wrangler d1 create s4hana-migration-db

# Create preview/staging database  
wrangler d1 create s4hana-migration-db-preview
```

After creation, update `wrangler-d1.toml` with the database IDs from the output.

### 3. Apply Migrations
```bash
# Apply to production D1
wrangler d1 migrations apply s4hana-migration-db

# Apply to preview D1
wrangler d1 migrations apply s4hana-migration-db-preview --env preview
```

### 4. Deploy to Cloudflare Workers
```bash
# Build for D1 deployment
npm run build:d1

# Deploy to Cloudflare
wrangler deploy --config=wrangler-d1.toml
```

## File Structure

```
├── shared/
│   ├── schema.ts          # Original PostgreSQL schema
│   └── schema-sqlite.ts   # New SQLite/D1 schema
├── server/
│   ├── db.ts              # PostgreSQL connection
│   ├── db-d1.ts           # D1/SQLite connection
│   ├── storage.ts         # PostgreSQL storage layer
│   ├── storage-d1.ts      # D1 storage layer
│   └── cloudflare-worker.ts # D1 Worker entry point
├── scripts/
│   ├── generate-d1-migrations.ts
│   ├── setup-local-d1.ts
│   └── d1-migration-setup.sh
├── drizzle.config.ts      # PostgreSQL config
├── drizzle-d1.config.ts   # D1 config
├── wrangler.toml          # Standard Workers config
└── wrangler-d1.toml       # D1 Workers config
```

## Environment Configuration

### Local Development
```bash
# Use SQLite for local development
export DATABASE_TYPE="sqlite"
export NODE_ENV="development"
```

### Production (Cloudflare Workers)
```bash
# Set in wrangler-d1.toml or Cloudflare dashboard
DATABASE_TYPE="d1"
SESSION_SECRET="your-production-secret"
```

## Data Migration (if needed)

If you have existing PostgreSQL data to migrate:

### 1. Export PostgreSQL Data
```bash
# Export structure and data
pg_dump --data-only --inserts your-postgres-db > postgres-data.sql
```

### 2. Convert to SQLite Format
```bash
# Manual conversion needed for:
# - UUID format changes (uuid to text)
# - Timestamp format (timestamptz to unix timestamp)  
# - JSON format (jsonb to text)
```

### 3. Import to D1
```bash
# After conversion
wrangler d1 execute s4hana-migration-db --file=converted-data.sql
```

## Available Commands

### Development
```bash
# Setup local D1 environment
./scripts/d1-migration-setup.sh

# Generate migrations
npx tsx scripts/generate-d1-migrations.ts

# Setup local database
npx tsx scripts/setup-local-d1.ts
```

### Production Management
```bash
# List D1 databases
wrangler d1 list

# Execute SQL directly
wrangler d1 execute s4hana-migration-db --command="SELECT COUNT(*) FROM users;"

# View database schema
wrangler d1 execute s4hana-migration-db --command=".schema"

# Export backup
wrangler d1 export s4hana-migration-db --output=backup.sql
```

### Debugging
```bash
# Worker logs
wrangler tail

# Test health endpoint
curl https://your-worker.your-subdomain.workers.dev/api/health

# Check local SQLite
sqlite3 dev.db ".tables"
```

## Key Benefits

### Performance
- **Faster Queries**: SQLite local reads with global edge caching
- **Low Latency**: Data replicated to 300+ Cloudflare locations
- **Zero Connection Overhead**: No connection pooling needed

### Cost & Scaling  
- **Free Tier**: 100,000 reads/day, 1,000 writes/day
- **Automatic Scaling**: Handles traffic spikes without configuration
- **No Maintenance**: Fully managed database service

### Development Experience
- **Local Development**: Full SQLite database for offline work
- **Version Control**: Database schema changes tracked in git
- **Migration Safety**: Drizzle Kit handles schema evolution

## Troubleshooting

### Common Issues

1. **Migration Generation Fails**
   ```bash
   # Ensure schema is valid
   npx drizzle-kit check --config=drizzle-d1.config.ts
   ```

2. **Local Database Issues**
   ```bash
   # Recreate local database
   rm -f dev.db
   npx tsx scripts/setup-local-d1.ts
   ```

3. **Worker Deployment Fails**
   ```bash
   # Check wrangler authentication
   wrangler whoami
   wrangler auth login
   ```

4. **D1 Connection Issues**
   ```bash
   # Verify database binding in wrangler-d1.toml
   # Ensure database_id matches actual D1 database
   ```

## Performance Considerations

### Optimizations
- **Indexes**: SQLite automatically indexes primary keys and unique constraints
- **Query Patterns**: Optimized for read-heavy workloads typical in D1
- **Batch Operations**: Use transactions for multiple writes
- **Connection Reuse**: D1 handles connection pooling automatically

### Limitations
- **Write Throughput**: 1,000 writes/day on free tier
- **Database Size**: 500MB limit per database
- **Query Timeout**: 30 second execution limit
- **Concurrent Writes**: Limited concurrent write operations

## Next Steps

1. **Test Migration**: Verify all features work with D1 backend
2. **Performance Testing**: Load test with expected traffic patterns  
3. **Monitoring Setup**: Implement logging and metrics collection
4. **Backup Strategy**: Automate regular database exports
5. **Production Deploy**: Migrate traffic to D1-powered Workers

For detailed command reference, see `scripts/d1-commands.md`.