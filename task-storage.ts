import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, desc, count, sql, ne } from 'drizzle-orm';
import {
  tasks,
  teams,
  slackUsers,
  projects,
  gapAnalysis,
  dailySummaries,
  taskDependencies,
  slackCommands,
  demoSignups,
  subscriptions,
  entitlements,
  pageVisits,
  userActivities,
  userSlackCredentials,
  type Task,
  type InsertTask,
  type Team,
  type InsertTeam,
  type SlackUser,
  type InsertSlackUser,
  type Project,
  type InsertProject,
  type GapAnalysis,
  type InsertGapAnalysis,
  type DailySummary,
  type InsertDailySummary,
  type DemoSignup,
  type InsertDemoSignup,
  type Subscription,
  type InsertSubscription,
  type Entitlement,
  type InsertEntitlement,
  type PageVisit,
  type InsertPageVisit,
  type UserActivity,
  type InsertUserActivity,
  type UserSlackCredentials,
  type InsertUserSlackCredentials,
} from '@shared/schema';

// Database connection
const db = drizzle(neon(process.env.DATABASE_URL!));

export interface ITaskStorage {
  // Task management
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTasksByPriority(priority: string): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  getTasksDueToday(): Promise<Task[]>;
  
  // User-specific task methods (sandbox mode)
  getUserTasks(slackUserId: string): Promise<Task[]>;
  getUserTasksByStatus(slackUserId: string, status: string): Promise<Task[]>;
  getUserOverdueTasks(slackUserId: string): Promise<Task[]>;
  
  // Team/Slack user management
  getTeam(slackTeamId: string): Promise<Team | null>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(slackTeamId: string, updates: Partial<InsertTeam>): Promise<Team>;
  getSlackUser(slackUserId: string, slackTeamId: string): Promise<SlackUser | null>;
  createSlackUser(user: InsertSlackUser): Promise<SlackUser>;
  
  // Project management
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  
  // Analytics and reporting
  getProjectStats(projectId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    dueTodayTasks: number;
    completionPercentage: number;
  }>;
  
  // Gap analysis
  getGapAnalysis(projectId: string): Promise<GapAnalysis[]>;
  createGapAnalysis(analysis: InsertGapAnalysis): Promise<GapAnalysis>;
  
  // Daily summaries
  getDailySummaries(projectId: string): Promise<DailySummary[]>;
  createDailySummary(summary: InsertDailySummary): Promise<DailySummary>;
  
  // Legacy user methods (for compatibility with auth system)
  getUser(id: string): Promise<any>;
  upsertUser(user: any): Promise<any>;
  
  // Demo signup methods
  getDemoSignupByEmail(email: string): Promise<DemoSignup | null>;
  getDemoSignupById(id: string): Promise<DemoSignup | null>;
  createDemoSignup(signup: InsertDemoSignup): Promise<DemoSignup>;
  updateDemoSignupLastActive(id: string): Promise<void>;
  
  // Entitlement methods
  createEntitlement(entitlement: Omit<Entitlement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entitlement>;
  getEntitlementBySubject(subjectId: string, subjectType: string): Promise<Entitlement | null>;
  updateDemoEntitlements(signupId: string, entitlementData: Omit<Entitlement, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
  
  // Subscription methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionBySubject(subjectId: string, subjectType: string): Promise<Subscription | null>;
  
  // CRM tracking methods
  createPageVisit(visit: InsertPageVisit): Promise<PageVisit>;
  getPageVisitsByUser(userId: string, userType: string): Promise<PageVisit[]>;
  getPageVisitsByPage(page: string): Promise<PageVisit[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  getUserActivities(userId: string, userType: string): Promise<UserActivity[]>;
  getUserActivitiesByType(activityType: string): Promise<UserActivity[]>;
  getAllUserActivities(limit?: number): Promise<UserActivity[]>;
}

export class TaskStorage implements ITaskStorage {
  // Task management methods
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | null> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0] || null;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    // Fetch the current task to check if status is changing
    const currentTask = await this.getTask(id);
    if (!currentTask) {
      throw new Error(`Task ${id} not found`);
    }
    
    // Prepare the update object with completedAt handling
    const updateData: any = { ...updates, updatedAt: new Date() };
    
    // Only set completedAt if transitioning TO completed (not already completed)
    if (updates.status === 'completed' && currentTask.status !== 'completed') {
      updateData.completedAt = new Date();
    }
    // If status is being changed from 'completed' to something else, clear completedAt
    if (updates.status && updates.status !== 'completed' && currentTask.status === 'completed') {
      updateData.completedAt = null;
    }
    
    const result = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.priority, priority))
      .orderBy(desc(tasks.createdAt));
  }

  async getOverdueTasks(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'pending'),
          sql`${tasks.dueDate} < NOW()`
        )
      )
      .orderBy(tasks.dueDate);
  }

  async getTasksDueToday(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'pending'),
          sql`DATE(${tasks.dueDate}) = CURRENT_DATE`
        )
      )
      .orderBy(tasks.dueDate);
  }

  // User-specific task methods (sandbox mode)
  async getUserTasks(slackUserId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeSlackId, slackUserId))
      .orderBy(desc(tasks.createdAt));
  }

  async getUserTasksByStatus(slackUserId: string, status: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeSlackId, slackUserId),
          eq(tasks.status, status)
        )
      )
      .orderBy(desc(tasks.createdAt));
  }

  async getUserOverdueTasks(slackUserId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeSlackId, slackUserId),
          sql`${tasks.dueDate} < NOW()`,
          ne(tasks.status, 'completed')
        )
      )
      .orderBy(tasks.dueDate);
  }

  // Team management methods
  async getTeam(slackTeamId: string): Promise<Team | null> {
    const result = await db.select().from(teams).where(eq(teams.slackTeamId, slackTeamId));
    return result[0] || null;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const result = await db.insert(teams).values(team).returning();
    return result[0];
  }

  async updateTeam(slackTeamId: string, updates: Partial<InsertTeam>): Promise<Team> {
    const result = await db
      .update(teams)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(teams.slackTeamId, slackTeamId))
      .returning();
    return result[0];
  }

  async getSlackUser(slackUserId: string, slackTeamId: string): Promise<SlackUser | null> {
    const result = await db
      .select()
      .from(slackUsers)
      .where(
        and(
          eq(slackUsers.slackUserId, slackUserId),
          eq(slackUsers.slackTeamId, slackTeamId)
        )
      );
    return result[0] || null;
  }

  async createSlackUser(user: InsertSlackUser): Promise<SlackUser> {
    const result = await db.insert(slackUsers).values(user).returning();
    return result[0];
  }

  // Project management methods
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | null> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0] || null;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const result = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  // Analytics methods
  async getProjectStats(projectId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    dueTodayTasks: number;
    completionPercentage: number;
  }> {
    // For now, return basic stats from all tasks
    // TODO: Link tasks to projects when schema is updated
    const totalResult = await db.select({ count: count() }).from(tasks);
    const completedResult = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.status, 'completed'));
    const overdueResult = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'pending'),
          sql`${tasks.dueDate} < NOW()`
        )
      );
    const dueTodayResult = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'pending'),
          sql`DATE(${tasks.dueDate}) = CURRENT_DATE`
        )
      );

    const totalTasks = totalResult[0]?.count || 0;
    const completedTasks = completedResult[0]?.count || 0;
    const overdueTasks = overdueResult[0]?.count || 0;
    const dueTodayTasks = dueTodayResult[0]?.count || 0;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      dueTodayTasks,
      completionPercentage,
    };
  }

  // Gap analysis methods
  async getGapAnalysis(projectId: string): Promise<GapAnalysis[]> {
    return await db
      .select()
      .from(gapAnalysis)
      .where(eq(gapAnalysis.projectId, projectId))
      .orderBy(desc(gapAnalysis.createdAt));
  }

  async createGapAnalysis(analysis: InsertGapAnalysis): Promise<GapAnalysis> {
    const result = await db.insert(gapAnalysis).values(analysis).returning();
    return result[0];
  }

  // Daily summary methods
  async getDailySummaries(projectId: string): Promise<DailySummary[]> {
    return await db
      .select()
      .from(dailySummaries)
      .where(eq(dailySummaries.projectId, projectId))
      .orderBy(desc(dailySummaries.summaryDate));
  }

  async createDailySummary(summary: InsertDailySummary): Promise<DailySummary> {
    const result = await db.insert(dailySummaries).values(summary).returning();
    return result[0];
  }

  // Legacy user methods for compatibility
  async getUser(id: string): Promise<any> {
    // For now, return a basic user object
    // TODO: Implement proper user management or adapt to Slack users
    return {
      id,
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Name',
    };
  }

  async upsertUser(user: any): Promise<any> {
    // For now, just return the user object
    // TODO: Implement proper user management or adapt to Slack users
    return user;
  }

  // Demo signup methods
  async getDemoSignupByEmail(email: string): Promise<DemoSignup | null> {
    const result = await db.select().from(demoSignups).where(eq(demoSignups.email, email));
    return result[0] || null;
  }

  async getDemoSignupById(id: string): Promise<DemoSignup | null> {
    const result = await db.select().from(demoSignups).where(eq(demoSignups.id, id));
    return result[0] || null;
  }

  async createDemoSignup(signup: InsertDemoSignup): Promise<DemoSignup> {
    const result = await db.insert(demoSignups).values(signup).returning();
    return result[0];
  }

  async updateDemoSignupLastActive(id: string): Promise<void> {
    await db
      .update(demoSignups)
      .set({ lastActiveAt: new Date() })
      .where(eq(demoSignups.id, id));
  }

  async getAllDemoSignups(): Promise<DemoSignup[]> {
    const result = await db.select().from(demoSignups).orderBy(desc(demoSignups.createdAt));
    return result;
  }

  // Entitlement methods
  async createEntitlement(entitlement: Omit<Entitlement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entitlement> {
    const result = await db.insert(entitlements).values(entitlement).returning();
    return result[0];
  }

  async getEntitlementBySubject(subjectId: string, subjectType: string): Promise<Entitlement | null> {
    const result = await db
      .select()
      .from(entitlements)
      .where(
        and(
          eq(entitlements.subjectId, subjectId),
          eq(entitlements.subjectType, subjectType)
        )
      );
    return result[0] || null;
  }

  async updateDemoEntitlements(signupId: string, entitlementData: Omit<Entitlement, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await db.update(entitlements).set({
      featureFlags: entitlementData.featureFlags,
      maxTasks: entitlementData.maxTasks,
      maxTeamMembers: entitlementData.maxTeamMembers,
      hasAnalytics: entitlementData.hasAnalytics,
      hasSlackIntegration: entitlementData.hasSlackIntegration,
      hasAiGeneration: entitlementData.hasAiGeneration,
      hasAdvancedReporting: entitlementData.hasAdvancedReporting,
      expiresAt: entitlementData.expiresAt,
      updatedAt: new Date()
    }).where(
      and(
        eq(entitlements.subjectId, signupId),
        eq(entitlements.subjectType, 'demo')
      )
    );
  }

  // Subscription methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription).returning();
    return result[0];
  }

  async getSubscriptionBySubject(subjectId: string, subjectType: string): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subjectId, subjectId),
          eq(subscriptions.subjectType, subjectType)
        )
      );
    return result[0] || null;
  }

  // CRM tracking methods
  async createPageVisit(visit: InsertPageVisit): Promise<PageVisit> {
    const result = await db.insert(pageVisits).values(visit).returning();
    return result[0];
  }

  async getPageVisitsByUser(userId: string, userType: string): Promise<PageVisit[]> {
    return await db
      .select()
      .from(pageVisits)
      .where(
        and(
          eq(pageVisits.userId, userId),
          eq(pageVisits.userType, userType)
        )
      )
      .orderBy(desc(pageVisits.createdAt));
  }

  async getPageVisitsByPage(page: string): Promise<PageVisit[]> {
    return await db
      .select()
      .from(pageVisits)
      .where(eq(pageVisits.page, page))
      .orderBy(desc(pageVisits.createdAt));
  }

  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const result = await db.insert(userActivities).values(activity).returning();
    return result[0];
  }

  async getUserActivities(userId: string, userType: string): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivities)
      .where(
        and(
          eq(userActivities.userId, userId),
          eq(userActivities.userType, userType)
        )
      )
      .orderBy(desc(userActivities.createdAt));
  }

  async getUserActivitiesByType(activityType: string): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.activityType, activityType))
      .orderBy(desc(userActivities.createdAt));
  }

  async getAllUserActivities(limit: number = 50): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivities)
      .orderBy(desc(userActivities.createdAt))
      .limit(limit);
  }

  // Per-user Slack credentials methods
  async createUserSlackCredentials(credentials: InsertUserSlackCredentials): Promise<UserSlackCredentials> {
    const result = await db.insert(userSlackCredentials).values(credentials).returning();
    return result[0];
  }

  async getUserSlackCredentials(userId: string, userType: string): Promise<UserSlackCredentials | null> {
    const result = await db
      .select()
      .from(userSlackCredentials)
      .where(
        and(
          eq(userSlackCredentials.userId, userId),
          eq(userSlackCredentials.userType, userType),
          eq(userSlackCredentials.isActive, true)
        )
      );
    return result[0] || null;
  }

  async updateUserSlackCredentials(userId: string, userType: string, updates: Partial<UserSlackCredentials>): Promise<void> {
    await db
      .update(userSlackCredentials)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(userSlackCredentials.userId, userId),
          eq(userSlackCredentials.userType, userType)
        )
      );
  }

  async deactivateUserSlackCredentials(userId: string, userType: string): Promise<void> {
    await db
      .update(userSlackCredentials)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(userSlackCredentials.userId, userId),
          eq(userSlackCredentials.userType, userType)
        )
      );
  }
}

// Export storage instance
export const taskStorage = new TaskStorage();