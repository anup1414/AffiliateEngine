import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - stores all users (regular members and admin)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  phone: text("phone"),
  address: text("address"),
  profilePicture: text("profile_picture"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  referralCode: varchar("referral_code", { length: 12 }).unique(),
  referredBy: varchar("referred_by", { length: 12 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Memberships table
export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, active, expired
  originalPrice: integer("original_price").notNull().default(5000),
  paidPrice: integer("paid_price").notNull(),
  couponUsed: text("coupon_used"),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
});

// Earnings table - tracks all referral earnings
export const earnings = pgTable("earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull().default(2000),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Admin settings table - for QR code and coupons
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment QR Codes table - for storing payment QR codes
export const paymentQRCodes = pgTable("payment_qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  qrCodeImage: text("qr_code_image").notNull(),
  upiId: text("upi_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  purchaseDate: true,
});

export const insertEarningSchema = createInsertSchema(earnings).omit({
  id: true,
  earnedAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertPaymentQRCodeSchema = createInsertSchema(paymentQRCodes).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;
export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earnings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertPaymentQRCode = z.infer<typeof insertPaymentQRCodeSchema>;
export type PaymentQRCode = typeof paymentQRCodes.$inferSelect;
