import type { Express, RequestHandler } from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Session configuration
export function getSession() {
  const sessionTtlSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
  const sessionTtlMs = sessionTtlSeconds * 1000; // 1 week in milliseconds
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtlSeconds, // connect-pg-simple expects seconds
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtlMs, // cookie maxAge expects milliseconds
    },
  });
}

// Setup authentication routes
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Initialize admin user on startup
  await initializeAdmin();

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, referralCode } = req.body;

      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user session
      (req.session as any).userId = user.id;
      (req.session as any).isAdmin = user.isAdmin;

      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          isAdmin: user.isAdmin,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email, phone, fullName, referralCode } = req.body;

      // Validate required fields
      if (!username || !password || !email || !phone) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate unique referral code
      const userReferralCode = Math.random().toString(36).substring(2, 14).toUpperCase();

      // Create user - they will need admin approval
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        phone,
        fullName: fullName || null,
        referralCode: userReferralCode,
        referredBy: referralCode || null,
        isAdmin: false,
        isApproved: false,
      });

      // Store user session
      (req.session as any).userId = newUser.id;
      (req.session as any).isAdmin = newUser.isAdmin;

      res.json({ 
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          fullName: newUser.fullName,
          isAdmin: newUser.isAdmin,
          isApproved: newUser.isApproved,
        },
        message: "Registration successful. Awaiting admin approval."
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
        isApproved: user.isApproved,
        referralCode: user.referralCode,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

// Middleware to check authentication
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if ((req.session as any).userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check admin access
export const isAdmin: RequestHandler = (req, res, next) => {
  if ((req.session as any).userId && (req.session as any).isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
};

// Initialize admin user
async function initializeAdmin() {
  try {
    const adminUser = await storage.getUserByUsername("admin");
    
    if (!adminUser) {
      // Use environment variable or generate secure password
      const adminPassword = process.env.ADMIN_PASSWORD || "NarayaneSena2024!";
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        email: "admin@narayanesena.com",
        phone: "+919999999999",
        fullName: "Administrator",
        isAdmin: true,
        isApproved: true,
        referralCode: "ADMIN",
        referredBy: null,
      });
      console.log("Admin user created successfully");
      if (!process.env.ADMIN_PASSWORD) {
        console.log("⚠️  IMPORTANT: Default admin password is 'NarayaneSena2024!' - Please change it immediately!");
        console.log("   Set ADMIN_PASSWORD environment variable to customize the admin password.");
      }
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
}
