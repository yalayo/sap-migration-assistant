import { defineConfig } from "drizzle-kit";

// Cloudflare D1 configuration for SQLite
export default defineConfig({
  out: "./migrations-d1",
  schema: "./shared/schema-sqlite.ts",
  dialect: "sqlite",
  dbCredentials: {
    // For production D1 - these will be set by Cloudflare
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    databaseId: process.env.D1_DATABASE_ID || "",
    token: process.env.CLOUDFLARE_API_TOKEN || "",
  },
});