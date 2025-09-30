import { Request, Response, Express } from 'express';
import { taskStorage } from './task-storage';

// Admin authentication middleware - requires actual authenticated session
const requireAdminAuth = (req: Request, res: Response, next: any) => {
  // Check if user is authenticated via session (Replit OIDC)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin access required. Please authenticate via Replit OIDC.' });
};

export function setupSandboxAnalytics(app: Express) {
  // Admin: Get sandbox-specific analytics
  app.get('/api/admin/sandbox-analytics', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      // Get all tasks to analyze sandbox usage
      const allTasks = await taskStorage.getAllTasks();
      const sandboxTasks = allTasks.filter(task => task.assigneeSlackId);
      
      // Calculate unique sandbox users
      const uniqueSandboxUsers = new Set(sandboxTasks.map(task => task.assigneeSlackId));
      const sandboxUserIds = Array.from(uniqueSandboxUsers);
      
      // Get template usage analytics
      const templateCommands = await taskStorage.getUserActivitiesByType('slack_command');
      const startCommands = templateCommands.filter(cmd => {
        const data = cmd.activityData as any;
        return data?.command === '/start';
      });
      
      // Group tasks by user to get per-user metrics
      const tasksByUser = sandboxUserIds.map(userId => {
        const userTasks = sandboxTasks.filter(task => task.assigneeSlackId === userId);
        const completedTasks = userTasks.filter(task => task.status === 'completed');
        
        return {
          slackUserId: userId,
          totalTasks: userTasks.length,
          completedTasks: completedTasks.length,
          completionRate: userTasks.length > 0 ? ((completedTasks.length / userTasks.length) * 100).toFixed(1) : '0',
          lastActivity: userTasks.length > 0 ? userTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt : null
        };
      });
      
      // Calculate summary metrics
      const sandboxAnalytics = {
        totalSandboxUsers: uniqueSandboxUsers.size,
        totalSandboxTasks: sandboxTasks.length,
        completedSandboxTasks: sandboxTasks.filter(task => task.status === 'completed').length,
        averageTasksPerUser: uniqueSandboxUsers.size > 0 ? (sandboxTasks.length / uniqueSandboxUsers.size).toFixed(1) : '0',
        overallCompletionRate: sandboxTasks.length > 0 ? ((sandboxTasks.filter(task => task.status === 'completed').length / sandboxTasks.length) * 100).toFixed(1) : '0',
        templateStartCommands: startCommands.length,
        activeUsers: tasksByUser.filter(user => user.totalTasks > 0).length,
        engagedUsers: tasksByUser.filter(user => user.totalTasks >= 3).length,
        powerUsers: tasksByUser.filter(user => user.totalTasks >= 10).length,
        userBreakdown: tasksByUser.sort((a, b) => b.totalTasks - a.totalTasks).slice(0, 20) // Top 20 users
      };
      
      res.json(sandboxAnalytics);
      
    } catch (error) {
      console.error('Error getting sandbox analytics:', error);
      res.status(500).json({ error: 'Failed to get sandbox analytics' });
    }
  });
}