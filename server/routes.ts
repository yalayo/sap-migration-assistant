import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAssessmentSchema, insertProjectSchema, insertPitchSchema, insertWorkPackageSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Assessment routes
  app.post("/api/assessments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(req.user!.id, validatedData);
      
      res.status(201).json(assessment);
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

  const httpServer = createServer(app);
  return httpServer;
}
