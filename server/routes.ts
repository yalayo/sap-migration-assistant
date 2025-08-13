import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAssessmentSchema, insertProjectSchema, insertPitchSchema, insertWorkPackageSchema, insertScopeSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword } from "./auth";

// Generate a secure temporary password
function generateSecurePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Ensure at least one character from each type
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Assessment routes - allow anonymous submissions
  app.post("/api/assessments", async (req, res, next) => {
    try {
      const validatedData = insertAssessmentSchema.parse(req.body);
      
      // If user is authenticated, create assessment for them
      if (req.isAuthenticated()) {
        const assessment = await storage.createAssessment(req.user!.id, validatedData);
        return res.status(201).json(assessment);
      }
      
      // For anonymous users, extract user info from assessment responses
      const responses = validatedData.responses as any;
      const email = responses?.contact?.email;
      const companyName = responses?.contact?.companyName;
      const fullName = responses?.contact?.fullName;
      
      if (!email || !companyName || !fullName) {
        return res.status(400).json({ 
          error: "Contact information is required to complete the assessment" 
        });
      }
      
      // Check if user already exists with this email
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // User exists, create assessment for them and auto-login
        const assessment = await storage.createAssessment(existingUser.id, validatedData);
        
        // Auto-login the existing user
        req.login(existingUser, (err) => {
          if (err) return next(err);
          return res.status(201).json({ 
            assessment, 
            user: existingUser,
            message: "Assessment completed and logged in successfully"
          });
        });
        return;
      }
      
      // Generate a secure temporary password
      const tempPassword = generateSecurePassword();
      
      // Create new user account
      const newUser = await storage.createUser({
        email,
        username: email, // Use email as username for simplicity
        fullName,
        companyName,
        password: await hashPassword(tempPassword) // Hash the temporary password
      });
      
      // Create assessment for the new user
      const assessment = await storage.createAssessment(newUser.id, validatedData);
      
      // Log them in automatically
      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          user: newUser, 
          assessment,
          tempPassword, // Include the temporary password in response
          isNewAccount: true,
          message: "Account created successfully. Please save your login credentials."
        });
      });
      
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/assessments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const assessments = await storage.getUserAssessments(req.user!.id);
      res.json(assessments);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/assessments/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment || assessment.userId !== req.user!.id) {
        return res.sendStatus(404);
      }
      
      res.json(assessment);
    } catch (error) {
      next(error);
    }
  });

  // Project routes
  app.post("/api/projects", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(req.user!.id, validatedData);
      
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const projects = await storage.getUserProjects(req.user!.id);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const project = await storage.getProject(req.params.id);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(404);
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/projects/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const project = await storage.getProject(req.params.id);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(404);
      }
      
      const updates = z.object({
        name: z.string().optional(),
        strategy: z.string().optional(),
        status: z.string().optional(),
      }).parse(req.body);
      
      const updatedProject = await storage.updateProject(req.params.id, updates);
      res.json(updatedProject);
    } catch (error) {
      next(error);
    }
  });

  // Pitch routes
  app.post("/api/pitches", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertPitchSchema.parse(req.body);
      
      // Verify user owns the project
      const project = await storage.getProject(validatedData.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(403);
      }
      
      const pitch = await storage.createPitch(validatedData);
      res.status(201).json(pitch);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:projectId/pitches", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(404);
      }
      
      const pitches = await storage.getProjectPitches(req.params.projectId);
      res.json(pitches);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/pitches/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const pitch = await storage.getPitch(req.params.id);
      if (!pitch) return res.sendStatus(404);
      
      const project = await storage.getProject(pitch.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(403);
      }
      
      const updates = z.object({
        title: z.string().optional(),
        problem: z.string().optional(),
        solution: z.string().optional(),
        appetite: z.number().optional(),
        businessValue: z.string().optional(),
        roadblocks: z.string().optional(),
        dependencies: z.any().optional(),
        teamMembers: z.any().optional(),
        status: z.string().optional(),
        cycle: z.number().optional(),
      }).parse(req.body);
      
      const updatedPitch = await storage.updatePitch(req.params.id, updates);
      res.json(updatedPitch);
    } catch (error) {
      next(error);
    }
  });

  // Work Package routes
  app.post("/api/work-packages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertWorkPackageSchema.parse(req.body);
      
      // Verify user owns the pitch/project
      const pitch = await storage.getPitch(validatedData.pitchId);
      if (!pitch) return res.sendStatus(404);
      
      const project = await storage.getProject(pitch.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(403);
      }
      
      const workPackage = await storage.createWorkPackage(validatedData);
      res.status(201).json(workPackage);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/pitches/:pitchId/work-packages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const pitch = await storage.getPitch(req.params.pitchId);
      if (!pitch) return res.sendStatus(404);
      
      const project = await storage.getProject(pitch.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(404);
      }
      
      const workPackages = await storage.getPitchWorkPackages(req.params.pitchId);
      res.json(workPackages);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/work-packages/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const workPackage = await storage.getWorkPackage(req.params.id);
      if (!workPackage) return res.sendStatus(404);
      
      const pitch = await storage.getPitch(workPackage.pitchId);
      if (!pitch) return res.sendStatus(404);
      
      const project = await storage.getProject(pitch.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(403);
      }
      
      const updates = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        position: z.number().optional(),
        phase: z.string().optional(),
        isStuck: z.boolean().optional(),
        assignee: z.string().optional(),
      }).parse(req.body);
      
      const updatedWorkPackage = await storage.updateWorkPackage(req.params.id, updates);
      res.json(updatedWorkPackage);
    } catch (error) {
      next(error);
    }
  });

  // Scope routes
  app.post("/api/scopes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertScopeSchema.parse(req.body);
      
      // Verify user owns the project
      const project = await storage.getProject(validatedData.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(403);
      }
      
      const scope = await storage.createScope(validatedData);
      res.status(201).json(scope);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:projectId/scopes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(404);
      }
      
      const scopes = await storage.getProjectScopes(req.params.projectId);
      res.json(scopes);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/scopes/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const scope = await storage.getScope(req.params.id);
      if (!scope) return res.sendStatus(404);
      
      const project = await storage.getProject(scope.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(403);
      }
      
      const updates = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        boundaries: z.string().optional(),
        keyObjectives: z.any().optional(),
        successCriteria: z.string().optional(),
        constraints: z.string().optional(),
      }).parse(req.body);
      
      const updatedScope = await storage.updateScope(req.params.id, updates);
      res.json(updatedScope);
    } catch (error) {
      next(error);
    }
  });

  // Scope work packages routes
  app.get("/api/scopes/:scopeId/work-packages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const scope = await storage.getScope(req.params.scopeId);
      if (!scope) return res.sendStatus(404);
      
      const project = await storage.getProject(scope.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.sendStatus(404);
      }
      
      const workPackages = await storage.getScopeWorkPackages(req.params.scopeId);
      res.json(workPackages);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
