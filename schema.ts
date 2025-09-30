import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Task management system for AI Task Manager
// Based on the original PRD requirements for hackathon event production

// Tasks table - Core task management for event production
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("pending"), // pending, in_progress, overdue, completed
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  dueDate: timestamp("due_date"),
  assigneeSlackId: varchar("assignee_slack_id"), // Slack user ID
  assigneeName: varchar("assignee_name"),
  category: varchar("category"), // infrastructure, marketing, content, production, etc.
  tags: jsonb("tags"), // Array of tags for organization
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  isCriticalPath: boolean("is_critical_path").default(false),
  isAiGenerated: boolean("is_ai_generated").default(false),
  originalPrompt: text("original_prompt"), // For AI-generated tasks
  slackChannelId: varchar("slack_channel_id"), // Where task was created/discussed
  slackMessageTs: varchar("slack_message_ts"), // Slack message timestamp
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams/Workspaces for Slack integration
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slackTeamId: varchar("slack_team_id").unique().notNull(),
  slackTeamName: varchar("slack_team_name").notNull(),
  slackBotToken: text("slack_bot_token"), // Encrypted bot token
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Slack users for team collaboration
export const slackUsers = pgTable("slack_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slackUserId: varchar("slack_user_id").notNull(),
  slackTeamId: varchar("slack_team_id").references(() => teams.slackTeamId).notNull(),
  username: varchar("username"),
  realName: varchar("real_name"),
  email: varchar("email"),
  isBot: boolean("is_bot").default(false),
  profileImageUrl: varchar("profile_image_url"),
  timezone: varchar("timezone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project/Event configuration for timeline management
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  slackTeamId: varchar("slack_team_id").references(() => teams.slackTeamId).notNull(),
  eventDate: timestamp("event_date"), // Target event date (e.g., hackathon date)
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  status: varchar("status").default("active"), // active, completed, cancelled
  defaultSlackChannelId: varchar("default_slack_channel_id"), // Main project channel
  isTemplate: boolean("is_template").default(false), // For pre-loaded hackathon tasks
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gap analysis results for intelligent planning
export const gapAnalysis = pgTable("gap_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  analysisType: varchar("analysis_type").notNull(), // timeline, resource, dependency
  gapDescription: text("gap_description").notNull(),
  suggestedAction: text("suggested_action"),
  priority: varchar("priority").default("medium"),
  isResolved: boolean("is_resolved").default(false),
  aiGenerated: boolean("ai_generated").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Daily summaries and automated reports
export const dailySummaries = pgTable("daily_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  summaryDate: timestamp("summary_date").notNull(),
  slackChannelId: varchar("slack_channel_id").notNull(),
  slackMessageTs: varchar("slack_message_ts"), // Message timestamp when posted
  overdueTasks: integer("overdue_tasks").default(0),
  dueTodayTasks: integer("due_today_tasks").default(0),
  upcomingTasks: integer("upcoming_tasks").default(0),
  completedTasks: integer("completed_tasks").default(0),
  totalTasks: integer("total_tasks").default(0),
  completionPercentage: decimal("completion_percentage", { precision: 5, scale: 2 }).default("0.00"),
  summaryText: text("summary_text"),
  isAutomated: boolean("is_automated").default(true),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task dependencies for critical path analysis
export const taskDependencies = pgTable("task_dependencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dependentTaskId: varchar("dependent_task_id").references(() => tasks.id).notNull(),
  dependsOnTaskId: varchar("depends_on_task_id").references(() => tasks.id).notNull(),
  dependencyType: varchar("dependency_type").default("finish_to_start"), // finish_to_start, start_to_start, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Slack command audit log
export const slackCommands = pgTable("slack_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slackUserId: varchar("slack_user_id").notNull(),
  slackTeamId: varchar("slack_team_id").notNull(),
  command: varchar("command").notNull(), // /hackathon, /task, etc.
  arguments: text("arguments"), // Command arguments
  channelId: varchar("channel_id"),
  responseText: text("response_text"),
  executionTimeMs: integer("execution_time_ms"),
  wasSuccessful: boolean("was_successful").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.id], // This would need to be linked via project context
    references: [projects.id],
  }),
  dependencies: many(taskDependencies, { relationName: "dependent" }),
  dependsOn: many(taskDependencies, { relationName: "dependsOn" }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  users: many(slackUsers),
  projects: many(projects),
}));

export const slackUsersRelations = relations(slackUsers, ({ one }) => ({
  team: one(teams, {
    fields: [slackUsers.slackTeamId],
    references: [teams.slackTeamId],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, {
    fields: [projects.slackTeamId],
    references: [teams.slackTeamId],
  }),
  gapAnalyses: many(gapAnalysis),
  summaries: many(dailySummaries),
}));

export const gapAnalysisRelations = relations(gapAnalysis, ({ one }) => ({
  project: one(projects, {
    fields: [gapAnalysis.projectId],
    references: [projects.id],
  }),
}));

export const dailySummariesRelations = relations(dailySummaries, ({ one }) => ({
  project: one(projects, {
    fields: [dailySummaries.projectId],
    references: [projects.id],
  }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  dependentTask: one(tasks, {
    fields: [taskDependencies.dependentTaskId],
    references: [tasks.id],
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
  }),
}));

// Insert schemas for validation
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSlackUserSchema = createInsertSchema(slackUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGapAnalysisSchema = createInsertSchema(gapAnalysis).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertDailySummarySchema = createInsertSchema(dailySummaries).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const insertTaskDependencySchema = createInsertSchema(taskDependencies).omit({
  id: true,
  createdAt: true,
});

export const insertSlackCommandSchema = createInsertSchema(slackCommands).omit({
  id: true,
  createdAt: true,
});

// Types for TypeScript
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type SlackUser = typeof slackUsers.$inferSelect;
export type InsertSlackUser = z.infer<typeof insertSlackUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type GapAnalysis = typeof gapAnalysis.$inferSelect;
export type InsertGapAnalysis = z.infer<typeof insertGapAnalysisSchema>;
export type DailySummary = typeof dailySummaries.$inferSelect;
export type InsertDailySummary = z.infer<typeof insertDailySummarySchema>;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type InsertTaskDependency = z.infer<typeof insertTaskDependencySchema>;
export type SlackCommand = typeof slackCommands.$inferSelect;
export type InsertSlackCommand = z.infer<typeof insertSlackCommandSchema>;

// Demo signups for CRM tracking and guest user management
export const demoSignups = pgTable("demo_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  name: varchar("name").notNull(),
  marketingOptIn: boolean("marketing_opt_in").default(false),
  signupSource: varchar("signup_source").default("demo"), // demo, referral, organic
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

// Subscriptions for paywall and tier management
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull(), // Links to demoSignups.id or users.id
  subjectType: varchar("subject_type").notNull(), // "demo" or "user"
  tier: varchar("tier").notNull(), // "free", "basic", "premium"
  status: varchar("status").notNull().default("active"), // active, canceled, expired, trial
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripePriceId: varchar("stripe_price_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEnd: timestamp("trial_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Entitlements for feature access control
export const entitlements = pgTable("entitlements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull(), // Links to demoSignups.id or users.id
  subjectType: varchar("subject_type").notNull(), // "demo" or "user"
  featureFlags: jsonb("feature_flags").notNull(), // JSON object with feature permissions
  maxTasks: integer("max_tasks").default(10), // Tier-based task limits
  maxTeamMembers: integer("max_team_members").default(1),
  hasAnalytics: boolean("has_analytics").default(true),
  hasSlackIntegration: boolean("has_slack_integration").default(false),
  hasAiGeneration: boolean("has_ai_generation").default(false),
  hasAdvancedReporting: boolean("has_advanced_reporting").default(false),
  expiresAt: timestamp("expires_at"), // For time-limited demo access
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CRM tracking tables
export const pageVisits = pgTable("page_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id"), // Anonymous session tracking
  userId: varchar("user_id"), // Links to demoSignups.id when authenticated
  userType: varchar("user_type"), // "demo", "user", "anonymous"
  page: varchar("page").notNull(), // "/", "/dashboard", "/signup", etc.
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  utmSource: varchar("utm_source"),
  utmMedium: varchar("utm_medium"),
  utmCampaign: varchar("utm_campaign"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userActivities = pgTable("user_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Links to demoSignups.id or users.id
  userType: varchar("user_type").notNull(), // "demo" or "user"
  activityType: varchar("activity_type").notNull(), // "signup_completed", "dashboard_visited", "task_created", "slack_connected", etc.
  activityData: jsonb("activity_data"), // Additional context data
  page: varchar("page"), // Where the activity occurred
  sessionId: varchar("session_id"), // Session tracking
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Per-user Slack app credentials for secure individual workspace connections
export const userSlackCredentials = pgTable("user_slack_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Links to demoSignups.id or authenticated user.id
  userType: varchar("user_type").notNull(), // "demo" or "user"
  slackClientId: varchar("slack_client_id").notNull(), // User's individual Slack app client ID
  slackClientSecret: varchar("slack_client_secret").notNull(), // User's individual Slack app client secret (encrypted)
  slackBotToken: varchar("slack_bot_token"), // OAuth bot token after successful installation
  slackAccessToken: varchar("slack_access_token"), // OAuth access token
  slackTeamId: varchar("slack_team_id"), // Workspace team ID
  slackTeamName: varchar("slack_team_name"), // Workspace name
  isActive: boolean("is_active").default(true),
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for new tables
export const demoSignupsRelations = relations(demoSignups, ({ many }) => ({
  subscriptions: many(subscriptions),
  entitlements: many(entitlements),
  pageVisits: many(pageVisits),
  userActivities: many(userActivities),
  slackCredentials: many(userSlackCredentials),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  demoSignup: one(demoSignups, {
    fields: [subscriptions.subjectId],
    references: [demoSignups.id],
  }),
}));

export const entitlementsRelations = relations(entitlements, ({ one }) => ({
  demoSignup: one(demoSignups, {
    fields: [entitlements.subjectId],
    references: [demoSignups.id],
  }),
}));

// Insert schemas for new tables
export const insertDemoSignupSchema = createInsertSchema(demoSignups).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEntitlementSchema = createInsertSchema(entitlements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageVisitSchema = createInsertSchema(pageVisits).omit({
  id: true,
  createdAt: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivities).omit({
  id: true,
  createdAt: true,
});

export const insertUserSlackCredentialsSchema = createInsertSchema(userSlackCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type DemoSignup = typeof demoSignups.$inferSelect;
export type InsertDemoSignup = z.infer<typeof insertDemoSignupSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Entitlement = typeof entitlements.$inferSelect;
export type InsertEntitlement = z.infer<typeof insertEntitlementSchema>;
export type PageVisit = typeof pageVisits.$inferSelect;
export type InsertPageVisit = z.infer<typeof insertPageVisitSchema>;
export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserSlackCredentials = typeof userSlackCredentials.$inferSelect;
export type InsertUserSlackCredentials = z.infer<typeof insertUserSlackCredentialsSchema>;