import { Request, Response, Express } from 'express';
import { taskStorage } from './task-storage';
import { insertUserSlackCredentialsSchema } from '@shared/schema';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const DEMO_TOKEN_SECRET = process.env.DEMO_TOKEN_SECRET || process.env.SESSION_SECRET || 'fallback-secret';

// Get encryption key - will validate when actually used
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY environment variable is required and must be at least 32 characters. Please set a strong encryption key.');
  }
  return key;
};

interface DemoTokenPayload {
  signupId: string;
  email: string;
  name: string;
  tier: string;
  type: 'demo';
}

// Middleware to get user info (demo or regular)
const getUserInfo = (req: Request): { userId: string | null, userType: string | null } => {
  // Check for demo token
  const demoToken = req.headers['x-demo-token'] as string || req.cookies?.demoToken;
  
  if (demoToken && DEMO_TOKEN_SECRET) {
    try {
      const decoded = jwt.verify(demoToken, DEMO_TOKEN_SECRET) as DemoTokenPayload;
      return { userId: decoded.signupId, userType: 'demo' };
    } catch (error) {
      console.log('❌ Invalid demo token:', error);
    }
  }

  // Check for regular authentication
  if ((req as any).user?.claims?.sub) {
    return { userId: (req as any).user.claims.sub, userType: 'user' };
  }

  return { userId: null, userType: null };
};

// Secure encryption for storing client secrets using AES-256-GCM
const encrypt = (text: string): string => {
  const encryptionKey = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const key = Buffer.from(encryptionKey, 'utf8').subarray(0, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return IV + authTag + encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedText: string): string => {
  const encryptionKey = getEncryptionKey();
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const key = Buffer.from(encryptionKey, 'utf8').subarray(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export function setupSlackSetupRoutes(app: Express) {
  // Slack app manifest endpoint
  app.get('/api/slack/manifest', (req: Request, res: Response) => {
    const manifest = {
      display_information: {
        name: "AI Task Manager",
        description: "AI-powered task management for your Slack workspace",
        background_color: "#2c3e50"
      },
      features: {
        bot_user: {
          display_name: "AI Task Manager",
          always_online: true
        },
        slash_commands: [
          {
            command: "/tasks",
            description: "View and manage your tasks",
            usage_hint: "status | overdue | help"
          },
          {
            command: "/new",
            description: "Create a new task",
            usage_hint: "task description, due date, assignee"
          }
        ]
      },
      oauth_config: {
        redirect_urls: [
          `${req.protocol}://${req.get('host')}/api/slack/oauth/callback`
        ],
        scopes: {
          bot: [
            "commands",
            "chat:write",
            "channels:read",
            "users:read"
          ]
        }
      },
      settings: {
        event_subscriptions: {
          bot_events: [
            "message.channels",
            "app_mention"
          ]
        },
        interactivity: {
          is_enabled: true
        },
        org_deploy_enabled: false,
        socket_mode_enabled: true,
        token_rotation_enabled: false
      }
    };

    res.json(manifest);
  });

  // Save user's Slack app credentials
  app.post('/api/slack/setup-credentials', async (req: Request, res: Response) => {
    try {
      const { userId, userType } = getUserInfo(req);
      
      if (!userId || !userType) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { slackClientId, slackClientSecret } = req.body;
      
      if (!slackClientId || !slackClientSecret) {
        return res.status(400).json({ error: 'Client ID and Client Secret are required' });
      }

      // Validate basic format
      if (typeof slackClientId !== 'string' || typeof slackClientSecret !== 'string') {
        return res.status(400).json({ error: 'Invalid credential format' });
      }

      // Check if user already has credentials
      const existingCredentials = await taskStorage.getUserSlackCredentials(userId, userType);
      
      if (existingCredentials) {
        // Update existing credentials
        await taskStorage.updateUserSlackCredentials(userId, userType, {
          slackClientId: slackClientId.trim(),
          slackClientSecret: encrypt(slackClientSecret.trim()),
          updatedAt: new Date()
        });
      } else {
        // Create new credentials
        const credentialsData = insertUserSlackCredentialsSchema.parse({
          userId,
          userType,
          slackClientId: slackClientId.trim(),
          slackClientSecret: encrypt(slackClientSecret.trim()),
          isActive: true
        });

        await taskStorage.createUserSlackCredentials(credentialsData);
      }

      console.log(`✅ Slack credentials saved for user ${userId} (${userType})`);
      res.json({ success: true, message: 'Slack credentials saved successfully' });

    } catch (error) {
      console.error('Error saving Slack credentials:', error);
      res.status(500).json({ error: 'Failed to save Slack credentials' });
    }
  });

  // Test Slack connection
  app.post('/api/slack/test-connection', async (req: Request, res: Response) => {
    try {
      const { userId, userType } = getUserInfo(req);
      
      if (!userId || !userType) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const credentials = await taskStorage.getUserSlackCredentials(userId, userType);
      
      if (!credentials) {
        return res.status(400).json({ error: 'No Slack credentials found. Please complete setup first.' });
      }

      // Validate credential format instead of calling Slack API
      // (auth.test expects bot tokens, not client credentials)
      const clientId = credentials.slackClientId;
      const clientSecret = decrypt(credentials.slackClientSecret);

      // Basic format validation for Slack Client ID and Secret
      if (!clientId || !clientId.match(/^\d+\.\d+$/)) {
        return res.status(400).json({ 
          error: 'Invalid Client ID format. Expected format: XXXXXXXXXX.XXXXXXXXXX' 
        });
      }

      if (!clientSecret || clientSecret.length < 32) {
        return res.status(400).json({ 
          error: 'Invalid Client Secret format. Must be at least 32 characters.' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Slack credentials format is valid and ready for OAuth' 
      });

    } catch (error) {
      console.error('Error testing Slack connection:', error);
      res.status(500).json({ error: 'Failed to test Slack connection' });
    }
  });

  // Enhanced Slack OAuth installation using per-user credentials
  app.get('/api/slack/install', async (req: Request, res: Response) => {
    try {
      const { userId, userType } = getUserInfo(req);
      
      if (!userId || !userType) {
        return res.redirect('/?slack_error=auth_required');
      }

      // Get user's Slack credentials
      const credentials = await taskStorage.getUserSlackCredentials(userId, userType);
      
      if (!credentials) {
        console.error('❌ No Slack credentials found for user:', userId);
        return res.redirect('/?slack_error=setup_required');
      }

      const clientId = credentials.slackClientId;
      const scopes = 'commands,chat:write,channels:read,users:read';
      const redirectUri = `${req.protocol}://${req.get('host')}/api/slack/oauth/callback`;
      
      const authUrl = `https://slack.com/oauth/v2/authorize?` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${userId}:${userType}`;

      console.log('🔗 Redirecting to per-user Slack OAuth:', authUrl);
      res.redirect(authUrl);

    } catch (error) {
      console.error('Error starting Slack OAuth:', error);
      res.status(500).json({ error: 'Failed to start OAuth flow' });
    }
  });

  // Enhanced OAuth callback to handle per-user credentials
  app.get('/api/slack/oauth/callback', async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        console.error('❌ Slack OAuth error:', error);
        return res.redirect('/?slack_error=' + encodeURIComponent(error as string));
      }

      if (!code || !state) {
        console.error('❌ No authorization code or state received');
        return res.redirect('/?slack_error=invalid_callback');
      }

      // Parse state to get user info
      const [userId, userType] = (state as string).split(':');
      
      if (!userId || !userType) {
        console.error('❌ Invalid state parameter');
        return res.redirect('/?slack_error=invalid_state');
      }

      // Get user's Slack credentials
      const credentials = await taskStorage.getUserSlackCredentials(userId, userType);
      
      if (!credentials) {
        console.error('❌ No Slack credentials found for user:', userId);
        return res.redirect('/?slack_error=missing_credentials');
      }

      const clientId = credentials.slackClientId;
      const clientSecret = decrypt(credentials.slackClientSecret);

      // Exchange code for access token
      const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code as string,
          redirect_uri: `${req.protocol}://${req.get('host')}/api/slack/oauth/callback`
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.ok) {
        console.error('❌ Failed to exchange OAuth code:', tokenData.error);
        return res.redirect('/?slack_error=' + encodeURIComponent(tokenData.error));
      }

      // Update user's credentials with OAuth tokens
      await taskStorage.updateUserSlackCredentials(userId, userType, {
        slackBotToken: tokenData.access_token,
        slackAccessToken: tokenData.access_token,
        slackTeamId: tokenData.team?.id,
        slackTeamName: tokenData.team?.name,
        lastConnected: new Date()
      });

      console.log(`✅ Slack OAuth completed for user ${userId} (${userType}), team: ${tokenData.team?.name}`);
      
      // Redirect back to dashboard with success message
      res.redirect('/dashboard?slack_connected=true');

    } catch (error) {
      console.error('❌ Error in Slack OAuth callback:', error);
      res.redirect('/?slack_error=callback_failed');
    }
  });

  // Get user's Slack connection status
  app.get('/api/slack/status', async (req: Request, res: Response) => {
    try {
      const { userId, userType } = getUserInfo(req);
      
      if (!userId || !userType) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const credentials = await taskStorage.getUserSlackCredentials(userId, userType);
      
      if (!credentials) {
        return res.json({ 
          hasCredentials: false, 
          isConnected: false,
          needsSetup: true
        });
      }

      const isConnected = !!(credentials.slackBotToken && credentials.slackTeamId);
      
      res.json({
        hasCredentials: true,
        isConnected,
        needsSetup: false,
        teamName: credentials.slackTeamName,
        lastConnected: credentials.lastConnected
      });

    } catch (error) {
      console.error('Error getting Slack status:', error);
      res.status(500).json({ error: 'Failed to get Slack status' });
    }
  });
}