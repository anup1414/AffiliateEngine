import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Membership,
  InsertMembership,
  Earning,
  InsertEarning,
  AdminSetting,
  InsertAdminSetting,
} from "@shared/schema";

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Membership operations
  getMembership(userId: string): Promise<Membership | undefined>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  updateMembershipStatus(
    id: string,
    status: string,
  ): Promise<Membership | undefined>;
  getAllMemberships(): Promise<Membership[]>;

  // Earnings operations
  getUserEarnings(userId: string): Promise<Earning[]>;
  createEarning(earning: InsertEarning): Promise<Earning>;
  getUserDailyEarnings(userId: string): Promise<number>;
  getUserWeeklyEarnings(userId: string): Promise<number>;
  getUserTotalEarnings(userId: string): Promise<number>;

  // Admin settings operations
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.referralCode, code));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(
    id: string,
    updateData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  // Membership operations
  async getMembership(userId: string): Promise<Membership | undefined> {
    const [membership] = await db
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.userId, userId));
    return membership;
  }

  async createMembership(
    insertMembership: InsertMembership,
  ): Promise<Membership> {
    const [membership] = await db
      .insert(schema.memberships)
      .values(insertMembership)
      .returning();
    return membership;
  }

  async updateMembershipStatus(
    id: string,
    status: string,
  ): Promise<Membership | undefined> {
    const [membership] = await db
      .update(schema.memberships)
      .set({ status })
      .where(eq(schema.memberships.id, id))
      .returning();
    return membership;
  }

  async getAllMemberships(): Promise<Membership[]> {
    return await db.select().from(schema.memberships).orderBy(desc(schema.memberships.purchaseDate));
  }

  // Earnings operations
  async getUserEarnings(userId: string): Promise<Earning[]> {
    return await db
      .select()
      .from(schema.earnings)
      .where(eq(schema.earnings.userId, userId))
      .orderBy(desc(schema.earnings.earnedAt));
  }

  async createEarning(insertEarning: InsertEarning): Promise<Earning> {
    const [earning] = await db
      .insert(schema.earnings)
      .values(insertEarning)
      .returning();
    return earning;
  }

  async getUserDailyEarnings(userId: string): Promise<number> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [result] = await db
      .select({ total: sql<number>`COALESCE(SUM(${schema.earnings.amount}), 0)` })
      .from(schema.earnings)
      .where(
        and(
          eq(schema.earnings.userId, userId),
          gte(schema.earnings.earnedAt, oneDayAgo),
        ),
      );

    return Number(result?.total || 0);
  }

  async getUserWeeklyEarnings(userId: string): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [result] = await db
      .select({ total: sql<number>`COALESCE(SUM(${schema.earnings.amount}), 0)` })
      .from(schema.earnings)
      .where(
        and(
          eq(schema.earnings.userId, userId),
          gte(schema.earnings.earnedAt, oneWeekAgo),
        ),
      );

    return Number(result?.total || 0);
  }

  async getUserTotalEarnings(userId: string): Promise<number> {
    const [result] = await db
      .select({ total: sql<number>`COALESCE(SUM(${schema.earnings.amount}), 0)` })
      .from(schema.earnings)
      .where(eq(schema.earnings.userId, userId));

    return Number(result?.total || 0);
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db
      .select()
      .from(schema.adminSettings)
      .where(eq(schema.adminSettings.settingKey, key));
    return setting;
  }

  async setAdminSetting(
    insertSetting: InsertAdminSetting,
  ): Promise<AdminSetting> {
    const existing = await this.getAdminSetting(insertSetting.settingKey);

    if (existing) {
      const [setting] = await db
        .update(schema.adminSettings)
        .set({
          settingValue: insertSetting.settingValue,
          updatedAt: new Date(),
        })
        .where(eq(schema.adminSettings.settingKey, insertSetting.settingKey))
        .returning();
      return setting;
    }

    const [setting] = await db
      .insert(schema.adminSettings)
      .values(insertSetting)
      .returning();
    return setting;
  }
}

export const storage = new DbStorage();
