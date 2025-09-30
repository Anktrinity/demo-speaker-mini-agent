import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { verifyDemoToken, createSandboxToken } from "./demo-routes";
import { getTaskTemplates } from "./templates";
import { insertTaskSchema, insertProjectSchema, insertSlackCommandSchema } from "@shared/schema";
import { taskStorage } from "./task-storage";
import { randomUUID } from "crypto";

// Placeholder for Slack SDK (to be installed later)
// import { App } from '@slack/bolt';

export function registerTaskRoutes(app: Express): void {
  // Note: Auth middleware is set up in main server

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      service: 'AI Task Manager',
      timestamp: new Date().toISOString()
    });
  });

  // Auth routes - NOTE: /api/auth/user is handled in demo-routes.ts with demo token support

  // Task management API endpoints
  app.get('/api/tasks', verifyDemoToken, async (req: any, res) => {
    try {
      let tasks: any[];
      
      // Get user-specific tasks for both sandbox and regular demo users
      let userIdentifier: string;
      
      if (req.demoUser?.slackUserId) {
        // Sandbox mode: use Slack user ID
        userIdentifier = req.demoUser.slackUserId;
      } else {
        // Regular demo users: use their signup ID as identifier
        userIdentifier = req.demoUser.signupId;
      }
      
      // Get tasks assigned to this user (will be empty for new users = blank state)
      tasks = await taskStorage.getUserTasks(userIdentifier);
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', verifyDemoToken, async (req: any, res) => {
    try {
      const taskData = req.body;
      
      // Auto-assign task to the current demo user
      let assigneeSlackId: string;
      let assigneeName: string;
      
      if (req.demoUser?.slackUserId) {
        // Sandbox users: use their Slack ID and name
        assigneeSlackId = req.demoUser.slackUserId;
        assigneeName = taskData.assigneeName || req.demoUser.name;
      } else {
        // Regular demo users: use their signup ID and name
        assigneeSlackId = req.demoUser.signupId;
        assigneeName = req.demoUser.name;
      }
      
      // Validate task data
      const validatedTask = insertTaskSchema.parse({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        category: taskData.category,
        assigneeSlackId: assigneeSlackId,
        assigneeName: assigneeName,
        isAiGenerated: taskData.isAiGenerated || false,
        originalPrompt: taskData.originalPrompt,
      });

      // Save task to database
      const newTask = await taskStorage.createTask(validatedTask);

      res.json(newTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id', verifyDemoToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Prepare updates with proper date handling
      const processedUpdates: any = { ...updates };
      if (processedUpdates.dueDate) {
        processedUpdates.dueDate = new Date(processedUpdates.dueDate);
      }
      
      // Update task in database
      const updatedTask = await taskStorage.updateTask(id, processedUpdates);
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', verifyDemoToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // TODO: Implement task deletion
      res.json({ message: "Task deleted", id });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Project management endpoints
  app.get('/api/projects', async (req, res) => {
    try {
      // TODO: Implement project retrieval
      res.json([]);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = req.body;
      
      // Validate project data
      const validatedProject = insertProjectSchema.parse({
        name: projectData.name,
        description: projectData.description,
        slackTeamId: projectData.slackTeamId,
        eventDate: projectData.eventDate,
        defaultSlackChannelId: projectData.defaultSlackChannelId,
      });

      // TODO: Save to database when schema is migrated
      const newProject = {
        id: randomUUID(),
        ...validatedProject,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Analytics and status endpoints
  app.get('/api/status', verifyDemoToken, async (req: any, res) => {
    try {
      let stats;
      
      // For all demo users, return their personal task stats
      if (req.demoUser) {
        let userIdentifier: string;
        
        if (req.demoUser.slackUserId) {
          // Sandbox users: use Slack user ID
          userIdentifier = req.demoUser.slackUserId;
        } else {
          // Regular demo users: use their signup ID
          userIdentifier = req.demoUser.signupId;
        }
        
        // Get user's personal tasks for stats calculation
        const userTasks = await taskStorage.getUserTasks(userIdentifier);
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const totalTasks = userTasks.length;
        const completedTasks = userTasks.filter(task => task.status === 'completed').length;
        const overdueTasks = userTasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed'
        ).length;
        const dueTodayTasks = userTasks.filter(task => 
          task.dueDate && new Date(task.dueDate) >= today && new Date(task.dueDate) < tomorrow && task.status !== 'completed'
        ).length;
        
        stats = {
          totalTasks,
          completedTasks,
          overdueTasks,
          dueTodayTasks,
          completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
      } else {
        stats = await taskStorage.getProjectStats('default');
      }
      
      const status = {
        ...stats,
        upcomingTasks: 0, // TODO: Calculate upcoming tasks
        daysToEvent: null, // TODO: Calculate from project event date
        lastUpdated: new Date().toISOString(),
      };
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching status:", error);
      res.status(500).json({ message: "Failed to fetch status" });
    }
  });

  app.get('/api/gaps', async (req, res) => {
    try {
      // TODO: Implement gap analysis
      res.json([]);
    } catch (error) {
      console.error("Error fetching gap analysis:", error);
      res.status(500).json({ message: "Failed to fetch gap analysis" });
    }
  });

  app.get('/api/summary', async (req, res) => {
    try {
      // TODO: Implement daily summary generation
      const summary = {
        date: new Date().toISOString().split('T')[0],
        overdueTasks: 0,
        dueTodayTasks: 0,
        upcomingTasks: 0,
        completedTasks: 0,
        totalTasks: 0,
        completionPercentage: 0,
        summaryText: "No tasks found. Start by creating tasks for your event production!",
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.post('/api/suggest-tasks', async (req, res) => {
    try {
      const { prompt, eventType, eventDate } = req.body;
      
      // TODO: Implement AI task suggestions using OpenAI
      // For now, return some default suggestions
      const suggestions = [
        {
          title: "Venue booking and setup",
          description: "Secure venue space and coordinate setup logistics",
          category: "infrastructure",
          priority: "high",
          estimatedHours: 8,
        },
        {
          title: "Speaker lineup confirmation",
          description: "Finalize speaker commitments and technical requirements",
          category: "content",
          priority: "high", 
          estimatedHours: 4,
        },
        {
          title: "Registration system setup",
          description: "Configure registration platform and payment processing",
          category: "infrastructure",
          priority: "medium",
          estimatedHours: 6,
        }
      ];
      
      res.json({ suggestions, prompt });
    } catch (error) {
      console.error("Error generating task suggestions:", error);
      res.status(500).json({ message: "Failed to generate task suggestions" });
    }
  });

  // Slack OAuth Installation - Start OAuth flow
  app.get('/api/slack/install', (req, res) => {
    try {
      const clientId = process.env.SLACK_CLIENT_ID;
      const scopes = 'commands,chat:write,channels:read,users:read';
      const redirectUri = `${req.protocol}://${req.get('host')}/api/slack/oauth/callback`;
      
      if (!clientId) {
        console.error('❌ SLACK_CLIENT_ID not configured');
        return res.redirect('/?slack_error=config_missing');
      }

      const authUrl = `https://slack.com/oauth/v2/authorize?` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=beta-testing`;

      console.log('🔗 Redirecting to Slack OAuth:', authUrl);
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error starting Slack OAuth:', error);
      res.status(500).json({ error: 'Failed to start OAuth flow' });
    }
  });

  // Slack OAuth Callback - Handle authorization response
  app.get('/api/slack/oauth/callback', async (req, res) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        console.error('❌ Slack OAuth error:', error);
        return res.redirect('/?slack_error=' + encodeURIComponent(error as string));
      }

      if (!code) {
        console.error('❌ No authorization code received');
        return res.redirect('/?slack_error=no_code');
      }

      const clientId = process.env.SLACK_CLIENT_ID;
      const clientSecret = process.env.SLACK_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.error('❌ Slack OAuth credentials not configured');
        return res.redirect('/?slack_error=config_missing');
      }

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

      // Store the workspace credentials (for beta testing, we'll log them)
      const { team, access_token, bot_user_id } = tokenData;
      console.log('✅ Slack app installed to workspace:', {
        teamId: team?.id,
        teamName: team?.name,
        botUserId: bot_user_id,
        // Note: In production, we'd store these in database per workspace
      });

      // For beta testing, redirect back to dashboard with success
      res.redirect('/?slack_success=1&team=' + encodeURIComponent(team?.name || 'Unknown'));

    } catch (error) {
      console.error('Error handling Slack OAuth callback:', error);
      res.redirect('/?slack_error=callback_failed');
    }
  });

  // Slack webhook endpoint (placeholder for when Slack SDK is installed)
  app.post('/api/slack/events', async (req, res) => {
    try {
      // TODO: Handle Slack events and slash commands
      console.log("Slack event received:", req.body);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error handling Slack event:", error);
      res.status(500).json({ error: "Failed to handle Slack event" });
    }
  });

  app.post('/api/slack/commands', async (req, res) => {
    try {
      const { command, text, user_id, user_name, channel_id, team_id } = req.body;
      
      // Log command for audit
      console.log(`Slack command received: ${command} ${text} from ${user_id}`);
      
      let responseText = "";
      let responseType = "ephemeral";
      
      // Handle different commands
      if (command === "/tasks") {
        if (text === "status") {
          // Get task status overview for this user (sandbox mode)
          const userTasks = await taskStorage.getUserTasks(user_id);
          const completed = userTasks.filter((t: any) => t.status === 'completed').length;
          const overdue = userTasks.filter((t: any) => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate) < new Date() && t.status !== 'completed';
          }).length;
          const total = userTasks.length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          responseText = `📊 *Your Task Status*\n` +
                        `• Total Tasks: ${total}\n` +
                        `• Completed: ${completed} (${percentage}%)\n` +
                        `• Overdue: ${overdue}\n` +
                        `• In Progress: ${userTasks.filter((t: any) => t.status === 'in_progress').length}`;
        } 
        else if (text === "overdue") {
          // Get overdue tasks for this user (sandbox mode)
          const overdueTasks = await taskStorage.getUserOverdueTasks(user_id);
          
          if (overdueTasks.length === 0) {
            responseText = "🎉 No overdue tasks! Great work staying on track.";
          } else {
            responseText = `⚠️ *${overdueTasks.length} Overdue Tasks*\n\n` +
                          overdueTasks.map((task: any) => 
                            `• *${task.title}* (${task.priority} priority)\n` +
                            `  Due: ${new Date(task.dueDate!).toLocaleDateString()}`
                          ).join('\n\n');
          }
        }
        else {
          // Generate sandbox token for dashboard access
          const sandboxToken = createSandboxToken(user_id, user_name);
          
          responseText = "Welcome to your private task sandbox! 🏖️\n\n" +
                       "Use `/tasks status` or `/tasks overdue` to view your task information.\n" +
                       "All tasks you create are private to you and visible in your dashboard.\n\n" +
                       `🔗 *Access your dashboard:* ${process.env.REPL_URL || 'https://your-app.replit.app'}/dashboard?token=${sandboxToken}\n\n` +
                       "💡 *Quick commands:*\n" +
                       "• `/new [task description], [date]` - Create a task\n" +
                       "• `/tasks status` - View your progress\n" +
                       "• `/tasks overdue` - Check overdue items";
        }
      }
      else if (command === "/new") {
        if (!text.trim()) {
          responseText = "Please provide task details. Example: `/new Set up venue, 2023-12-15`";
        } else {
          // Parse task creation parameters (sandbox mode - auto-assign to sender)
          const parts = text.split(',').map((p: string) => p.trim());
          const title = parts[0] || text;
          const dueDate = parts[1] ? new Date(parts[1]) : null;
          
          // Create the task auto-assigned to the command sender
          const newTask = await taskStorage.createTask({
            title,
            description: null,
            status: 'pending',
            priority: 'medium',
            dueDate,
            category: null,
            assigneeSlackId: user_id,
            assigneeName: user_name,
            isAiGenerated: false
          });
          
          responseText = `✅ *Task Created in Your Sandbox!*\n\n` +
                        `📝 Title: ${title}\n` +
                        (dueDate ? `📅 Due: ${new Date(dueDate).toLocaleDateString()}\n` : '') +
                        `👤 Assigned to: You\n` +
                        `🆔 Task ID: ${newTask.id}\n\n` +
                        `💡 View your tasks at your dashboard - this task is private to you!`;
          responseType = "ephemeral"; // Keep private to user in sandbox mode
        }
      }
      else if (command === "/help") {
        responseText = `🤖 *AI Task Manager - Sandbox Mode*\n\n` +
                      `📊 \`/tasks status\` - View your task progress\n` +
                      `⚠️ \`/tasks overdue\` - List your overdue tasks\n` +
                      `➕ \`/new [description, deadline]\` - Create a new task\n` +
                      `🚀 \`/start [template]\` - Quick start with templates\n` +
                      `❓ \`/help\` - Show this help message\n` +
                      `🧠 \`/assistant [question]\` - Ask the AI assistant anything\n\n` +
                      `🏷️ *Quick Start Templates:*\n` +
                      `• \`/start fitness\` - 30-day fitness challenge\n` +
                      `• \`/start project\` - Side project launch\n` +
                      `• \`/start learning\` - Skill building journey\n` +
                      `• \`/start app\` - App/website building challenge\n\n` +
                      `💡 *Examples:*\n` +
                      `• \`/new Setup my workspace, 2023-12-15\`\n` +
                      `• \`/start fitness\` (creates 30-day plan)\n` +
                      `• \`/assistant How should I structure my project?\``;
      }
      else if (command === "/start") {
        if (!text.trim()) {
          responseText = "Choose a template to get started! 🚀\n\n" +
                       "🏷️ *Available Templates:*\n" +
                       "• `/start fitness` - 30-day fitness challenge\n" +
                       "• `/start project` - Side project launch plan\n" +
                       "• `/start learning` - Skill building journey\n" +
                       "• `/start home` - Home improvement project\n" +
                       "• `/start creative` - Creative project workflow\n" +
                       "• `/start app` - App/website building challenge\n\n" +
                       "💡 Each template creates a set of starter tasks to guide your progress!";
        } else {
          const template = text.toLowerCase().trim();
          const templates = getTaskTemplates();
          
          if (template in templates && templates[template as keyof typeof templates]) {
            const templateTasks = templates[template as keyof typeof templates];
            const createdTasks = [];
            
            // Create all template tasks
            for (const taskTemplate of templateTasks) {
              const newTask = await taskStorage.createTask({
                title: taskTemplate.title,
                description: taskTemplate.description,
                status: 'pending',
                priority: taskTemplate.priority || 'medium',
                dueDate: taskTemplate.dueDate ? new Date(Date.now() + taskTemplate.dueDate * 24 * 60 * 60 * 1000) : null,
                category: taskTemplate.category,
                assigneeSlackId: user_id,
                assigneeName: user_name,
                isAiGenerated: false
              });
              createdTasks.push(newTask);
            }
            
            responseText = `✅ *${templateTasks.length} tasks created from '${template}' template!*\n\n` +
                          `🎯 **Your ${template} journey starts now:**\n` +
                          createdTasks.slice(0, 3).map((task, i) => 
                            `${i + 1}. ${task.title}`
                          ).join('\n') +
                          (createdTasks.length > 3 ? `\n... and ${createdTasks.length - 3} more!` : '') +
                          `\n\n📊 View your progress in the dashboard!`;
            responseType = "ephemeral";
          } else {
            responseText = `❌ Template '${template}' not found.\n\n` +
                          "Available templates: fitness, project, learning, home, creative, app\n" +
                          "Try: `/start fitness` for a 30-day fitness challenge or `/start app` to build an app/website";
          }
        }
      }
      else if (command === "/assistant") {
        if (!text.trim()) {
          responseText = "Ask me anything! Example: `/assistant How should I prioritize my event tasks?`";
        } else {
          // AI Assistant response (placeholder for now)
          responseText = `🧠 *AI Assistant Response:*\n\n` +
                        `Based on your question: "${text}"\n\n` +
                        `Here are some general recommendations for event production:\n` +
                        `• Prioritize venue and infrastructure tasks first\n` +
                        `• Focus on high-priority items with approaching deadlines\n` +
                        `• Ensure marketing and content tasks align with your timeline\n` +
                        `• Review dependencies between tasks to avoid bottlenecks\n\n` +
                        `💡 Use \`/tasks status\` to see your current task overview.`;
        }
      }
      else {
        responseText = `Unknown command: ${command}. Use \`/help\` to see available commands.`;
      }
      
      // Return response to Slack
      res.json({
        response_type: responseType,
        text: responseText
      });
    } catch (error) {
      console.error("Error handling Slack command:", error);
      res.status(500).json({ 
        response_type: "ephemeral",
        text: "❌ Sorry, there was an error processing your command. Please try again."
      });
    }
  });

  // Daily Slack notifications for individual team members
  app.post('/api/slack/notify-members', async (req, res) => {
    try {
      // Get all tasks with assignees
      const allTasks = await taskStorage.getTasks();
      const assignedTasks = allTasks.filter((task: any) => task.assigneeName && task.status !== 'completed');
      
      // Group tasks by assignee
      const tasksByAssignee = assignedTasks.reduce((acc: any, task: any) => {
        if (!acc[task.assigneeName]) {
          acc[task.assigneeName] = [];
        }
        acc[task.assigneeName].push(task);
        return acc;
      }, {});
      
      const notifications = [];
      
      // Send individual notifications for each team member
      for (const [assigneeName, tasks] of Object.entries(tasksByAssignee)) {
        // Sort tasks by priority and due date for each assignee
        const sortedTasks = (tasks as any[]).sort((a: any, b: any) => {
          const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
          if (aPriority !== bPriority) return aPriority - bPriority;
          
          // Secondary sort by due date (earliest first)
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          if (a.dueDate && !b.dueDate) return -1;
          if (!a.dueDate && b.dueDate) return 1;
          return 0;
        });
        
        const taskList = sortedTasks.map((task: any) => 
          `• *${task.title}* (${task.priority} priority)` + 
          (task.dueDate ? ` - Due: ${new Date(task.dueDate).toLocaleDateString()}` : '')
        ).join('\n');
        
        const message = `🌅 *Good morning, ${assigneeName}!*\n\n` +
                       `You have ${(tasks as any[]).length} assigned task(s):\n\n${taskList}\n\n` +
                       `💪 Have a productive day!`;
        
        notifications.push({
          assignee: assigneeName,
          taskCount: (tasks as any[]).length,
          message
        });
      }
      
      res.json({ 
        message: "Individual notifications prepared",
        notifications,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error("Error preparing individual notifications:", error);
      res.status(500).json({ message: "Failed to prepare individual notifications" });
    }
  });

  // Daily 6 AM Slack report of all due tasks
  app.post('/api/slack/daily-report', async (req, res) => {
    try {
      const allTasks = await taskStorage.getTasks();
      
      // Create proper day boundaries to avoid double-counting
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);
      const threeDaysFromNow = new Date(startOfToday);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 4); // Start of day + 3 days
      
      // Get overdue tasks (due before today)
      const overdueTasks = allTasks.filter((task: any) => {
        if (!task.dueDate || task.status === 'completed') return false;
        return new Date(task.dueDate) < startOfToday;
      });
      
      // Get tasks due today (between start and end of today)
      const dueTodayTasks = allTasks.filter((task: any) => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= startOfToday && dueDate < endOfToday;
      });
      
      // Get tasks due soon (next 3 days, excluding today)
      const dueSoonTasks = allTasks.filter((task: any) => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= endOfToday && dueDate < threeDaysFromNow;
      });
      
      // Sort by priority (critical > high > medium > low)
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      const sortByPriority = (a: any, b: any) => {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
        return aPriority - bPriority;
      };
      
      overdueTasks.sort(sortByPriority);
      dueTodayTasks.sort(sortByPriority);
      dueSoonTasks.sort(sortByPriority);
      
      // Build report message
      let reportMessage = `🌅 *Daily Production Report - ${startOfToday.toLocaleDateString()}*\n\n`;
      
      if (overdueTasks.length > 0) {
        reportMessage += `🚨 *OVERDUE TASKS (${overdueTasks.length})*\n`;
        overdueTasks.forEach((task: any) => {
          const daysOverdue = Math.ceil((startOfToday.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          reportMessage += `• *${task.title}* (${task.priority} priority) - ${daysOverdue} days overdue`;
          if (task.assigneeName) reportMessage += ` - Assigned: ${task.assigneeName}`;
          reportMessage += '\n';
        });
        reportMessage += '\n';
      }
      
      if (dueTodayTasks.length > 0) {
        reportMessage += `📅 *DUE TODAY (${dueTodayTasks.length})*\n`;
        dueTodayTasks.forEach((task: any) => {
          reportMessage += `• *${task.title}* (${task.priority} priority)`;
          if (task.assigneeName) reportMessage += ` - Assigned: ${task.assigneeName}`;
          reportMessage += '\n';
        });
        reportMessage += '\n';
      }
      
      if (dueSoonTasks.length > 0) {
        reportMessage += `⏰ *DUE SOON (${dueSoonTasks.length})*\n`;
        dueSoonTasks.forEach((task: any) => {
          const dueDate = new Date(task.dueDate);
          const daysUntil = Math.ceil((dueDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
          reportMessage += `• *${task.title}* (${task.priority} priority) - Due in ${daysUntil} days`;
          if (task.assigneeName) reportMessage += ` - Assigned: ${task.assigneeName}`;
          reportMessage += '\n';
        });
        reportMessage += '\n';
      }
      
      if (overdueTasks.length === 0 && dueTodayTasks.length === 0 && dueSoonTasks.length === 0) {
        reportMessage += '🎉 *All caught up!* No urgent tasks at the moment.\n\n';
      }
      
      const stats = await taskStorage.getProjectStats('default');
      reportMessage += `📊 *Overall Progress*\n` +
                      `• Total Tasks: ${stats.totalTasks}\n` +
                      `• Completed: ${stats.completedTasks} (${stats.completionPercentage}%)\n` +
                      `• Overdue: ${stats.overdueTasks}`;
      
      res.json({ 
        message: "Daily report generated",
        report: reportMessage,
        stats: {
          overdue: overdueTasks.length,
          dueToday: dueTodayTasks.length,
          dueSoon: dueSoonTasks.length,
          overall: stats
        },
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error("Error generating daily report:", error);
      res.status(500).json({ message: "Failed to generate daily report" });
    }
  });

  // Manual daily summary trigger
  app.post('/api/daily-summary/trigger', isAuthenticated, async (req, res) => {
    try {
      // TODO: Implement manual daily summary posting to Slack
      res.json({ message: "Daily summary posted to Slack", timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error triggering daily summary:", error);
      res.status(500).json({ message: "Failed to trigger daily summary" });
    }
  });

  // Routes registered successfully
}