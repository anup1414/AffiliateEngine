# Narayane Sena - Project Overview

## Overview
Narayane Sena is a professional membership and referral management platform built with React, Express, and PostgreSQL. The platform enables users to purchase memberships, earn through referrals, and provides a comprehensive admin panel for management.

## Recent Changes

### November 8, 2024
- ✅ Set up PostgreSQL database for production use
- ✅ Fixed authentication with PostgreSQL-backed session storage
- ✅ Added sessions table to database schema
- ✅ Fixed session TTL configuration (sessions now properly expire after 1 week)
- ✅ Improved admin password security (now configurable via ADMIN_PASSWORD env var)
- ✅ Created comprehensive deployment documentation (README.md)
- ✅ Updated .gitignore to exclude uploads and sensitive files
- ✅ Configured for Replit deployment with autoscale

## Project Architecture

### Frontend (React + TypeScript)
- **Location**: `client/src/`
- **Pages**:
  - `/` - Login and registration page
  - `/user/dashboard` - User dashboard with earnings and profile
  - `/admin/dashboard` - Admin panel for user and membership management
  - `/membership/purchase` - Membership purchase flow

### Backend (Express + TypeScript)
- **Location**: `server/`
- **Key Files**:
  - `server/index.ts` - Main server entry point
  - `server/routes.ts` - API routes
  - `server/auth.ts` - Authentication and session management
  - `server/storage.ts` - Database operations using Drizzle ORM

### Database Schema (PostgreSQL)
- **Location**: `shared/schema.ts`
- **Tables**:
  - `users` - User accounts (regular and admin)
  - `memberships` - Membership purchases and status
  - `earnings` - Referral earnings tracking
  - `payment_qr_codes` - Payment QR codes for membership purchases
  - `admin_settings` - Admin configuration
  - `sessions` - User session storage

## User Preferences

- **Deployment**: Replit deployment preferred for ease of use
- **Database**: PostgreSQL for production reliability
- **Authentication**: Secure session-based auth with PostgreSQL storage
- **Admin Access**: Protected admin routes with role-based access control

## Key Features

1. **User Management**
   - User registration with admin approval required
   - Profile management with photo upload
   - Referral code system

2. **Membership System**
   - ₹5000 regular membership
   - ₹2000 with "SAVE3K" coupon code
   - Payment via QR code upload
   - Admin approval required for activation

3. **Referral Program**
   - Earn ₹2000 per successful referral
   - Track daily, weekly, and total earnings
   - View referral history

4. **Admin Panel**
   - Comprehensive user management
   - Membership approval workflow
   - Payment QR code management
   - Platform statistics and analytics

## Environment Variables

Required environment variables are automatically configured in Replit:
- `DATABASE_URL` - PostgreSQL connection (auto-configured)
- `SESSION_SECRET` - Session encryption secret (auto-configured)
- `ADMIN_PASSWORD` - Admin password (default: NarayaneSena2024!)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

## Deployment

### Replit Deployment (Current Setup)
- Click "Deploy" button to publish
- Automatic HTTPS and custom domain support
- Auto-scaling configured
- Database included

### Alternative: VPS Deployment
See README.md for detailed VPS deployment instructions. Note: Requires VPS hosting, NOT WordPress/shared hosting.

## Admin Credentials

- **Username**: `admin`
- **Password**: `NarayaneSena2024!` (change immediately after first login)
- **Email**: admin@narayanesena.com

## Development

### Start Development Server
```bash
npm run dev
```
Runs frontend (Vite) and backend (Express) on port 5000

### Database Commands
```bash
npm run db:push    # Push schema changes to database
npm run db:studio  # Open Drizzle Studio (database GUI)
```

### Build for Production
```bash
npm run build      # Build frontend
npm run start      # Start production server
```

## Security Features

- ✅ Bcrypt password hashing (10 rounds)
- ✅ PostgreSQL-backed sessions with 1-week expiry
- ✅ Secure cookies in production (HTTPS only)
- ✅ Admin-only route protection
- ✅ Input validation with Zod schemas
- ✅ Session secret from environment variables

## Known Issues / Notes

- Sessions now properly expire after 1 week (fixed TTL configuration)
- Admin password is configurable via ADMIN_PASSWORD env var for security
- Uploads folder is gitignored - files stored locally during development
- For production, consider cloud storage (AWS S3, Cloudinary) for uploads

## Future Enhancements

- Email notifications for membership approvals
- Payment gateway integration (Razorpay/Stripe)
- Cloud storage for profile pictures and QR codes
- Export functionality for admin reports
- Mobile app version
