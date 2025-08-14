// Cloudflare Worker entry point for D1 database
import { createD1Database } from "./db-d1";
import { D1Storage } from "./storage-d1";
import { setupAuth } from "./auth";
import express from "express";

// Environment interface for Cloudflare Workers
interface Env {
  DB: any; // D1Database type
  SESSION_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Create D1 database connection
      const db = createD1Database(env.DB);
      const storage = new D1Storage(db);
      
      // Create Express app
      const app = express();
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      
      // Set up authentication with D1 storage
      setupAuth(app, storage, env.SESSION_SECRET);
      
      // Health check endpoint
      app.get("/api/health", (req, res) => {
        res.json({
          status: "healthy",
          timestamp: new Date().toISOString(),
          database: "d1",
        });
      });
      
      // API routes for assessments, projects, etc.
      app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
      });
      
      app.get("/api/assessments", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        try {
          const assessments = await storage.getAssessmentsByUser(req.user!.id);
          res.json(assessments);
        } catch (error) {
          res.status(500).json({ error: "Failed to fetch assessments" });
        }
      });
      
      app.post("/api/assessments", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        try {
          const assessment = await storage.createAssessment({
            ...req.body,
            userId: req.user!.id,
          });
          res.status(201).json(assessment);
        } catch (error) {
          res.status(500).json({ error: "Failed to create assessment" });
        }
      });
      
      app.get("/api/projects", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        try {
          const projects = await storage.getProjectsByUser(req.user!.id);
          res.json(projects);
        } catch (error) {
          res.status(500).json({ error: "Failed to fetch projects" });
        }
      });
      
      app.post("/api/projects", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        try {
          const project = await storage.createProject({
            ...req.body,
            userId: req.user!.id,
          });
          res.status(201).json(project);
        } catch (error) {
          res.status(500).json({ error: "Failed to create project" });
        }
      });
      
      // Serve static files or proxy to frontend
      app.get("*", (req, res) => {
        // In production, this would serve the built React app
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>S/4HANA Migration Assistant</title>
            </head>
            <body>
              <div id="root">Loading...</div>
              <script>
                // Production build would inject the React app here
                document.getElementById('root').innerHTML = '<h1>S/4HANA Migration Assistant</h1><p>API is running on Cloudflare Workers with D1!</p>';
              </script>
            </body>
          </html>
        `);
      });
      
      // Handle the request using Express
      return new Promise((resolve) => {
        const nodeRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
        
        app.handle(nodeRequest as any, {} as any, (err: any, result: any) => {
          if (err) {
            resolve(new Response("Internal Server Error", { status: 500 }));
          } else {
            resolve(result || new Response("Not Found", { status: 404 }));
          }
        });
      });
      
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal Server Error", { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};