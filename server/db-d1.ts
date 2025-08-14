import { drizzle } from "drizzle-orm/d1";
import * as schema from "../shared/schema-sqlite";

// Cloudflare D1 database connection
export function createD1Database(d1: any) {
  return drizzle(d1, { schema });
}

// For local development with SQLite
export function createLocalSQLiteDatabase() {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    // Use better-sqlite3 for local development
    const Database = require("better-sqlite3");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    
    const sqlite = new Database("dev.db");
    return drizzle(sqlite, { schema });
  }
  
  throw new Error("Local SQLite database can only be used in development");
}

// Export the schema for Workers to use
export { schema };