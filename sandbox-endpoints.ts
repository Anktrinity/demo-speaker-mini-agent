import { Request, Response, Express } from 'express';
import { createSandboxToken } from './demo-routes';

// Admin authentication middleware - requires actual authenticated session
const requireAdminAuth = (req: Request, res: Response, next: any) => {
  // Check if user is authenticated via session (Replit OIDC)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin access required. Please authenticate via Replit OIDC.' });
};

export function setupSandboxEndpoints(app: Express) {
  // Create sandbox token for admin testing (POST) - REQUIRES ADMIN AUTH
  app.post('/api/demo/sandbox-token', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { slackUserId, userName = 'Sandbox User' } = req.body;
      
      if (!slackUserId) {
        return res.status(400).json({ error: 'slackUserId is required' });
      }
      
      const token = createSandboxToken(slackUserId, userName);
      res.json({ token, slackUserId, userName });
      
    } catch (error) {
      console.error('Error creating sandbox token:', error);
      res.status(500).json({ error: 'Failed to create sandbox token' });
    }
  });

  // Get sandbox token for admin testing (GET) - REQUIRES ADMIN AUTH
  app.get('/api/demo/sandbox-token', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { slackUserId, userName = 'Sandbox User' } = req.query;
      
      if (!slackUserId) {
        return res.status(400).json({ error: 'slackUserId is required' });
      }
      
      const token = createSandboxToken(slackUserId as string, userName as string);
      res.json({ token, slackUserId, userName });
      
    } catch (error) {
      console.error('Error creating sandbox token:', error);
      res.status(500).json({ error: 'Failed to create sandbox token' });
    }
  });
}