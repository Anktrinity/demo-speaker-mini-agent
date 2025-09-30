import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Raw body parsing for Stripe webhooks - MUST come before express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Set up authentication first
  const { setupAuth } = await import("./replitAuth");
  await setupAuth(app);
  
  // Register task management routes (new Slack bot functionality)
  const { registerTaskRoutes } = await import("./task-routes");
  await registerTaskRoutes(app);
  
  // Register demo signup and billing routes
  const { registerDemoRoutes } = await import("./demo-routes");
  registerDemoRoutes(app);
  
  // Register billing and subscription routes
  const { registerBillingRoutes } = await import("./billing-routes");
  registerBillingRoutes(app);
  
  // Register CRM tracking routes
  const { setupCRMRoutes } = await import("./crm-routes");
  setupCRMRoutes(app);
  
  // Register Slack setup wizard routes
  const { setupSlackSetupRoutes } = await import("./slack-setup-routes");
  setupSlackSetupRoutes(app);
  
  // Register sandbox endpoints
  const { setupSandboxEndpoints } = await import("./sandbox-endpoints");
  setupSandboxEndpoints(app);
  
  // Initialize Slack Socket Mode client
  try {
    const { slackClient } = await import("./slack/socket");
    console.log('🔌 Initializing Slack Socket Mode...');
    await slackClient.start();
    
    // Set up event handlers for UI communication
    slackClient.on('task_created', (task) => {
      console.log('📝 Task created via Slack:', task.title);
      // Could broadcast to WebSocket clients here if needed
    });
    
    slackClient.on('connected', () => {
      console.log('✅ Slack Socket Mode ready for commands!');
    });
    
    slackClient.on('error', (error) => {
      console.error('❌ Slack Socket Mode error:', error);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down Slack Socket Mode...');
      await slackClient.stop();
    });
    
    process.on('SIGINT', async () => {
      console.log('🛑 Shutting down Slack Socket Mode...');
      await slackClient.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize Slack Socket Mode:', error);
    console.log('🔧 Make sure SLACK_APP_TOKEN and SLACK_BOT_TOKEN are set');
  }
  
  // Register legacy routes for backward compatibility (without re-setting up auth)
  const { registerRoutes } = await import("./routes");
  await registerRoutes(app);
  
  // Create single HTTP server
  const { createServer } = await import("http");
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
