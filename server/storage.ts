import { 
  users, 
  assessments, 
  projects, 
  pitches, 
  workPackages,
  type User, 
  type InsertUser,
  type Assessment,
  type InsertAssessment,
  type Project,
  type InsertProject,
  type Pitch,
  type InsertPitch,
  type WorkPackage,
  type InsertWorkPackage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Assessment methods
  createAssessment(userId: string, insertAssessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  getUserAssessments(userId: string): Promise<Assessment[]>;
  
  // Project methods
  createProject(userId: string, insertProject: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  
  // Pitch methods
  createPitch(insertPitch: InsertPitch): Promise<Pitch>;
  getPitch(id: string): Promise<Pitch | undefined>;
  getProjectPitches(projectId: string): Promise<Pitch[]>;
  updatePitch(id: string, updates: Partial<Pitch>): Promise<Pitch>;
  
  // Work Package methods
  createWorkPackage(insertWorkPackage: InsertWorkPackage): Promise<WorkPackage>;
  getWorkPackage(id: string): Promise<WorkPackage | undefined>;
  getPitchWorkPackages(pitchId: string): Promise<WorkPackage[]>;
  updateWorkPackage(id: string, updates: Partial<WorkPackage>): Promise<WorkPackage>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Temporarily use memory store for debugging
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // PostgreSQL session store (commented out for debugging)
    // this.sessionStore = new PostgresSessionStore({ 
    //   pool, 
    //   createTableIfMissing: true 
    // });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createAssessment(userId: string, insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values({ ...insertAssessment, userId })
      .returning();
    return assessment;
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    return await db.select().from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.completedAt));
  }

  async createProject(userId: string, insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({ ...insertProject, userId })
      .returning();
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async createPitch(insertPitch: InsertPitch): Promise<Pitch> {
    const [pitch] = await db
      .insert(pitches)
      .values(insertPitch)
      .returning();
    return pitch;
  }

  async getPitch(id: string): Promise<Pitch | undefined> {
    const [pitch] = await db.select().from(pitches).where(eq(pitches.id, id));
    return pitch || undefined;
  }

  async getProjectPitches(projectId: string): Promise<Pitch[]> {
    return await db.select().from(pitches)
      .where(eq(pitches.projectId, projectId))
      .orderBy(desc(pitches.createdAt));
  }

  async updatePitch(id: string, updates: Partial<Pitch>): Promise<Pitch> {
    const [pitch] = await db
      .update(pitches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pitches.id, id))
      .returning();
    return pitch;
  }

  async createWorkPackage(insertWorkPackage: InsertWorkPackage): Promise<WorkPackage> {
    const [workPackage] = await db
      .insert(workPackages)
      .values(insertWorkPackage)
      .returning();
    return workPackage;
  }

  async getWorkPackage(id: string): Promise<WorkPackage | undefined> {
    const [workPackage] = await db.select().from(workPackages).where(eq(workPackages.id, id));
    return workPackage || undefined;
  }

  async getPitchWorkPackages(pitchId: string): Promise<WorkPackage[]> {
    return await db.select().from(workPackages)
      .where(eq(workPackages.pitchId, pitchId))
      .orderBy(workPackages.position);
  }

  async updateWorkPackage(id: string, updates: Partial<WorkPackage>): Promise<WorkPackage> {
    const [workPackage] = await db
      .update(workPackages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workPackages.id, id))
      .returning();
    return workPackage;
  }
}

export const storage = new DatabaseStorage();
