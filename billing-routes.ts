import type { Express } from "express";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { verifyDemoToken } from "./demo-routes";
import { isAuthenticated } from "./replitAuth";
import { taskStorage } from "./task-storage";
import { insertSubscriptionSchema, type Subscription } from "@shared/schema";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Pricing configuration for subscription tiers
export const PRICING_CONFIG = {
  basic: {
    name: "Basic Plan",
    description: "Perfect for small teams and basic project management",
    price: 19.99,
    currency: "usd",
    interval: "month",
    features: [
      "Up to 50 tasks",
      "5 team members",
      "Basic analytics",
      "Slack integration",
      "Email support"
    ],
    limits: {
      maxTasks: 50,
      maxTeamMembers: 5,
      hasAnalytics: true,
      hasSlackIntegration: true,
      hasAiGeneration: false,
      hasAdvancedReporting: false
    }
  },
  premium: {
    name: "Premium Plan", 
    description: "Advanced features for growing teams and complex events",
    price: 49.99,
    currency: "usd",
    interval: "month",
    features: [
      "Unlimited tasks",
      "Unlimited team members", 
      "Advanced analytics & reporting",
      "AI task generation",
      "Slack integration",
      "Priority support",
      "Custom workflows"
    ],
    limits: {
      maxTasks: -1, // unlimited
      maxTeamMembers: -1, // unlimited
      hasAnalytics: true,
      hasSlackIntegration: true,
      hasAiGeneration: true,
      hasAdvancedReporting: true
    }
  }
};

// Middleware to get user from either demo token or Replit auth
async function getCurrentUser(req: any, res: any, next: any) {
  // Check for demo token first
  const demoToken = req.headers['x-demo-token'] || req.cookies?.demoToken;
  
  if (demoToken) {
    try {
      const secret = process.env.DEMO_TOKEN_SECRET || process.env.SESSION_SECRET;
      if (!secret) throw new Error("No JWT secret");
      
      const decoded = jwt.verify(demoToken, secret);
      const payload = decoded as any;
      
      req.currentUser = {
        id: payload.signupId,
        email: payload.email,
        name: payload.name,
        authType: 'demo',
        tier: payload.tier || 'free'
      };
      return next();
    } catch (error) {
      // Invalid demo token, fall through
    }
  }

  // Check for Replit authentication
  if (req.user && req.user.claims) {
    req.currentUser = {
      id: req.user.claims.sub,
      email: req.user.claims.email,
      name: `${req.user.claims.first_name} ${req.user.claims.last_name}`,
      authType: 'replit',
      tier: 'premium' // Replit users get premium by default
    };
    return next();
  }

  // No valid authentication
  return res.status(401).json({ message: "Authentication required" });
}

export function registerBillingRoutes(app: Express): void {

  // Create Stripe checkout session for tier upgrades
  app.post('/api/billing/checkout-session', getCurrentUser, async (req: any, res) => {
    try {
      const { tier } = req.body;
      const user = req.currentUser;

      if (!tier || !PRICING_CONFIG[tier as keyof typeof PRICING_CONFIG]) {
        return res.status(400).json({ message: "Invalid tier specified" });
      }

      const tierConfig = PRICING_CONFIG[tier as keyof typeof PRICING_CONFIG];

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: tierConfig.currency,
              product_data: {
                name: tierConfig.name,
                description: tierConfig.description,
              },
              unit_amount: Math.round(tierConfig.price * 100), // Convert to cents
              recurring: {
                interval: tierConfig.interval as 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/dashboard?success=true&tier=${tier}`,
        cancel_url: `${req.headers.origin}/dashboard?canceled=true`,
        customer_email: user.email,
        metadata: {
          userId: user.id,
          userType: user.authType,
          tier: tier,
          userName: user.name,
        },
      });

      res.json({
        sessionId: session.id,
        url: session.url
      });

    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Stripe webhook handler for subscription events
  app.post('/api/billing/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      return res.status(500).json({ message: "Webhook secret not configured" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const metadata = session.metadata;
          
          if (!metadata?.userId || !metadata?.tier) {
            console.error("Missing metadata in checkout session");
            break;
          }

          // Create subscription record
          const subscriptionData = {
            subjectId: metadata.userId,
            subjectType: metadata.userType || 'demo',
            tier: metadata.tier,
            status: 'active',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          };

          await taskStorage.createSubscription(subscriptionData);

          // Update entitlements
          const tierConfig = PRICING_CONFIG[metadata.tier as keyof typeof PRICING_CONFIG];
          if (tierConfig) {
            const entitlementData = {
              subjectId: metadata.userId,
              subjectType: metadata.userType || 'demo',
              featureFlags: {
                ...tierConfig.limits,
                subscriptionActive: true
              },
              maxTasks: tierConfig.limits.maxTasks,
              maxTeamMembers: tierConfig.limits.maxTeamMembers,
              hasAnalytics: tierConfig.limits.hasAnalytics,
              hasSlackIntegration: tierConfig.limits.hasSlackIntegration,
              hasAiGeneration: tierConfig.limits.hasAiGeneration,
              hasAdvancedReporting: tierConfig.limits.hasAdvancedReporting,
              expiresAt: null, // Subscriptions don't expire (unlike free trials)
            };

            await taskStorage.createEntitlement(entitlementData);
          }

          console.log(`✅ Subscription created for user ${metadata.userId} - ${metadata.tier} tier`);
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          
          // Update subscription status in database
          // TODO: Implement subscription updates based on Stripe events
          console.log(`📋 Subscription ${event.type}: ${subscription.id}`);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Get current billing status and entitlements
  app.get('/api/billing/status', getCurrentUser, async (req: any, res) => {
    try {
      const user = req.currentUser;

      // Get current subscription
      const subscription = await taskStorage.getSubscriptionBySubject(user.id, user.authType);
      
      // Get current entitlements
      const entitlements = await taskStorage.getEntitlementBySubject(user.id, user.authType);

      // Determine current tier
      let currentTier = 'free';
      if (subscription && subscription.status === 'active') {
        currentTier = subscription.tier;
      } else if (user.authType === 'replit') {
        currentTier = 'premium'; // Replit users get premium
      } else if (user.authType === 'demo') {
        currentTier = 'beta'; // Demo users are beta testers with premium access
      }

      const response = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          authType: user.authType,
        },
        subscription: subscription ? {
          id: subscription.id,
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        } : null,
        currentTier,
        entitlements: entitlements ? {
          maxTasks: entitlements.maxTasks,
          maxTeamMembers: entitlements.maxTeamMembers,
          hasAnalytics: entitlements.hasAnalytics,
          hasSlackIntegration: entitlements.hasSlackIntegration,
          hasAiGeneration: entitlements.hasAiGeneration,
          hasAdvancedReporting: entitlements.hasAdvancedReporting,
          featureFlags: entitlements.featureFlags,
        } : {
          // Default free tier limits
          maxTasks: 10,
          maxTeamMembers: 1,
          hasAnalytics: true,
          hasSlackIntegration: false,
          hasAiGeneration: false,
          hasAdvancedReporting: false,
          featureFlags: { basicAccess: true },
        },
        availablePlans: PRICING_CONFIG,
      };

      res.json(response);

    } catch (error) {
      console.error("Error fetching billing status:", error);
      res.status(500).json({ message: "Failed to fetch billing status" });
    }
  });

  // Get available pricing plans
  app.get('/api/billing/plans', (req, res) => {
    res.json({
      plans: PRICING_CONFIG
    });
  });
}