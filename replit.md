# ADHD Life Manager

## Overview

This is a comprehensive ADHD life management application built with React, Express.js, and PostgreSQL. The app provides specialized tools for task management, emotional regulation, focus tracking, and cognitive behavioral therapy techniques tailored for individuals with ADHD.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Pattern**: RESTful API with JSON responses
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Project Structure
- **Monorepo**: Single repository with client, server, and shared code
- **Client**: React application in `/client` directory
- **Server**: Express API in `/server` directory
- **Shared**: Common schemas and types in `/shared` directory

## Key Components

### Task Management System
- **Eisenhower Matrix**: Prioritization using urgent/important quadrants
- **Task Breakdown**: Automatic decomposition of large tasks into smaller steps
- **Pomodoro Integration**: Built-in timer with task tracking
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Minimal Viable Tasks**: ADHD-friendly task simplification

### Emotional Regulation Tools
- **Mood Tracking**: Simple emoji-based mood logging
- **Traffic Light System**: Stop-Think-Act emotional regulation technique
- **Cognitive Reframing**: CBT-based thought pattern restructuring
- **Emergency Plans**: Crisis management and coping strategies
- **Trigger Identification**: Pattern recognition for emotional triggers

### Focus and Productivity
- **Pomodoro Timer**: Customizable work/break cycles
- **Current Focus Card**: Single-task focus with visual progress
- **Time Estimation**: Learning tool for improving time awareness
- **Routine Visualization**: Weekly routine planning and tracking

### Data Models
- **Tasks**: Title, description, priority, steps, emotional state, time tracking
- **Mood Entries**: Mood level, triggers, notes, timestamps
- **Pomodoro Sessions**: Duration, type, completion status, task association
- **Routine Blocks**: Weekly schedule with time blocks and activities
- **Cognitive Reframes**: Negative thoughts, balanced alternatives, emotional impact
- **Emergency Plans**: Crisis intervention strategies and coping mechanisms

## Data Flow

### Client-Server Communication
- **API Layer**: RESTful endpoints with consistent JSON responses
- **Query Management**: TanStack Query for caching, synchronization, and optimistic updates
- **Error Handling**: Centralized error handling with user-friendly messages
- **Real-time Updates**: Query invalidation for immediate UI updates

### Database Operations
- **ORM**: Drizzle ORM with type-safe queries and migrations
- **Schema**: PostgreSQL with proper relationships and constraints
- **Validation**: Zod schemas for runtime type checking
- **Transactions**: Atomic operations for data consistency

### State Management
- **Server State**: TanStack Query with automatic caching and background updates
- **Local State**: React hooks for component-specific state
- **Form State**: React Hook Form with validation
- **UI State**: Local component state for modals, dialogs, and interactions

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **TypeScript**: Type safety and developer experience
- **ESLint/Prettier**: Code formatting and linting
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database migrations and schema management

### Third-party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment and deployment platform

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Local PostgreSQL or Neon Database connection
- **Environment Variables**: `.env` file for local configuration
- **Type Checking**: Continuous TypeScript compilation

### Production Deployment
- **Build Process**: Vite build for client, esbuild for server
- **Server**: Node.js Express server serving static files and API
- **Database**: Neon Database with connection pooling
- **Asset Serving**: Static file serving from Express
- **Error Handling**: Production-ready error responses

### Key Architectural Decisions

1. **Monorepo Structure**: Chosen for code sharing between client and server, simplified deployment, and consistent TypeScript configuration

2. **Drizzle ORM**: Selected for type safety, lightweight footprint, and excellent TypeScript integration compared to heavier alternatives like Prisma

3. **TanStack Query**: Implemented for superior caching, background updates, and optimistic updates compared to basic fetch or axios

4. **Radix UI + Tailwind**: Combined for accessible components with customizable styling, avoiding the constraints of complete UI frameworks

5. **Neon Database**: Chosen for serverless PostgreSQL with automatic scaling and connection pooling, ideal for variable workloads

6. **Wouter Routing**: Lightweight alternative to React Router, reducing bundle size while maintaining functionality

7. **ADHD-Specific Features**: Designed with ADHD considerations including visual progress indicators, task breakdown, emotional regulation tools, and executive function support