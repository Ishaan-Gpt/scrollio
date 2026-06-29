import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, dailyStatsTable } from "@workspace/db";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";
import { UpdateMeBody } from "@workspace/api-zod";
import type { Request } from "express";

const router = Router();

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    leetcodeUsername: user.leetcodeUsername,
    createdAt: user.createdAt,
    totalReelsSeen: user.totalReelsSeen,
    totalMinutesWatched: user.totalMinutesWatched,
    currentStreak: user.currentStreak,
    bestStreak: user.bestStreak,
    totalDaysBlocked: user.totalDaysBlocked,
  });
});

router.patch("/users/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.displayName) updates.displayName = parsed.data.displayName;
  if (parsed.data.bio != null) updates.bio = parsed.data.bio;
  if (parsed.data.leetcodeUsername != null)
    updates.leetcodeUsername = parsed.data.leetcodeUsername;

  const [user] = await db
    .update(usersTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning();
  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    leetcodeUsername: user.leetcodeUsername,
    createdAt: user.createdAt,
    totalReelsSeen: user.totalReelsSeen,
    totalMinutesWatched: user.totalMinutesWatched,
    currentStreak: user.currentStreak,
    bestStreak: user.bestStreak,
    totalDaysBlocked: user.totalDaysBlocked,
  });
});

router.get(
  "/users/:userId/profile",
  async (req: Request, res): Promise<void> => {
    const rawId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Get rank by streak
    const allUsers = await db
      .select({ id: usersTable.id, streak: usersTable.currentStreak })
      .from(usersTable)
      .orderBy(desc(usersTable.currentStreak));
    const rank = allUsers.findIndex((u) => u.id === userId) + 1;

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      totalReelsSeen: user.totalReelsSeen,
      totalMinutesWatched: user.totalMinutesWatched,
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      totalDaysBlocked: user.totalDaysBlocked,
      rank,
    });
  }
);

export default router;
