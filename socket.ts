import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { taskStorage } from '../task-storage';

interface SlackSocketClient extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(channel: string, text: string): Promise<void>;
}

class SlackSocketModeClient extends EventEmitter implements SlackSocketClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private appToken: string;
  private botToken: string;

  constructor() {
    super();
    this.appToken = process.env.SLACK_APP_TOKEN || '';
    this.botToken = process.env.SLACK_BOT_TOKEN || '';
    
    if (!this.appToken || !this.botToken) {
      throw new Error('SLACK_APP_TOKEN and SLACK_BOT_TOKEN are required for Socket Mode');
    }
  }

  async start(): Promise<void> {
    try {
      console.log('🔌 Starting Slack Socket Mode connection...');
      
      // Get the WebSocket URL from Slack
      const response = await fetch('https://slack.com/api/apps.connections.open', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.appToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to open Socket Mode connection: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      console.log('✅ Socket Mode connection URL obtained');
      
      // Connect to WebSocket
      this.ws = new WebSocket(data.url);
      
      this.ws.on('open', () => {
        console.log('🚀 Slack Socket Mode connected successfully!');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      });

      this.ws.on('message', (data: Buffer) => {
        this.handleMessage(JSON.parse(data.toString()));
      });

      this.ws.on('close', () => {
        console.log('🔌 Slack Socket Mode connection closed');
        this.isConnected = false;
        this.emit('disconnected');
        this.handleReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('❌ Slack Socket Mode error:', error);
        this.emit('error', error);
      });

    } catch (error) {
      console.error('❌ Failed to start Slack Socket Mode:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    console.log('🛑 Slack Socket Mode stopped');
  }

  private handleMessage(message: any): void {
    // Acknowledge the message
    if (message.envelope_id) {
      this.sendAck(message.envelope_id);
    }

    // Handle different event types
    if (message.type === 'events_api') {
      this.handleEvent(message.payload);
    } else if (message.type === 'slash_commands') {
      this.handleSlashCommand(message.payload);
    } else if (message.type === 'interactive') {
      this.handleInteractiveComponent(message.payload);
    }
  }

  private sendAck(envelopeId: string): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({
        envelope_id: envelopeId
      }));
    }
  }

  private async handleSlashCommand(payload: any): Promise<void> {
    try {
      const { command, text, user_id, channel_id, team_id, response_url } = payload;
      
      console.log(`📨 Slash command received: ${command} ${text} from ${user_id}`);
      
      let responseText = "";
      let responseType = "ephemeral";
      
      // Handle different commands (same logic as HTTP endpoint)
      if (command === "/tasks") {
        if (text === "status") {
          const allTasks = await taskStorage.getTasks();
          const completed = allTasks.filter((t: any) => t.status === 'completed').length;
          const overdue = allTasks.filter((t: any) => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate) < new Date() && t.status !== 'completed';
          }).length;
          const total = allTasks.length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          responseText = `📊 *Task Status Overview*\n` +
                        `• Total Tasks: ${total}\n` +
                        `• Completed: ${completed} (${percentage}%)\n` +
                        `• Overdue: ${overdue}\n` +
                        `• In Progress: ${allTasks.filter((t: any) => t.status === 'in_progress').length}`;
        } 
        else if (text === "overdue") {
          const allTasks = await taskStorage.getTasks();
          const overdueTasks = allTasks.filter((t: any) => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate) < new Date() && t.status !== 'completed';
          });
          
          if (overdueTasks.length === 0) {
            responseText = "🎉 No overdue tasks! Great work staying on track.";
          } else {
            responseText = `⚠️ *${overdueTasks.length} Overdue Tasks*\n\n` +
                          overdueTasks.map((task: any) => 
                            `• *${task.title}* (${task.priority} priority)\n` +
                            `  Due: ${new Date(task.dueDate!).toLocaleDateString()}\n` +
                            `  Assignee: ${task.assigneeName || 'Unassigned'}`
                          ).join('\n\n');
          }
        }
        else {
          responseText = "Use `/tasks status` or `/tasks overdue` to view task information.";
        }
      }
      else if (command === "/new") {
        if (!text.trim()) {
          responseText = "Please provide task details. Example: `/new Set up venue, 2023-12-15, John`";
        } else {
          // Parse task creation parameters
          const parts = text.split(',').map((p: string) => p.trim());
          const title = parts[0] || text;
          const dueDate = parts[1] ? new Date(parts[1]) : null;
          const assigneeName = parts[2] || null;
          
          // Create the task
          const newTask = await taskStorage.createTask({
            title,
            description: null,
            status: 'pending',
            priority: 'medium',
            dueDate,
            category: null,
            assigneeName,
            isAiGenerated: false
          });
          
          responseText = `✅ *Task Created Successfully!*\n\n` +
                        `📝 Title: ${title}` +
                        (dueDate ? `\n📅 Due: ${new Date(dueDate).toLocaleDateString()}` : '') +
                        (assigneeName ? `\n👤 Assignee: ${assigneeName}` : '');
          responseType = "in_channel"; // Show to channel so team can see new tasks
          
          // Emit task created event for UI updates
          this.emit('task_created', newTask);
        }
      }
      else if (command === "/help") {
        responseText = `🤖 *AI Task Manager Commands*\n\n` +
                      `📊 \`/tasks status\` - View task overview and completion statistics\n` +
                      `⚠️ \`/tasks overdue\` - List all overdue tasks\n` +
                      `➕ \`/new [description, deadline, owner]\` - Create a new task\n` +
                      `❓ \`/help\` - Show this help message\n` +
                      `🧠 \`/assistant [question]\` - Ask the AI assistant anything\n\n` +
                      `💡 *Examples:*\n` +
                      `• \`/new Set up venue, 2023-12-15, John\`\n` +
                      `• \`/assistant How should I prioritize my event tasks?\``;
      }
      else if (command === "/assistant") {
        if (!text.trim()) {
          responseText = "Ask me anything! Example: `/assistant How should I prioritize my event tasks?`";
        } else {
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
      
      // Send response back to Slack
      await this.sendSlashCommandResponse(response_url, {
        response_type: responseType,
        text: responseText
      });
      
    } catch (error) {
      console.error('❌ Error handling slash command:', error);
      await this.sendSlashCommandResponse(payload.response_url, {
        response_type: "ephemeral",
        text: "❌ Sorry, there was an error processing your command. Please try again."
      });
    }
  }

  private async sendSlashCommandResponse(responseUrl: string, response: any): Promise<void> {
    try {
      const result = await fetch(responseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });

      if (!result.ok) {
        console.error('Failed to send Slack response:', result.statusText);
      }
    } catch (error) {
      console.error('Error sending Slack response:', error);
    }
  }

  private handleEvent(payload: any): void {
    // Handle Slack events
    console.log('📧 Slack event received:', payload.event?.type);
    this.emit('slack_event', payload);
  }

  private handleInteractiveComponent(payload: any): void {
    // Handle interactive components (buttons, menus, etc.)
    console.log('🎯 Interactive component received:', payload.type);
    this.emit('interactive', payload);
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.start().catch(console.error);
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Manual restart required.');
    }
  }

  async sendMessage(channel: string, text: string): Promise<void> {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          text,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(`Failed to send message: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const slackClient = new SlackSocketModeClient();
export default slackClient;