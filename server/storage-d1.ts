import { users, assessments, projects, pitches, scopes, workPackages } from "../shared/schema-sqlite";
import { eq } from "drizzle-orm";
import type { 
  User, InsertUser, 
  Assessment, InsertAssessment,
  Project, InsertProject,
  Pitch, InsertPitch,
  Scope, InsertScope,
  WorkPackage, InsertWorkPackage
} from "../shared/schema-sqlite";

// D1-compatible storage interface
export interface ID1Storage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Assessment operations
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAssessmentsByUser(userId: string): Promise<Assessment[]>;
  createAssessment(insertAssessment: InsertAssessment & { userId: string }): Promise<Assessment>;
  
  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  createProject(insertProject: InsertProject & { userId: string }): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  
  // Pitch operations
  getPitch(id: string): Promise<Pitch | undefined>;
  getPitchesByProject(projectId: string): Promise<Pitch[]>;
  createPitch(insertPitch: InsertPitch): Promise<Pitch>;
  updatePitch(id: string, updates: Partial<InsertPitch>): Promise<Pitch>;
  
  // Scope operations
  getScope(id: string): Promise<Scope | undefined>;
  getScopesByProject(projectId: string): Promise<Scope[]>;
  createScope(insertScope: InsertScope): Promise<Scope>;
  updateScope(id: string, updates: Partial<InsertScope>): Promise<Scope>;
  
  // Work package operations
  getWorkPackage(id: string): Promise<WorkPackage | undefined>;
  getWorkPackagesByPitch(pitchId: string): Promise<WorkPackage[]>;
  createWorkPackage(insertWorkPackage: InsertWorkPackage): Promise<WorkPackage>;
  updateWorkPackage(id: string, updates: Partial<InsertWorkPackage>): Promise<WorkPackage>;
}

export class D1Storage implements ID1Storage {
  constructor(private db: any) {} // D1 database instance

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Assessment operations
  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await this.db.select().from(assessments).where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async getAssessmentsByUser(userId: string): Promise<Assessment[]> {
    return await this.db.select().from(assessments).where(eq(assessments.userId, userId));
  }

  async createAssessment(insertAssessment: InsertAssessment & { userId: string }): Promise<Assessment> {
    const [assessment] = await this.db
      .insert(assessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await this.db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await this.db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(insertProject: InsertProject & { userId: string }): Promise<Project> {
    const [project] = await this.db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await this.db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  // Pitch operations
  async getPitch(id: string): Promise<Pitch | undefined> {
    const [pitch] = await this.db.select().from(pitches).where(eq(pitches.id, id));
    return pitch || undefined;
  }

  async getPitchesByProject(projectId: string): Promise<Pitch[]> {
    return await this.db.select().from(pitches).where(eq(pitches.projectId, projectId));
  }

  async createPitch(insertPitch: InsertPitch): Promise<Pitch> {
    const [pitch] = await this.db
      .insert(pitches)
      .values(insertPitch)
      .returning();
    return pitch;
  }

  async updatePitch(id: string, updates: Partial<InsertPitch>): Promise<Pitch> {
    const [pitch] = await this.db
      .update(pitches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pitches.id, id))
      .returning();
    return pitch;
  }

  // Scope operations
  async getScope(id: string): Promise<Scope | undefined> {
    const [scope] = await this.db.select().from(scopes).where(eq(scopes.id, id));
    return scope || undefined;
  }

  async getScopesByProject(projectId: string): Promise<Scope[]> {
    return await this.db.select().from(scopes).where(eq(scopes.projectId, projectId));
  }

  async createScope(insertScope: InsertScope): Promise<Scope> {
    const [scope] = await this.db
      .insert(scopes)
      .values(insertScope)
      .returning();
    return scope;
  }

  async updateScope(id: string, updates: Partial<InsertScope>): Promise<Scope> {
    const [scope] = await this.db
      .update(scopes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(scopes.id, id))
      .returning();
    return scope;
  }

  // Work package operations
  async getWorkPackage(id: string): Promise<WorkPackage | undefined> {
    const [workPackage] = await this.db.select().from(workPackages).where(eq(workPackages.id, id));
    return workPackage || undefined;
  }

  async getWorkPackagesByPitch(pitchId: string): Promise<WorkPackage[]> {
    return await this.db.select().from(workPackages).where(eq(workPackages.pitchId, pitchId));
  }

  async createWorkPackage(insertWorkPackage: InsertWorkPackage): Promise<WorkPackage> {
    const [workPackage] = await this.db
      .insert(workPackages)
      .values(insertWorkPackage)
      .returning();
    return workPackage;
  }

  async updateWorkPackage(id: string, updates: Partial<InsertWorkPackage>): Promise<WorkPackage> {
    const [workPackage] = await this.db
      .update(workPackages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workPackages.id, id))
      .returning();
    return workPackage;
  }
}