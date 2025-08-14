# S/4HANA Migration Assistant

## Overview

This is a comprehensive full-stack web application that guides SAP ECC customers through their S/4HANA migration journey using Shape Up methodology principles. The application provides assessment tools, personalized migration strategy recommendations, and project management capabilities with visual progress tracking through hill charts.

The system helps organizations evaluate their current SAP landscape, receive tailored migration recommendations (Greenfield, Brownfield, or Hybrid approaches), and manage their transformation projects using fixed-time, variable-scope cycles inspired by Shape Up methodology.

**Key Features:**
- Anonymous assessment completion with automatic account creation
- Secure password generation and credential management for potential customers
- Shape Up cycle configuration with customizable build/cooldown durations
- Project scope management with detailed boundaries and success criteria
- Visual progress tracking through hill charts and betting tables
- Comprehensive dashboard with tabbed navigation for project oversight

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Password Security**: Node.js crypto module with scrypt for password hashing

### Database Design
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**:
  - Users (authentication and authorization)
  - Assessments (customer evaluation responses and recommendations)
  - Projects (migration initiatives with strategy and status tracking)
  - Pitches (Shape Up methodology work proposals with appetite and business value)
  - Work Packages (granular tasks with hill chart positioning)

### Project Structure
- **Monorepo Layout**: Shared schema definitions between client and server
- **Client Directory**: Contains React frontend with component-based architecture
- **Server Directory**: Houses Express backend with modular route handlers
- **Shared Directory**: Type definitions and database schema shared across frontend/backend

### Assessment Engine
- **Logic**: Custom assessment engine that evaluates multiple factors including system landscape, business outcomes, custom code requirements, and organizational change readiness
- **Scoring**: Multi-dimensional scoring system that weighs different factors to recommend optimal migration strategies
- **Recommendations**: Generates personalized strategy recommendations with detailed rationale

### Shape Up Integration
- **Pitches**: Implements Shape Up pitch concept with problem definition, solution approach, appetite (time allocation), and business value assessment
- **Hill Charts**: Visual progress tracking system showing work packages moving through problem-solving and execution phases
- **Cycles**: Time-boxed development cycles with fixed duration and variable scope

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support for real-time connections
- **Session Management**: PostgreSQL-backed session storage for scalable authentication

### UI and Styling
- **Radix UI**: Comprehensive primitive component library for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Static type checking across the entire application stack
- **Zod**: Runtime type validation and schema validation
- **React Hook Form**: Performant form library with validation integration

### Deployment and Development
- **Replit Integration**: Development environment integration with error overlay and cartographer plugins
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **Docker**: Containerization for production deployment
- **GitHub Actions**: Automated CI/CD pipeline with Docker testing
- **Railway/Render**: Recommended deployment platforms for Docker containers

## Deployment Architecture

### Docker Configuration
- **Full-Stack Container**: Complete Node.js application running in Alpine Linux Docker container
- **Application**: Express.js serving both React frontend and API routes in a single process
- **Database**: PostgreSQL hosted on Neon with connection pooling and session storage
- **Environment**: Production and development environments with isolated configurations
- **Build Process**: Multi-stage Docker build with optimized production image
- **Health Monitoring**: Built-in health check endpoint at `/api/health`
- **Deployment Targets**: Railway, Render, or future Cloudflare Container Workers

### Docker Features
- **Multi-stage Build**: Optimized build process with separate builder and production stages
- **Node.js 20**: Production environment with Wrangler compatibility
- **Security**: Non-root user execution with minimal attack surface
- **Performance**: Alpine Linux base for reduced image size and faster deployments
- **Signal Handling**: dumb-init for proper process signal management
- **Health Checks**: Built-in container health monitoring with automated testing via GitHub Actions

### Current Deployment Status
- **Production Ready**: Docker container successfully builds and passes health checks
- **CI/CD Pipeline**: GitHub Actions automatically tests every push
- **Platform Support**: Ready for Railway, Render, and other Docker-compatible platforms
- **Future Ready**: Cloudflare Container Workers configuration prepared for June 2025 GA