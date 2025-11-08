# Narayane Sena - Membership & Referral Platform

A professional full-stack web application for managing memberships and referral programs with an admin panel.

## Features

- **User Management**: Registration, login, profile management with admin approval
- **Membership System**: Purchase memberships with coupon support (₹5000 regular, ₹2000 with SAVE3K coupon)
- **Referral Program**: Earn ₹2000 for each successful referral
- **Admin Dashboard**: Comprehensive admin panel for managing users, memberships, and payments
- **Payment QR Codes**: Upload and manage payment QR codes for membership purchases
- **Earnings Tracking**: Track daily, weekly, and total earnings
- **Secure Authentication**: PostgreSQL-backed session management with bcrypt password hashing

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Authentication**: express-session with PostgreSQL store

## Quick Start (Replit)

1. The application is ready to use on Replit
2. Click the "Deploy" button to publish to production
3. Default admin credentials:
   - Username: `admin`
   - Password: `NarayaneSena2024!` (change immediately after first login)

## Deployment Options

### Option 1: Deploy on Replit (Recommended - Easiest)

Replit provides built-in deployment with automatic HTTPS, custom domains, and zero configuration:

1. Click the **Deploy** button in Replit
2. Your app will be published with a live URL
3. Add a custom domain in the deployment settings (optional)
4. Environment variables are automatically configured

**Advantages**:
- ✅ Zero configuration required
- ✅ Automatic HTTPS
- ✅ Auto-scaling
- ✅ Database included
- ✅ One-click deployment

### Option 2: Deploy on VPS (Hostinger, DigitalOcean, etc.)

⚠️ **Important**: WordPress/shared hosting does NOT support Node.js. You need VPS hosting.

**Requirements**:
- Hostinger VPS (starting at $4.99/month) or any VPS provider
- Ubuntu 20.04+ server
- Root/SSH access

**Step-by-Step VPS Deployment**:

#### 1. Prepare Your VPS

```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Set Up PostgreSQL Database

```bash
# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE narayane_sena;
CREATE USER narayane_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE narayane_sena TO narayane_user;
\q
```

#### 3. Deploy Application

```bash
# Clone or upload your code
git clone https://github.com/yourusername/narayane-sena.git
cd narayane-sena

# Install dependencies
npm install

# Create .env file
nano .env
```

Add to .env:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://narayane_user:your_secure_password@localhost:5432/narayane_sena
SESSION_SECRET=your_random_secret_key_here
ADMIN_PASSWORD=your_secure_admin_password
```

```bash
# Build the application
npm run build

# Push database schema
npm run db:push

# Install PM2 for process management
sudo npm install -g pm2

# Start the application
pm2 start npm --name "narayane-sena" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/narayane-sena
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/narayane-sena /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Set Up SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (default: 5000) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `ADMIN_PASSWORD` | Admin password (default: NarayaneSena2024!) | No |

## Admin Panel

Access the admin panel at `/admin/dashboard`

**Default Login**:
- Username: `admin`
- Password: `NarayaneSena2024!`

**Features**:
- User management (approve/reject registrations)
- Membership status management
- Payment QR code management
- Platform statistics and analytics

## User Dashboard

Users can access their dashboard at `/user/dashboard`

**Features**:
- View earnings and referral statistics
- Purchase membership
- View referral link
- Update profile information

## Database Schema

The application uses the following tables:
- `users` - User accounts and profiles
- `memberships` - Membership purchases and status
- `earnings` - Referral earnings tracking
- `payment_qr_codes` - Payment QR codes for membership purchases
- `admin_settings` - Admin configuration
- `sessions` - User sessions

## Security Features

- ✅ Bcrypt password hashing
- ✅ PostgreSQL-backed sessions
- ✅ HTTPS in production
- ✅ Secure cookies
- ✅ Admin-only routes protection
- ✅ Input validation

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart narayane-sena
```

### Database Backup

```bash
# Backup database
pg_dump -U narayane_user narayane_sena > backup_$(date +%Y%m%d).sql

# Restore database
psql -U narayane_user narayane_sena < backup_20241108.sql
```

### View Logs

```bash
# PM2 logs
pm2 logs narayane-sena

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs narayane-sena

# Restart
pm2 restart narayane-sena
```

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check PostgreSQL is running: `sudo systemctl status postgresql`
3. Test connection: `psql -U narayane_user -d narayane_sena`

### Port Already in Use

```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
kill -9 <PID>

# Restart application
pm2 restart narayane-sena
```

## Support

For issues or questions, contact the development team.

## License

Proprietary - All rights reserved
