import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";

export function registerRoutes(app: Express): void {
  // Note: Auth middleware is set up in main server

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      service: 'AI Task Manager (Legacy Routes)',
      timestamp: new Date().toISOString()
    });
  });

  // Auth routes - NOTE: /api/auth/user is handled in demo-routes.ts with demo token support

  // Legacy template routes - return empty arrays for backward compatibility
  app.get('/api/templates', async (req, res) => {
    res.json([]);
  });

  app.get('/api/templates/categories', async (req, res) => {
    res.json([]);
  });

  app.get('/api/templates/:id', async (req, res) => {
    res.status(404).json({ message: "Template marketplace has been replaced with AI Task Manager" });
  });

  app.get('/api/templates/category/:categorySlug', async (req, res) => {
    res.json([]);
  });

  // Redirect old marketplace endpoints to new dashboard
  app.get('/api/purchases', async (req, res) => {
    res.status(410).json({ 
      message: "Template marketplace functionality has been replaced with AI Task Manager",
      redirect: "/dashboard"
    });
  });

  app.post('/api/purchases', async (req, res) => {
    res.status(410).json({ 
      message: "Template marketplace functionality has been replaced with AI Task Manager",
      redirect: "/dashboard"
    });
  });

  app.get('/api/downloads', async (req, res) => {
    res.status(410).json({ 
      message: "Template marketplace functionality has been replaced with AI Task Manager",
      redirect: "/dashboard"
    });
  });

  app.post('/api/downloads', async (req, res) => {
    res.status(410).json({ 
      message: "Template marketplace functionality has been replaced with AI Task Manager",
      redirect: "/dashboard"
    });
  });

  app.get('/api/customizations', async (req, res) => {
    res.status(410).json({ 
      message: "Template marketplace functionality has been replaced with AI Task Manager",
      redirect: "/dashboard"
    });
  });

  app.post('/api/customizations', async (req, res) => {
    res.status(410).json({ 
      message: "Template marketplace functionality has been replaced with AI Task Manager",
      redirect: "/dashboard"
    });
  });

  // Routes registered successfully
}