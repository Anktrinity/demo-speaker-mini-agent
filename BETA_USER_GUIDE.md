# 📘 AI Task Manager - Beta User Guide

Welcome to the AI Task Manager! This guide will help you get started with the platform and connect your Slack workspace.

---

## 🎯 Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Creating & Managing Tasks](#creating--managing-tasks)
4. [Connecting Slack (Step-by-Step)](#connecting-slack-step-by-step)
5. [Using Slack Commands](#using-slack-commands)
6. [Tips & Troubleshooting](#tips--troubleshooting)

---

## 🚀 Getting Started

### What is AI Task Manager?
AI Task Manager is a powerful task management platform designed specifically for hackathons and team events. It helps you organize tasks, track progress, and collaborate seamlessly through Slack integration.

### Beta Access
As a beta user, you have **unlimited free access** to all features including:
- ✅ Unlimited tasks
- ✅ Slack workspace integration
- ✅ Real-time analytics
- ✅ Team collaboration tools
- ✅ Template library for quick setup

### Creating Your Account

Beta users get instant access through a simple signup form:

1. **Visit the platform URL** provided to you
2. You'll see the **AI Task Manager signup page**
3. **Fill in the form**:
   - Your full name
   - Your email address
   - (Optional) Check the box to receive product updates
4. **Click "Start Free Demo"**
5. **Wait for confirmation** - You'll see "Welcome aboard!" message
6. **Auto-redirect** to your dashboard in 1-2 seconds

**That's it!** No email confirmation needed, no credit card required, instant access to all beta features.

### Signing In (After First Signup)

For your first visit, you'll create an account using the form above. The system will remember you automatically using secure browser storage.

**If you ever need to sign in again** (e.g., different browser or cleared cache):
1. Visit the platform URL
2. Fill in the signup form again with your **same email**
3. The system will recognize you and log you in

**Important Notes**:
- ✅ Beta users use the signup form (not external logins)
- ✅ Your session stays active for 7 days
- ✅ All beta features are automatically enabled
- ✅ No password needed - use your email to access

### 🔔 Next Step: Connect Slack (Required)

**After signing up, you MUST connect Slack to unlock the full platform functionality.**

As a brand new beta user:
1. ✅ You've just created your account
2. 🔴 **Slack is NOT connected yet** - You'll see "Setup Slack" on your dashboard
3. 📋 **Follow the Slack setup guide below** to create your Slack app and connect it

**Why connect Slack?**
- Create tasks directly from Slack channels
- Get real-time notifications
- Use slash commands like `/tasks` and `/new`
- Collaborate with your team where they already work

👉 **Jump to: [Connecting Slack (Step-by-Step)](#connecting-slack-step-by-step)** to get started!

---

## 📊 Dashboard Overview

### Top Navigation Bar
Located at the top of your dashboard:

- **Logo (Left)**: Returns to home/dashboard
- **Slack Connection (Right)**: Shows your Slack connection status
  - 🔴 **Not Connected**: Click to start setup
  - 🟢 **Connected**: Shows your workspace name
- **Settings Gear**: Access settings and preferences
- **Logout**: Sign out of your session

### Main Dashboard Sections

#### 1. **Task Statistics Card** (Top Left)
Displays your current task overview:
- **Total Tasks**: All tasks in the system
- **Completed**: Tasks marked as done
- **Overdue**: Tasks past their due date (red alert)
- **Due Today**: Tasks due today (yellow warning)
- **Upcoming**: Future tasks

**Progress Bar**: Visual representation of task completion percentage

#### 2. **Quick Actions Panel** (Top Right)
Fast-access buttons for common actions:
- **➕ New Task**: Create a new task manually
- **🔍 Filter Tasks**: Filter by status, priority, or category

#### 3. **Slack Integration Card** (Center)
Shows Slack connection status and management:
- **Setup Slack**: Opens the setup wizard (if not configured)
- **Connect to Slack**: Links your workspace (after setup)
- **Disconnect**: Unlink your workspace
- **Test Connection**: Verify Slack is working

#### 4. **Task List** (Bottom Section)
Scrollable list of all your tasks with:
- **Task Title**: Main task name
- **Priority Badge**: Visual indicator (Critical, High, Medium, Low)
- **Due Date**: When the task is due
- **Status**: Current state (To Do, In Progress, Completed)
- **Category**: Task grouping (optional)
- **Assignee**: Who's responsible (optional)

**Task Actions** (click on task):
- ✏️ Edit task details
- ✅ Mark as complete
- 🗑️ Delete task
- 👁️ View full details

---

## ✅ Creating & Managing Tasks

### Method 1: Manual Task Creation

1. **Click "New Task"** button on dashboard
2. **Fill in the form**:
   - **Title** (required): What needs to be done
   - **Description** (optional): Additional details
   - **Status**: To Do, In Progress, or Completed
   - **Priority**: Low, Medium, High, or Critical
   - **Due Date** (optional): Select from calendar
   - **Category** (optional): Group related tasks
   - **Assignee** (optional): Team member name
3. **Click "Create Task"**
4. Task appears in your list instantly

### Method 2: Slack Commands (After Setup)

In any Slack channel:
```
/new [task title]
/tasks - View all tasks
/overdue - See overdue tasks
/assistant - Get AI help
```

### Managing Tasks

**Edit a Task:**
1. Click on the task card
2. Modify any field
3. Click "Save Changes"

**Complete a Task:**
1. Click the task
2. Change status to "Completed"
3. Or use checkbox if available

**Delete a Task:**
1. Click the task
2. Click "Delete" button
3. Confirm deletion

**Filter Tasks:**
1. Click "Filter" button
2. Select criteria:
   - Status (All, To Do, In Progress, Completed)
   - Priority (All, Low, Medium, High, Critical)
   - Category (if using categories)
3. View filtered results

---

## 🔗 Connecting Slack (Step-by-Step)

### ⚠️ Important: This is Required for New Beta Users

**If you just signed up, Slack is NOT connected yet.** You need to complete this setup to use the platform effectively.

**What you'll see on your dashboard:**
- 🔴 "Setup Slack" button (not "Connect to Slack")
- Status: "Not Connected"
- Message: "Configure your Slack integration"

**✨ NEW: Simplified Setup - Only 3 Steps, Takes 3 Minutes!**

### Why Connect Slack?
- ✅ Create tasks directly from Slack
- ✅ Get task notifications in channels
- ✅ Use slash commands for quick access
- ✅ Collaborate with your team in real-time

### Prerequisites
- ✅ Slack workspace admin access (or permission to install apps)
- ✅ Active Slack account
- ✅ 3 minutes to complete setup

**Let's get started! 👇**

---

### 🚀 3-Step Quick Setup

#### Step 1: Start Setup in AI Task Manager
1. **Go to Dashboard**
2. **Click "Setup Slack"** button in the Slack Integration card
3. **Click "Start 3-Minute Setup"** in the wizard

---

#### Step 2: Create Your Slack App (~2 minutes)

**What you'll do:**
1. **Click "Open Slack API"** button in the wizard (opens new tab)
2. On Slack: **Click "From an app manifest"** (second option)
3. **Choose your workspace** from dropdown
4. **Click "Next"**
5. **Back in the wizard:** Click **"Download Manifest File"** button
6. On Slack: Select **"JSON" tab** → Click **"Upload a file"** → Select the downloaded file
7. **Click "Next"** → **Click "Create"**

🎉 **Your Slack app is created!** The manifest automatically configured everything (permissions, commands, OAuth).

---

#### Step 3: Get App Credentials (~1 minute)

**What you'll do:**
1. On Slack: Click **"Basic Information"** in left sidebar
2. Scroll to **"App Credentials"** section
3. **Copy the Client ID** (starts with numbers like `1234567890.123`)
4. **Paste into wizard's "Client ID"** field
5. On Slack: Click **"Show"** next to Client Secret
6. **Copy the Client Secret** (long alphanumeric string)
7. **Paste into wizard's "Client Secret"** field
8. **Click "Save & Continue"**

✅ **Setup Complete!** Your credentials are encrypted and stored securely.

---

#### Final Step: Connect Your Workspace

1. **Click "Finish Setup"** in the wizard
2. **Click "Connect to Slack"** button on dashboard
3. **Click "Allow"** on the Slack authorization page
4. **You're redirected back** to AI Task Manager

🎊 **Done!** Slack is now connected.

---

### Testing Your Connection

1. **Go to any Slack channel**
2. **Type `/tasks`** and press Enter
3. **You should see** your task list appear in Slack!

If it doesn't work, click **"Test Connection"** on the dashboard to troubleshoot.

---

## 💬 Using Slack Commands

Once connected, use these commands in any Slack channel:

### Available Commands

#### `/tasks` - View All Tasks
```
/tasks
```
Shows a formatted list of all your tasks with status and priority.

#### `/new` - Create New Task
```
/new Prepare presentation slides
/new Design logo - High priority, due tomorrow
```
Creates a task instantly. Add details for better organization.

#### `/overdue` - View Overdue Tasks
```
/overdue
```
Shows all tasks past their due date.

### Command Tips
- Commands work in **any channel** where the app is added
- Use **direct messages** to the app for private task management
- Commands respond **only to you** (ephemeral messages)
- **To use commands in a channel**: The app must be added to that channel first
  - In the channel, type: `/invite` and then select your app from the list
  - Or go to channel details → Integrations → Add apps → Select your app

---

## 🛠️ Tips & Troubleshooting

### Common Issues & Solutions

#### "Slack Setup button not showing"
**Solution**: You have beta tier access. Make sure you're logged in (check that your name appears in the dashboard header). If not, refresh the page or sign up again.

#### "Invalid Client ID or Secret"
**Solutions**:
1. Double-check you copied the **entire** Client ID and Secret
2. Make sure there are **no extra spaces**
3. Client Secret must be **revealed** (click "Show" in Slack)
4. Try **regenerating** Client Secret in Slack and using the new one

#### "Redirect URL mismatch error"
**Solutions**:
1. Verify redirect URL in Slack **exactly matches** the one in wizard
2. Must include `https://` protocol
3. Check for trailing slashes
4. Click **"Save URLs"** in Slack after adding

#### "Connection test failed"
**Solutions**:
1. Verify app is **installed** in your Slack workspace
2. Check app has proper **scopes/permissions**
3. Try **disconnecting** and reconnecting
4. Reinstall app in Slack workspace

#### "Commands not working in Slack"
**Solutions**:
1. **App not in channel**: The app must be added to the channel first
   - Type `/invite` in the channel
   - Select your app from the list that appears
   - Or: Channel details → Integrations → Add apps
2. **Wrong command format**: Use `/tasks` (with forward slash at the start)
3. **App not connected**: Check dashboard shows "Connected" status
4. **Test the connection**: Click "Test Connection" button in dashboard
5. **Try in DM first**: Send `/tasks` in a direct message to the app to verify it works

#### "Tasks not syncing between Web and Slack"
**Solutions**:
1. **Refresh** the dashboard page
2. Use `/tasks` command in Slack to force refresh
3. Check internet connection
4. Try **disconnecting and reconnecting** Slack

### Best Practices

#### Security
- ✅ **Never share** your Client ID and Client Secret publicly
- ✅ Keep credentials **private** and secure
- ✅ **Disconnect** Slack if you're no longer using it
- ✅ **Regenerate secrets** if compromised

#### Task Management
- 📝 Use **clear, specific titles** for tasks
- 🎯 Set **priorities** to stay focused
- 📅 Add **due dates** for time-sensitive tasks
- 🏷️ Use **categories** to organize by project/area
- 👤 Assign **owners** for team accountability

#### Slack Integration
- 💡 Create tasks from **Slack** for speed
- 📊 Use **dashboard** for detailed management
- 🔔 Set up **channel notifications** for team updates
- 📋 Use **templates** for quick event setup

### Getting Help

#### Need Assistance?
- 📧 **Contact Support**: Reach out to the beta support team
- 💬 **Slack Community**: Join other beta testers
- 📚 **Documentation**: Check this guide first

#### Report Bugs & Errors
Found a bug or encountered an error? Help us improve the platform!

**📝 Submit Error Report:**
[Click here to report bugs and errors](https://docs.google.com/spreadsheets/d/1IOxkUQsiPgDUE-2XTXXi0wCZpQ9nuLRUo7jmblC43Wk/edit?gid=0#gid=0)

**What to include in your report:**
- What you were trying to do
- What happened (error message, unexpected behavior)
- Steps to reproduce the issue
- Browser and device info (if relevant)
- Screenshots (if helpful)

#### Feedback
We value your feedback! As a beta user:
- Share what works well
- Report bugs or confusing features
- Suggest improvements
- Help shape the future of AI Task Manager

---

## 🎉 You're Ready!

Congratulations! You now know how to:
- ✅ Navigate the AI Task Manager dashboard
- ✅ Create and manage tasks
- ✅ Set up and connect Slack
- ✅ Use Slack commands for quick task management
- ✅ Troubleshoot common issues

### Quick Start Checklist for New Beta Users

**First Time Setup (Do these in order):**
- [ ] Sign up on the platform (name + email)
- [ ] Land on dashboard - you're logged in!
- [ ] **⚠️ IMPORTANT: Click "Setup Slack"** - Follow the [Slack Setup Guide](#connecting-slack-step-by-step)
- [ ] Create your Slack app on api.slack.com
- [ ] Copy and paste your Client ID and Secret
- [ ] Click "Connect to Slack" to authorize
- [ ] Test `/tasks` command in Slack - it should work!

**Daily Usage (After setup):**
- [ ] Create tasks from Slack with `/new`
- [ ] View tasks with `/tasks` command
- [ ] Check overdue tasks with `/overdue`
- [ ] Manage tasks on the web dashboard
- [ ] Add app to team channels: Type `/invite` and select your app

**Welcome to the AI Task Manager community!** 🚀

---

## 📞 Support & Resources

- **Dashboard**: Your main platform URL
- **Slack API Portal**: https://api.slack.com/apps
- **Error Reporting Form**: [Submit bugs and errors here](https://docs.google.com/spreadsheets/d/1IOxkUQsiPgDUE-2XTXXi0wCZpQ9nuLRUo7jmblC43Wk/edit?gid=0#gid=0)
- **Beta Support**: Contact your beta program coordinator
- **Feature Requests**: Share in your beta user channel

*Last Updated: October 2025*
*Version: Beta 1.0*
