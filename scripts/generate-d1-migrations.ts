#!/usr/bin/env tsx
import { exec } from "child_process";
import { promisify } from "util";
import { mkdirSync } from "fs";

const execAsync = promisify(exec);

async function generateMigrations() {
  try {
    console.log("🔄 Generating D1 database migrations...");

    mkdirSync("migrations-d1", { recursive: true });

    const { stdout, stderr } = await execAsync(
      "npx drizzle-kit generate --config=drizzle-d1.config.ts"
    );

    console.log(stdout);

    if (stderr) {
      console.warn("⚠️ Warnings while generating migrations:", stderr);
    }

    console.log("✅ D1 migrations generated successfully!");

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