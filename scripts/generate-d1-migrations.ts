#!/usr/bin/env tsx

// Script to generate D1 database migrations
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function generateMigrations() {
  try {
    console.log("🔄 Generating D1 database migrations...");
    
    // Generate migrations using the D1 config
    const { stdout, stderr } = await execAsync("npx drizzle-kit generate --config=drizzle-d1.config.ts");
    
    if (stderr) {
      console.error("❌ Error generating migrations:", stderr);
      process.exit(1);
    }
    
    console.log("✅ D1 migrations generated successfully!");
    console.log(stdout);
    
    console.log("\n📝 Next steps:");
    console.log("1. Review the generated migration files in ./migrations-d1/");
    console.log("2. Apply migrations to your D1 database using wrangler:");
    console.log("   wrangler d1 migrations apply <DATABASE_NAME>");
    console.log("3. For local development, run:");
    console.log("   npm run db:d1:push");
    
  } catch (error) {
    console.error("❌ Failed to generate migrations:", error);
    process.exit(1);
  }
}

generateMigrations();