# AI Task Manager

A modern, AI-powered task management system with comprehensive Slack integration, designed for efficient event production and team collaboration.

## 🚀 Features

- **Smart Templates**: 6 pre-built templates with curated task sets for instant productivity
- **Slack Integration**: Native slash commands for seamless task management within Slack
- **Real-time Dashboard**: Live task tracking with progress visualization and analytics
- **AI-Powered Assistance**: Intelligent task suggestions and management recommendations
- **Team Collaboration**: Multi-user support with role-based access and assignment tracking
- **Demo Mode**: Try all features without signing up
- **Modern UI**: Built with shadcn/ui components and responsive design
- **Analytics & CRM**: Comprehensive user tracking and conversion funnel analysis

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with shadcn/ui components
- **TanStack React Query** for state management
- **Wouter** for lightweight routing
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Passport.js** for authentication
- **Session-based auth** with Replit OIDC
- **Slack SDK** integration

### Infrastructure
- **Neon Database** for PostgreSQL hosting
- **Replit** for hosting and authentication
- **Google Analytics** with GTM integration
- **Stripe** for payment processing

## 🎯 Core Functionality

### Slack Commands
- `/tasks status` - View task overview and completion statistics
- `/tasks overdue` - List all overdue tasks
- `/new [description, deadline, owner]` - Create a new task
- `/help` - Show available commands
- `/assistant [question]` - Ask the AI assistant

### Dashboard Features
- Real-time task metrics and progress tracking
- Project completion visualization
- Team collaboration tools
- Analytics and reporting
- Slack workspace integration management

## 📋 Smart Templates

Get started instantly with 6 professionally crafted templates, each containing curated task sets optimized for modern workflows:

### Available Templates
- 💪 **30-Day #fit4events™ Challenge** (13 tasks | 30 days) - Build strength, discipline, and wellness with daily fitness tasks
- 💼 **Side Hustle Launch** (12 tasks | 90 days) - Launch your side business from idea to first customers with structured milestones
- 📢 **Marketing Campaign Planner** (10 tasks | 30 days) - Plan, launch, and optimize a full marketing campaign from strategy to results
- 📚 **Learn a New Skill** (12 tasks | 15 days) - Master a new skill through structured learning and practice
- 🎨 **Creative Project (AI-Driven)** (11 tasks | 30 days) - Bring your creative vision to life with AI-powered tools and structured production
- 📅 **Micro Event / Mini Retreat** (12 tasks | 60 days) - Plan and host a small retreat or event from concept to review

### Template Features
- **AI-Powered Content**: Templates now include AI tool recommendations (ChatGPT, MidJourney, NotebookLM, Google AI Studio)
- **Optimized Workflows**: Each template designed for modern productivity with realistic time estimates
- **Clickable Cards**: Interactive template cards on dashboard empty state
- **Dedicated Pages**: Each template opens in its own detailed view at `/template/:id`
- **Task Selection**: Choose which tasks to create from each template
- **Pre-defined Structure**: Tasks include priority, category, detailed descriptions, and time estimates
- **One-Click Creation**: Instantly populate your dashboard with structured, actionable tasks

Templates provide new users with immediate value and clear next steps, eliminating the blank slate problem and accelerating time-to-productivity with modern AI-enhanced workflows.

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Replit account (for authentication)

### Environment Variables
```bash
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_GTM_CONTAINER_ID=your_gtm_container_id
```

### Installation
```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

## 📊 Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

- **Frontend**: React SPA with component-based architecture
- **Backend**: RESTful API with Express.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Authentication**: Replit OIDC with session management
- **Real-time**: WebSocket integration for live updates

## 🚀 Deployment

The application is optimized for deployment on Replit with automatic:
- Environment configuration
- Database migrations
- SSL/TLS setup
- Custom domain support

## 🎮 Demo Mode

Try the full application without signing up:
- Access all task management features
- Experience Slack integration simulation
- View analytics and reporting capabilities
- Test team collaboration tools

## 📈 Analytics & CRM

Built-in analytics system with:
- Google Analytics integration (PII-compliant)
- Internal CRM tracking for detailed user insights
- Conversion funnel analysis
- Demo user journey tracking
- A/B testing capabilities
- **8 Key Insights Dashboard**: Streamlined analytics with actionable metrics including task duration, timeline forecasts, priority analysis, risk alerts, productivity trends, bottleneck identification, recommendations, and Slack interaction stats

## 🆕 Recent Improvements

### September 2024 Updates
- **Key Insights Bug Fixes**: Fixed analytics calculations to use actual task completion timestamps instead of current time, providing accurate task duration metrics
- **Improved Analytics UX**: Redesigned Key Insights with bullet-pointed format and red highlighting for critical items (overdue tasks, bottlenecks, high-priority alerts)
- **Auto-Timestamp Completion**: Tasks now automatically record completion time when marked complete, enabling precise analytics tracking
- **Admin Access Fix**: Resolved admin login redirect to properly route authenticated admins to admin panel instead of demo page
- **Status Order Standardization**: Unified task status display order (pending → in_progress → overdue → completed) across all UI components
- **Template Task Ordering**: Fixed template task chronological sequencing to display oldest-first for better workflow clarity
- **CRM Analytics Enhancement**: Resolved dashboard visit tracking bug to accurately count page visits and user activities

### November 2024 Updates
- **Optimized Smart Templates**: All 6 templates redesigned with AI-powered workflows and realistic timeframes
- **Enhanced Analytics**: Reduced from 9 to 8 key insights for better visual layout and user experience
- **AI Integration**: Templates now include specific AI tool recommendations and modern productivity workflows
- **Time Optimization**: Adjusted template durations for more realistic completion timeframes (15-90 days)
- **Demo Mode Enhancement**: Improved demo user experience with better onboarding and analytics access

## 🔐 Security & Compliance

- Session-based authentication with secure cookies
- PII-compliant analytics (no personal data sent to Google Analytics)
- HTTPS/TLS encryption
- Input validation and sanitization
- SQL injection protection with parameterized queries

## 🤝 Contributing

This project is actively maintained and welcomes contributions. Please ensure:
- TypeScript strict mode compliance
- Comprehensive test coverage
- Security best practices
- Accessibility standards

## 📄 License

This project is proprietary software developed for event production and team management.

---

**AI Task Manager** - Streamlining event production through intelligent task management and seamless team collaboration.