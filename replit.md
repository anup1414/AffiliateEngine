# Affiliate Marketing Platform

## Overview

This is a full-stack affiliate marketing platform that enables users to earn ₹2,000 for each successful referral. The platform features a dual-interface system with separate dashboards for regular users and administrators. Users can purchase memberships (₹5,000 or ₹2,000 with a coupon), receive unique referral codes, track their earnings, and manage their profiles. Administrators can manage users, approve memberships, upload payment QR codes, and monitor platform-wide analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, using Vite as the build tool and development server.

**UI Component System**: Shadcn/ui component library built on Radix UI primitives, following a dashboard-focused design system inspired by Stripe, Linear, and Vercel. The design emphasizes clarity and efficiency for data-intensive operations.

**Styling**: Tailwind CSS with custom theming supporting light/dark modes. Typography uses Inter for primary text and Roboto Mono for numerical data. The design system uses consistent spacing primitives (2, 4, 6, 8, 12, 16) and implements a card-based layout pattern.

**State Management**: TanStack Query (React Query) for server state management with aggressive caching (staleTime: Infinity) and disabled automatic refetching. Client state is managed with React hooks.

**Routing**: Wouter for lightweight client-side routing with protected routes based on authentication status and user role (admin vs. regular user).

**Key Design Decisions**:
- Component-based architecture with reusable UI primitives
- Separation of concerns between user and admin interfaces
- Real-time feedback through toast notifications
- Responsive design with mobile-first approach

### Backend Architecture

**Runtime**: Node.js with Express.js server framework.

**Language**: TypeScript with ES modules for type safety and modern JavaScript features.

**API Design**: RESTful API architecture with session-based authentication. All API routes are prefixed with `/api/`.

**Session Management**: Express sessions stored in PostgreSQL using `connect-pg-simple` with 7-day session lifetime. Sessions use HTTP-only cookies with secure flag in production.

**Authentication Flow**:
- Password hashing with bcrypt (6 rounds)
- Session-based authentication with middleware guards (`isAuthenticated`, `isAdmin`)
- Auto-initialization of admin user on server startup
- Support for referral code validation during registration

**File Upload Handling**: Multer middleware for multipart form data (profile pictures, QR codes) with local filesystem storage in `uploads/` directory.

**API Structure**:
- `/api/auth/*` - Authentication endpoints (login, register, logout, user info)
- `/api/membership/*` - Membership purchase and management
- `/api/earnings/*` - Earnings tracking and statistics
- `/api/admin/*` - Administrative operations (user management, QR codes)

### Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver with WebSocket support for Node.js environments.

**ORM**: Drizzle ORM with schema-first approach for type-safe database operations.

**Schema Design**:
- **users**: Core user table with admin flag, approval status, unique referral codes, and profile information
- **memberships**: Tracks membership purchases with status (pending/active/expired), pricing, and coupon usage
- **earnings**: Records referral earnings with user relationships and timestamps
- **adminSettings**: Key-value store for system configuration (QR codes, coupons)
- **paymentQRCodes**: Stores multiple payment QR codes with active/inactive status
- **sessions**: Express session storage (managed by connect-pg-simple)

**Key Constraints**:
- Unique username and referral codes
- Foreign key relationships between users, memberships, and earnings
- Default values for admin status, approval flags, and pricing

**Migration Strategy**: Drizzle Kit for schema migrations with PostgreSQL dialect, migrations stored in `/migrations` directory.

### Authentication and Authorization

**Password Security**: Bcrypt hashing with configurable salt rounds (currently 6).

**Session Configuration**:
- 7-day session lifetime
- HTTP-only cookies to prevent XSS
- Secure flag enabled in production
- Proxy trust for deployment environments

**Authorization Levels**:
- Unauthenticated: Access to login/register only
- Authenticated User: Dashboard, profile, earnings, referral management
- Admin: Full platform access including user approval and QR code management

**Middleware Guards**:
- `isAuthenticated`: Validates session exists and user is logged in
- `isAdmin`: Additional check for admin privileges

### External Dependencies

**Database Service**: Neon PostgreSQL serverless database accessed via `@neondatabase/serverless` package with WebSocket constructor from `ws` package for Node.js compatibility.

**UI Component Library**: Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, tooltips, etc.) wrapped with Shadcn/ui styling conventions.

**Form Handling**: React Hook Form with Zod schema validation via `@hookform/resolvers`.

**Styling Tools**: 
- Tailwind CSS for utility-first styling
- `class-variance-authority` for component variant management
- `clsx` and `tailwind-merge` for conditional class composition

**Development Tools**:
- Vite with React plugin and runtime error overlay
- Replit-specific plugins for development environment integration (cartographer, dev banner)
- TSX for TypeScript execution in development
- ESBuild for production bundling

**File Upload**: Multer for handling multipart/form-data file uploads.

**Icon System**: Lucide React for consistent iconography throughout the application.

**Date Handling**: Native JavaScript Date objects (no external date library).

**Build Process**:
- Development: Vite dev server with HMR
- Production: Vite builds frontend to `dist/public`, ESBuild bundles server to `dist/index.js`
- Database schema deployment via `drizzle-kit push` command