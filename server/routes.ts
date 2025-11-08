import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Membership routes
  app.post("/api/membership/purchase", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { couponCode } = req.body;

      // Check if user already has a membership
      const existingMembership = await storage.getMembership(userId);
      if (existingMembership) {
        return res.status(400).json({ message: "You already have a membership" });
      }

      // Calculate price based on coupon
      let paidPrice = 5000;
      let couponUsed = null;

      if (couponCode && couponCode.toLowerCase() === "save3k") {
        paidPrice = 2000;
        couponUsed = couponCode;
      }

      // Create membership
      const membership = await storage.createMembership({
        userId,
        status: "pending",
        originalPrice: 5000,
        paidPrice,
        couponUsed,
      });

      res.json(membership);
    } catch (error) {
      console.error("Membership purchase error:", error);
      res.status(500).json({ message: "Failed to purchase membership" });
    }
  });

  app.post("/api/membership/confirm", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      const membership = await storage.getMembership(userId);

      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }

      // Update membership status to active
      await storage.updateMembershipStatus(membership.id, "active");

      // If user was referred, create earning for referrer
      if (user?.referredBy) {
        const referrer = await storage.getUserByReferralCode(user.referredBy);
        if (referrer) {
          await storage.createEarning({
            userId: referrer.id,
            referredUserId: userId,
            amount: 2000,
          });
        }
      }

      res.json({ message: "Membership confirmed successfully" });
    } catch (error) {
      console.error("Membership confirmation error:", error);
      res.status(500).json({ message: "Failed to confirm membership" });
    }
  });

  app.get("/api/membership", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const membership = await storage.getMembership(userId);
      res.json(membership || null);
    } catch (error) {
      console.error("Get membership error:", error);
      res.status(500).json({ message: "Failed to fetch membership" });
    }
  });

  // User profile routes
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { fullName, email, phone, address } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        phone,
        address,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/user/profile-picture", isAuthenticated, upload.single("picture"), async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // In a real app, you'd upload to cloud storage
      // For now, we'll just store the file path
      const filePath = `/uploads/${req.file.filename}`;
      
      const updatedUser = await storage.updateUser(userId, {
        profilePicture: filePath,
      });

      res.json({ profilePicture: filePath });
    } catch (error) {
      console.error("Upload profile picture error:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Earnings routes
  app.get("/api/earnings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const earnings = await storage.getUserEarnings(userId);
      res.json(earnings);
    } catch (error) {
      console.error("Get earnings error:", error);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  app.get("/api/earnings/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      const daily = await storage.getUserDailyEarnings(userId);
      const weekly = await storage.getUserWeeklyEarnings(userId);
      const total = await storage.getUserTotalEarnings(userId);

      res.json({ daily, weekly, total });
    } catch (error) {
      console.error("Get earnings stats error:", error);
      res.status(500).json({ message: "Failed to fetch earnings stats" });
    }
  });

  // Admin routes - User Management
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Get membership and earnings for each user
      const usersWithDetails = await Promise.all(
        users.map(async (user) => {
          const membership = await storage.getMembership(user.id);
          const earnings = await storage.getUserTotalEarnings(user.id);
          const referralCount = (await storage.getUserEarnings(user.id)).length;

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            isApproved: user.isApproved,
            joinDate: user.createdAt,
            status: membership?.status || "no-membership",
            earnings,
            referrals: referralCount,
          };
        })
      );

      res.json(usersWithDetails);
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id/approve", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, { isApproved: true });
      res.json(user);
    } catch (error) {
      console.error("Approve user error:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.put("/api/admin/users/:id/reject", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, { isApproved: false });
      res.json(user);
    } catch (error) {
      console.error("Reject user error:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  app.put("/api/admin/membership/:id/status", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const membership = await storage.updateMembershipStatus(id, status);
      res.json(membership);
    } catch (error) {
      console.error("Update membership status error:", error);
      res.status(500).json({ message: "Failed to update membership status" });
    }
  });

  // Payment QR Code Management Routes
  app.get("/api/admin/payment-qr-codes", isAdmin, async (req, res) => {
    try {
      const qrCodes = await storage.getAllPaymentQRCodes();
      res.json(qrCodes);
    } catch (error) {
      console.error("Get QR codes error:", error);
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  app.get("/api/payment-qr-codes/active", async (req, res) => {
    try {
      const qrCodes = await storage.getActivePaymentQRCodes();
      res.json(qrCodes);
    } catch (error) {
      console.error("Get active QR codes error:", error);
      res.status(500).json({ message: "Failed to fetch active QR codes" });
    }
  });

  app.post("/api/admin/payment-qr-codes", isAdmin, upload.single("qrCode"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { name, upiId } = req.body;
      const filePath = `/uploads/${req.file.filename}`;
      
      const qrCode = await storage.createPaymentQRCode({
        name: name || "Payment QR Code",
        qrCodeImage: filePath,
        upiId: upiId || null,
        isActive: true,
      });

      res.json(qrCode);
    } catch (error) {
      console.error("Create QR code error:", error);
      res.status(500).json({ message: "Failed to create QR code" });
    }
  });

  app.put("/api/admin/payment-qr-codes/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, upiId, isActive } = req.body;
      
      const qrCode = await storage.updatePaymentQRCode(id, {
        name,
        upiId,
        isActive,
      });

      res.json(qrCode);
    } catch (error) {
      console.error("Update QR code error:", error);
      res.status(500).json({ message: "Failed to update QR code" });
    }
  });

  app.delete("/api/admin/payment-qr-codes/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePaymentQRCode(id);
      res.json({ message: "QR code deleted successfully" });
    } catch (error) {
      console.error("Delete QR code error:", error);
      res.status(500).json({ message: "Failed to delete QR code" });
    }
  });

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const memberships = await storage.getAllMemberships();
      
      const totalUsers = users.length;
      const activeMembers = memberships.filter(m => m.status === "active").length;
      let platformEarnings = 0;

      for (const user of users) {
        const earnings = await storage.getUserTotalEarnings(user.id);
        platformEarnings += earnings;
      }

      res.json({
        totalUsers,
        activeMembers,
        platformEarnings,
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    next();
  });
  app.use("/uploads", async (req, res, next) => {
    // Serve static files from uploads directory
    const filePath = path.join(process.cwd(), "uploads", path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
