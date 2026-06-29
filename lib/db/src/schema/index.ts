import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Users
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio"),
  leetcodeUsername: text("leetcode_username"),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  totalReelsSeen: integer("total_reels_seen").notNull().default(0),
  totalMinutesWatched: integer("total_minutes_watched").notNull().default(0),
  totalDaysBlocked: integer("total_days_blocked").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

// Daily stats
export const dailyStatsTable = pgTable(
  "daily_stats",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    reelsSeen: integer("reels_seen").notNull().default(0),
    minutesWatched: integer("minutes_watched").notNull().default(0),
    instagramReels: integer("instagram_reels").notNull().default(0),
    youtubeShorts: integer("youtube_shorts").notNull().default(0),
    appsBlocked: boolean("apps_blocked").notNull().default(false),
    unlockedByLeetcode: boolean("unlocked_by_leetcode").notNull().default(false),
  },
  (t) => [unique("user_date_unique").on(t.userId, t.date)]
);

export const insertDailyStatsSchema = createInsertSchema(dailyStatsTable).omit({
  id: true,
});
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type DailyStats = typeof dailyStatsTable.$inferSelect;

// Blocking config
export const blockingConfigTable = pgTable("blocking_config", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
  blockingEnabled: boolean("blocking_enabled").notNull().default(false),
  instagramBlocked: boolean("instagram_blocked").notNull().default(true),
  youtubeBlocked: boolean("youtube_blocked").notNull().default(true),
  unlockedUntil: timestamp("unlocked_until"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BlockingConfig = typeof blockingConfigTable.$inferSelect;

// LeetCode verifications
export const leetcodeVerificationsTable = pgTable("leetcode_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  solvedToday: integer("solved_today").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
});

export type LeetcodeVerification = typeof leetcodeVerificationsTable.$inferSelect;
