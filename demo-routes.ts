import type { Express } from "express";
import jwt from "jsonwebtoken";
import { insertDemoSignupSchema, insertEntitlementSchema, type DemoSignup, type Entitlement } from "@shared/schema";
import { taskStorage } from "./task-storage";

// JWT secret for demo tokens - MUST be set for security
const getDemoTokenSecret = (): string => {
  const secret = process.env.DEMO_TOKEN_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'CRITICAL SECURITY ERROR: Missing JWT secret for demo tokens. ' +
      'Set DEMO_TOKEN_SECRET or SESSION_SECRET environment variable. ' +
      'Server cannot start without secure token signing.'
    );
  }
  return secret;
};

const DEMO_TOKEN_SECRET = getDemoTokenSecret();
const DEMO_TOKEN_EXPIRES = '90d'; // Extended expiration for beta testing

interface DemoTokenPayload {
  signupId: string;
  email: string;
  name: string;
  tier: string;
  type: 'demo';
  slackUserId?: string; // For sandbox mode
}

// Middleware to verify demo token
export function verifyDemoToken(req: any, res: any, next: any) {
  const token = req.headers['x-demo-token'] || req.cookies?.demoToken;
  
  if (!token) {
    return res.status(401).json({ message: "Demo token required" });
  }

  try {
    const decoded = jwt.verify(token, DEMO_TOKEN_SECRET);
    req.demoUser = decoded as DemoTokenPayload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired demo token" });
  }
}

// Create a sandbox token for Slack beta users
export function createSandboxToken(slackUserId: string, userName: string): string {
  const payload: DemoTokenPayload = {
    signupId: `sandbox_${slackUserId}`,
    email: `${slackUserId}@sandbox.demo`,
    name: userName,
    tier: 'unlimited_beta',
    type: 'demo',
    slackUserId: slackUserId
  };
  
  return jwt.sign(payload, DEMO_TOKEN_SECRET, { expiresIn: DEMO_TOKEN_EXPIRES });
}

// Create default entitlements for free tier
function createFreeEntitlements(subjectId: string): Omit<Entitlement, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    subjectId,
    subjectType: 'demo',
    featureFlags: {
      analytics: true,
      basicTasks: true,
      export: true, // Enabled for beta testing
      customCategories: true, // Enabled for beta testing
      advancedFilters: true, // Enabled for beta testing
      teamInvites: true, // Enabled for beta testing
      slackIntegration: true, // Enabled for beta testing
      aiGeneration: true // Enabled for beta testing
    },
    maxTasks: -1, // Unlimited for beta testers
    maxTeamMembers: -1, // Unlimited for beta testers
    hasAnalytics: true,
    hasSlackIntegration: true, // Enabled for beta testing
    hasAiGeneration: true, // Enabled for beta testing
    hasAdvancedReporting: true, // Enabled for beta testing
    expiresAt: null // No expiration for beta testers
  };
}

export function registerDemoRoutes(app: Express): void {
  
  // Demo signup endpoint
  app.post('/api/demo/signup', async (req, res) => {
    try {
      const { name, email, marketingOptIn = false } = req.body;
      
      // Validate input
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      // Check if email already exists
      const existingSignup = await taskStorage.getDemoSignupByEmail(email);
      if (existingSignup) {
        // Return existing token instead of error
        // Update existing demo users to unlimited beta entitlements
        await taskStorage.updateDemoEntitlements(existingSignup.id, createFreeEntitlements(existingSignup.id));
        
        const tokenPayload: DemoTokenPayload = {
          signupId: existingSignup.id,
          email: existingSignup.email,
          name: existingSignup.name,
          tier: 'beta', // Use 'beta' tier for unlimited access
          type: 'demo'
        };

        const token = jwt.sign(tokenPayload, DEMO_TOKEN_SECRET, { expiresIn: DEMO_TOKEN_EXPIRES });
        
        return res.json({
          token,
          user: {
            id: existingSignup.id,
            email: existingSignup.email,
            name: existingSignup.name,
            tier: 'free',
            authType: 'demo'
          }
        });
      }

      // Create new demo signup
      const signupData = insertDemoSignupSchema.parse({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        marketingOptIn,
        signupSource: 'demo',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      const newSignup = await taskStorage.createDemoSignup(signupData);

      // Create default free tier entitlements
      const entitlementData = createFreeEntitlements(newSignup.id);
      const entitlement = await taskStorage.createEntitlement(entitlementData);

      // Generate JWT token
      const tokenPayload: DemoTokenPayload = {
        signupId: newSignup.id,
        email: newSignup.email,
        name: newSignup.name,
        tier: 'beta', // Use 'beta' tier for unlimited access
        type: 'demo'
      };

      const token = jwt.sign(tokenPayload, DEMO_TOKEN_SECRET, { expiresIn: DEMO_TOKEN_EXPIRES });

      // Track signup completion activity
      try {
        await taskStorage.createUserActivity({
          userId: newSignup.id,
          userType: 'demo',
          activityType: 'signup_completed',
          activityData: {
            email: newSignup.email,
            name: newSignup.name,
            marketingOptIn,
            signupSource: 'demo'
          },
          page: '/',
          sessionId: null,
          ipAddress: req.ip || req.connection.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null,
        });
      } catch (error) {
        console.error('Failed to track signup activity:', error);
        // Don't fail the signup if tracking fails
      }

      res.json({
        token,
        user: {
          id: newSignup.id,
          email: newSignup.email,
          name: newSignup.name,
          tier: 'free',
          authType: 'demo'
        }
      });

    } catch (error) {
      console.error("Error in demo signup:", error);
      res.status(500).json({ message: "Failed to create demo signup" });
    }
  });

  // Get demo signup info (for token hydration)
  app.get('/api/demo/signup', verifyDemoToken, async (req: any, res) => {
    try {
      const { signupId, email, name, tier } = req.demoUser;
      
      // Optionally fetch fresh data from database
      const signup = await taskStorage.getDemoSignupById(signupId);
      if (!signup) {
        return res.status(404).json({ message: "Demo signup not found" });
      }

      // Update last active timestamp
      await taskStorage.updateDemoSignupLastActive(signupId);

      res.json({
        user: {
          id: signupId,
          email,
          name,
          tier,
          authType: 'demo',
          signupDate: signup.createdAt
        }
      });

    } catch (error) {
      console.error("Error fetching demo signup:", error);
      res.status(500).json({ message: "Failed to fetch demo signup" });
    }
  });

  // Enhanced auth/user endpoint that works for both Replit users and demo users
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for demo token first
      const demoToken = req.headers['x-demo-token'] || req.cookies?.demoToken;
      
      if (demoToken) {
        try {
          const decoded = jwt.verify(demoToken, DEMO_TOKEN_SECRET);
          const decodedPayload = decoded as DemoTokenPayload;
          
          // Handle sandbox tokens specially (they don't have database records)
          if (decodedPayload.slackUserId) {
            return res.json({
              id: decodedPayload.signupId,
              email: decodedPayload.email,
              firstName: decodedPayload.name.split(' ')[0] || decodedPayload.name,
              lastName: decodedPayload.name.split(' ').slice(1).join(' ') || '',
              authType: 'demo',
              tier: decodedPayload.tier,
              slackUserId: decodedPayload.slackUserId
            });
          }
          
          // Handle regular demo tokens (look up in database)
          const signup = await taskStorage.getDemoSignupById(decodedPayload.signupId);
          
          if (signup) {
            // Update last active
            await taskStorage.updateDemoSignupLastActive(signup.id);
            
            return res.json({
              id: signup.id,
              email: signup.email,
              firstName: signup.name.split(' ')[0] || signup.name,
              lastName: signup.name.split(' ').slice(1).join(' ') || '',
              authType: 'demo',
              tier: decodedPayload.tier
            });
          }
        } catch (tokenError) {
          // Invalid demo token, fall through to regular auth
        }
      }

      // Check for regular Replit authentication
      if (req.user && req.user.claims) {
        return res.json({
          id: req.user.claims.sub,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          authType: 'replit',
          tier: 'premium' // Replit users get premium by default
        });
      }

      // No valid authentication found
      res.status(401).json({ message: "Authentication required" });

    } catch (error) {
      console.error("Error in enhanced auth check:", error);
      res.status(500).json({ message: "Authentication error" });
    }
  });
}