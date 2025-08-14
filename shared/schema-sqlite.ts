import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// SQLite-compatible schema for Cloudflare D1
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`), // SQLite UUID alternative
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  companyName: text("company_name"),
  role: text("role").notNull().default("user"), // user, manager, admin
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const assessments = sqliteTable("assessments", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").references(() => users.id).notNull(),
  responses: text("responses", { mode: "json" }).notNull(), // JSON stored as text in SQLite
  recommendation: text("recommendation"),
  recommendedStrategy: text("recommended_strategy"), // greenfield, brownfield, hybrid
  complexityScore: integer("complexity_score"),
  riskLevel: text("risk_level"), // low, medium, high
  timelineEstimate: text("timeline_estimate"), // 6-12 months, 12-18 months, etc.
  score: integer("score"),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").references(() => users.id).notNull(),
  assessmentId: text("assessment_id").references(() => assessments.id),
  name: text("name").notNull(),
  strategy: text("strategy").notNull(), // greenfield, brownfield, hybrid
  status: text("status").notNull().default("planning"), // planning, active, completed
  // Shape Up cycle configuration
  buildCycleDuration: integer("build_cycle_duration").notNull().default(6), // weeks
  cooldownCycleDuration: integer("cooldown_cycle_duration").notNull().default(2), // weeks
  currentCycle: integer("current_cycle").notNull().default(0),
  cyclePhase: text("cycle_phase").notNull().default("planning"), // planning, building, cooldown
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const pitches = sqliteTable("pitches", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  projectId: text("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  appetite: integer("appetite").notNull(), // weeks
  businessValue: text("business_value").notNull(),
  roadblocks: text("roadblocks"),
  dependencies: text("dependencies", { mode: "json" }), // JSON stored as text
  teamMembers: text("team_members", { mode: "json" }), // JSON stored as text
  status: text("status").notNull().default("shaped"), // shaped, betting, active, completed
  cycle: integer("cycle"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const scopes = sqliteTable("scopes", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  projectId: text("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  boundaries: text("boundaries"), // What's in scope vs out of scope
  keyObjectives: text("key_objectives", { mode: "json" }), // Array of objectives stored as JSON
  successCriteria: text("success_criteria"),
  constraints: text("constraints"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const workPackages = sqliteTable("work_packages", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  pitchId: text("pitch_id").references(() => pitches.id).notNull(),
  scopeId: text("scope_id").references(() => scopes.id),
  name: text("name").notNull(),
  description: text("description"),
  position: integer("position").notNull().default(0), // 0-100, position on hill chart
  phase: text("phase").notNull().default("uphill"), // uphill, downhill
  isStuck: integer("is_stuck", { mode: "boolean" }).notNull().default(false), // SQLite boolean
  assignee: text("assignee"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// Relations remain the same as they're ORM-level abstractions
export const usersRelations = relations(users, ({ many }) => ({
  assessments: many(assessments),
  projects: many(projects),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  assessment: one(assessments, {
    fields: [projects.assessmentId],
    references: [assessments.id],
  }),
  pitches: many(pitches),
  scopes: many(scopes),
}));

export const scopesRelations = relations(scopes, ({ one, many }) => ({
  project: one(projects, {
    fields: [scopes.projectId],
    references: [projects.id],
  }),
  workPackages: many(workPackages),
}));

export const pitchesRelations = relations(pitches, ({ one, many }) => ({
  project: one(projects, {
    fields: [pitches.projectId],
    references: [projects.id],
  }),
  workPackages: many(workPackages),
}));

export const workPackagesRelations = relations(workPackages, ({ one }) => ({
  pitch: one(pitches, {
    fields: [workPackages.pitchId],
    references: [pitches.id],
  }),
  scope: one(scopes, {
    fields: [workPackages.scopeId],
    references: [scopes.id],
  }),
}));

// Schema validation remains the same
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  companyName: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  userId: true,
  completedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPitchSchema = createInsertSchema(pitches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScopeSchema = createInsertSchema(scopes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkPackageSchema = createInsertSchema(workPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions remain the same
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertScope = z.infer<typeof insertScopeSchema>;
export type Scope = typeof scopes.$inferSelect;
export type InsertPitch = z.infer<typeof insertPitchSchema>;
export type Pitch = typeof pitches.$inferSelect;
export type InsertWorkPackage = z.infer<typeof insertWorkPackageSchema>;
export type WorkPackage = typeof workPackages.$inferSelect;