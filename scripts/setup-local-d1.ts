#!/usr/bin/env tsx

// Script to set up local SQLite database for D1 development
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../shared/schema-sqlite";
import * as fs from "fs";
import * as path from "path";

async function setupLocalD1() {
  try {
    console.log("🔄 Setting up local D1 SQLite database...");
    
    // Create database file
    const dbPath = "./dev.db";
    const db = new Database(dbPath);
    const drizzleDb = drizzle(db, { schema });
    
    // Check if migrations directory exists
    const migrationsPath = "./migrations-d1";
    if (fs.existsSync(migrationsPath)) {
      console.log("📁 Found migrations directory, applying migrations...");
      migrate(drizzleDb, { migrationsFolder: migrationsPath });
      console.log("✅ Migrations applied successfully!");
    } else {
      console.log("⚠️  No migrations directory found. Generating schema directly...");
      
      // Create tables manually if no migrations exist
      const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          full_name TEXT,
          company_name TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS assessments (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          user_id TEXT NOT NULL REFERENCES users(id),
          responses TEXT NOT NULL,
          recommendation TEXT,
          recommended_strategy TEXT,
          complexity_score INTEGER,
          risk_level TEXT,
          timeline_estimate TEXT,
          score INTEGER,
          completed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          user_id TEXT NOT NULL REFERENCES users(id),
          assessment_id TEXT REFERENCES assessments(id),
          name TEXT NOT NULL,
          strategy TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'planning',
          build_cycle_duration INTEGER NOT NULL DEFAULT 6,
          cooldown_cycle_duration INTEGER NOT NULL DEFAULT 2,
          current_cycle INTEGER NOT NULL DEFAULT 0,
          cycle_phase TEXT NOT NULL DEFAULT 'planning',
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS pitches (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          project_id TEXT NOT NULL REFERENCES projects(id),
          title TEXT NOT NULL,
          problem TEXT NOT NULL,
          solution TEXT NOT NULL,
          appetite INTEGER NOT NULL,
          business_value TEXT NOT NULL,
          roadblocks TEXT,
          dependencies TEXT,
          team_members TEXT,
          status TEXT NOT NULL DEFAULT 'shaped',
          cycle INTEGER,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS scopes (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          project_id TEXT NOT NULL REFERENCES projects(id),
          name TEXT NOT NULL,
          description TEXT,
          boundaries TEXT,
          key_objectives TEXT,
          success_criteria TEXT,
          constraints TEXT,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS work_packages (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          pitch_id TEXT NOT NULL REFERENCES pitches(id),
          scope_id TEXT REFERENCES scopes(id),
          name TEXT NOT NULL,
          description TEXT,
          position INTEGER NOT NULL DEFAULT 0,
          phase TEXT NOT NULL DEFAULT 'uphill',
          is_stuck INTEGER NOT NULL DEFAULT 0,
          assignee TEXT,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
      `;
      
      db.exec(createTablesSQL);
      console.log("✅ Tables created successfully!");
    }
    
    console.log(`📍 Local D1 database created at: ${dbPath}`);
    console.log("\n🚀 Next steps:");
    console.log("1. Use this database for local development");
    console.log("2. Update your .env with: DATABASE_TYPE=sqlite");
    console.log("3. Run your application with: npm run dev");
    
    db.close();
    
  } catch (error) {
    console.error("❌ Failed to setup local D1 database:", error);
    process.exit(1);
  }
}

setupLocalD1();