import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  companyName: text("company_name"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  responses: jsonb("responses").notNull(),
  recommendation: text("recommendation"),
  score: integer("score"),
  completedAt: timestamp("completed_at").notNull().default(sql`now()`),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assessmentId: uuid("assessment_id").references(() => assessments.id),
  name: text("name").notNull(),
  strategy: text("strategy").notNull(), // greenfield, brownfield, hybrid
  status: text("status").notNull().default("planning"), // planning, active, completed
  // Shape Up cycle configuration
  buildCycleDuration: integer("build_cycle_duration").notNull().default(6), // weeks
  cooldownCycleDuration: integer("cooldown_cycle_duration").notNull().default(2), // weeks
  currentCycle: integer("current_cycle").notNull().default(0),
  cyclePhase: text("cycle_phase").notNull().default("planning"), // planning, building, cooldown
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const pitches = pgTable("pitches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  appetite: integer("appetite").notNull(), // weeks
  businessValue: text("business_value").notNull(),
  roadblocks: text("roadblocks"),
  dependencies: jsonb("dependencies"),
  teamMembers: jsonb("team_members"),
  status: text("status").notNull().default("shaped"), // shaped, betting, active, completed
  cycle: integer("cycle"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const scopes = pgTable("scopes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  boundaries: text("boundaries"), // What's in scope vs out of scope
  keyObjectives: jsonb("key_objectives"), // Array of objectives
  successCriteria: text("success_criteria"),
  constraints: text("constraints"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const workPackages = pgTable("work_packages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pitchId: uuid("pitch_id").references(() => pitches.id).notNull(),
  scopeId: uuid("scope_id").references(() => scopes.id),
  name: text("name").notNull(),
  description: text("description"),
  position: integer("position").notNull().default(0), // 0-100, position on hill chart
  phase: text("phase").notNull().default("uphill"), // uphill, downhill
  isStuck: boolean("is_stuck").notNull().default(false),
  assignee: text("assignee"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

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
