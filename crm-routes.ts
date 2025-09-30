import { Request, Response, Express } from 'express';
import { taskStorage } from './task-storage';
import { InsertPageVisit, InsertUserActivity } from '@shared/schema';
import jwt from 'jsonwebtoken';

const DEMO_TOKEN_SECRET = process.env.DEMO_TOKEN_SECRET || process.env.SESSION_SECRET || 'fallback-secret';

interface DemoTokenPayload {
  signupId: string;
  email: string;
  name: string;
  tier: string;
  type: 'demo';
}

// Admin authentication middleware - requires actual authenticated session
const requireAdminAuth = (req: Request, res: Response, next: any) => {
  // Check if user is authenticated via session (Replit OIDC)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin access required. Please authenticate via Replit OIDC.' });
};

// Middleware to get user info (demo or regular)
const getUserInfo = (req: Request): { userId: string | null, userType: string | null } => {
  // Check for demo token
  const demoToken = req.headers['x-demo-token'] as string || req.cookies?.demoToken;
  
  if (demoToken && DEMO_TOKEN_SECRET) {
    try {
      const decoded = jwt.verify(demoToken, DEMO_TOKEN_SECRET) as DemoTokenPayload;
      console.log('✅ CRM: Demo token verified for user:', decoded.signupId);
      return { userId: decoded.signupId, userType: 'demo' };
    } catch (error) {
      console.log('❌ CRM: Invalid demo token:', error);
    }
  } else {
    console.log('❌ CRM: No demo token found in headers or cookies');
  }

  // Check for regular authentication (if available)
  if ((req as any).user?.claims?.sub) {
    return { userId: (req as any).user.claims.sub, userType: 'user' };
  }

  return { userId: null, userType: null };
};

export function setupCRMRoutes(app: Express) {
  // Track page visits (can be called anonymously or with auth)
  app.post('/api/crm/page-visit', async (req: Request, res: Response) => {
    try {
      const { page, referrer, utmSource, utmMedium, utmCampaign, sessionId } = req.body;
      
      if (!page) {
        return res.status(400).json({ error: 'Page is required' });
      }

      const { userId, userType } = getUserInfo(req);
      
      const visitData: InsertPageVisit = {
        sessionId: sessionId || null,
        userId: userId || null,
        userType: userType || 'anonymous',
        page,
        referrer: referrer || null,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || req.connection.remoteAddress || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
      };

      const pageVisit = await taskStorage.createPageVisit(visitData);
      res.json({ success: true, id: pageVisit.id });

    } catch (error) {
      console.error('Error tracking page visit:', error);
      res.status(500).json({ error: 'Failed to track page visit' });
    }
  });

  // Get user activities (requires authentication)
  app.get('/api/crm/user-activity', async (req: Request, res: Response) => {
    try {
      const { userId, userType } = getUserInfo(req);
      
      if (!userId || !userType) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const activities = await taskStorage.getUserActivities(userId, userType);
      res.json(activities);

    } catch (error) {
      console.error('Error getting user activities:', error);
      res.status(500).json({ error: 'Failed to get user activities' });
    }
  });

  // Track user activities (requires authentication)
  app.post('/api/crm/user-activity', async (req: Request, res: Response) => {
    try {
      const { activityType, activityData, page, sessionId } = req.body;
      
      if (!activityType) {
        return res.status(400).json({ error: 'Activity type is required' });
      }

      const { userId, userType } = getUserInfo(req);
      
      if (!userId || !userType) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const activityEntry: InsertUserActivity = {
        userId,
        userType,
        activityType,
        activityData: activityData || null,
        page: page || null,
        sessionId: sessionId || null,
        ipAddress: req.ip || req.connection.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
      };

      const activity = await taskStorage.createUserActivity(activityEntry);
      res.json({ success: true, id: activity.id });

    } catch (error) {
      console.error('Error tracking user activity:', error);
      res.status(500).json({ error: 'Failed to track user activity' });
    }
  });

  // Admin: Get CRM analytics summary
  app.get('/api/admin/crm-summary', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      // Protected admin endpoint
      
      // Get page visit analytics
      const homepageVisits = await taskStorage.getPageVisitsByPage('/');
      const dashboardVisits = await taskStorage.getPageVisitsByPage('/dashboard');
      
      // Get activity analytics
      const signupActivities = await taskStorage.getUserActivitiesByType('signup_completed');
      const taskCreatedActivities = await taskStorage.getUserActivitiesByType('task_created');
      const slackConnectedActivities = await taskStorage.getUserActivitiesByType('slack_connected');

      // Get demo signups for reference
      const allDemoSignups = await taskStorage.getAllDemoSignups();

      const summary = {
        pageVisits: {
          homepage: homepageVisits.length,
          dashboard: dashboardVisits.length,
          total: homepageVisits.length + dashboardVisits.length
        },
        userActivities: {
          signupCompleted: signupActivities.length,
          taskCreated: taskCreatedActivities.length,
          slackConnected: slackConnectedActivities.length
        },
        conversionFunnel: {
          visitors: homepageVisits.length,
          signups: signupActivities.length,
          dashboardVisits: dashboardVisits.length,
          taskCreators: taskCreatedActivities.length,
          slackUsers: slackConnectedActivities.length
        }
      };

      res.json(summary);

    } catch (error) {
      console.error('Error getting CRM summary:', error);
      res.status(500).json({ error: 'Failed to get CRM summary' });
    }
  });

  // Admin: Get all demo signups
  app.get('/api/admin/demo-signups', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const signups = await taskStorage.getAllDemoSignups();
      res.json(signups);
    } catch (error) {
      console.error('Error getting demo signups:', error);
      res.status(500).json({ error: 'Failed to get demo signups' });
    }
  });

  // Admin: Get detailed user activities
  app.get('/api/admin/user-activities', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, userType, activityType, limit = '50' } = req.query;
      
      let activities;
      
      if (userId && userType) {
        activities = await taskStorage.getUserActivities(userId as string, userType as string);
      } else if (activityType) {
        activities = await taskStorage.getUserActivitiesByType(activityType as string);
      } else {
        // Get all activities across all types
        activities = await taskStorage.getAllUserActivities(parseInt(limit as string));
      }

      res.json(activities);

    } catch (error) {
      console.error('Error getting user activities:', error);
      res.status(500).json({ error: 'Failed to get user activities' });
    }
  });

  // Admin: Export CRM data as CSV
  app.get('/api/admin/export-csv', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { type = 'signups' } = req.query;
      
      if (type === 'signups') {
        // Get signup activities and format as CSV
        const signupActivities = await taskStorage.getUserActivitiesByType('signup_completed');
        
        const csvHeaders = 'Date,User ID,Email,Activity Type,Page,IP Address,User Agent\n';
        const csvData = signupActivities.map(activity => {
          const activityData = activity.activityData as any;
          return `${activity.createdAt},${activity.userId},"${activityData?.email || 'N/A'}",${activity.activityType},${activity.page || 'N/A'},${activity.ipAddress || 'N/A'},"${activity.userAgent || 'N/A'}"`;
        }).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="demo_signups.csv"');
        res.send(csvHeaders + csvData);
      } else {
        res.status(400).json({ error: 'Invalid export type' });
      }

    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  });
}