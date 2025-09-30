# Overview

This is a full-stack web application built with React and Express that has evolved from a template marketplace into an AI Task Manager specifically designed for hackathon event management. The application features a modern UI built with shadcn/ui components, user authentication via Replit's OIDC system, and a comprehensive task management system integrated with Slack for team collaboration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using a modern React stack with TypeScript, featuring:

- **React with TypeScript**: Core UI framework using functional components and hooks
- **Wouter**: Lightweight client-side routing solution
- **Vite**: Build tool and development server providing fast hot reload
- **shadcn/ui Components**: Comprehensive UI component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens and theming
- **TanStack React Query**: Server state management and data fetching with caching
- **Stripe Integration**: Payment processing capabilities (legacy from template marketplace)

The application follows a component-based architecture with clear separation between pages, reusable UI components, and utility functions. The routing system supports both authenticated and guest modes.

## Backend Architecture

The backend is implemented as an Express.js server with TypeScript support:

- **Express.js**: Web application framework handling HTTP requests and middleware
- **TypeScript**: Type safety and better developer experience
- **Modular Route Structure**: Separate route handlers for authentication, tasks, and legacy endpoints
- **Session Management**: Express sessions with PostgreSQL storage for user authentication
- **Task Management System**: RESTful API endpoints for CRUD operations on tasks and projects

## Authentication System

User authentication is handled through Replit's OpenID Connect (OIDC) system:

- **Replit OIDC Integration**: Seamless authentication for Replit users
- **Passport.js**: Authentication middleware for handling OAuth flows
- **Session-based Authentication**: Secure session management with PostgreSQL storage
- **Guest Mode Support**: Optional guest access for demo purposes

## Data Storage Solutions

The application uses a PostgreSQL database with Drizzle ORM:

- **PostgreSQL with Neon**: Cloud-hosted PostgreSQL database for production
- **Drizzle ORM**: Type-safe database toolkit with schema definition and migrations
- **Schema Design**: Comprehensive schema supporting tasks, teams, Slack users, projects, and analytics
- **Database Connection**: Connection pooling via Neon's serverless driver

Key database entities include:
- Tasks with priority, status, and dependency tracking
- Team and Slack user management
- Project organization and gap analysis
- Daily summaries and command logging
- Session storage for authentication

## External Dependencies

### Third-party Services
- **Neon Database**: PostgreSQL hosting and serverless database connections
- **Replit Authentication**: OIDC provider for user authentication
- **Stripe**: Payment processing (legacy functionality)

### Key NPM Dependencies
- **Database**: `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`
- **Authentication**: `passport`, `openid-client`, `express-session`
- **UI Framework**: `react`, `@radix-ui/*`, `tailwindcss`, `class-variance-authority`
- **Build Tools**: `vite`, `typescript`, `tsx`, `esbuild`
- **Development**: `@replit/vite-plugin-*` for Replit-specific tooling

### Planned Integrations
- **Slack Bot SDK**: `@slack/bolt` (referenced in dependencies for future Slack integration)
- **OpenAI**: AI-powered task generation and management capabilities
- **WebSocket**: Real-time updates for dashboard and task synchronization

The architecture supports both the legacy template marketplace functionality and the new AI Task Manager features, with clear separation between old and new endpoints to maintain backward compatibility while enabling new functionality.