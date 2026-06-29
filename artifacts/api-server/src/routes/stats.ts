import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, usersTable, dailyStatsTable } from "@workspace/db";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";
import { SyncStatsBody } from "@workspace/api-zod";

const router = Router();

function todayStr(): string {
  return new Date().toISOString().split("T")[0]!;
}

router.get("/stats/today", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const today = todayStr();

  const [stats] = await db
    .select()
    .from(dailyStatsTable)
    .where(
      and(
        eq(dailyStatsTable.userId, userId),
        eq(dailyStatsTable.date, today)
      )
    );

  if (!stats) {
    res.json({
      date: today,
      reelsSeen: 0,
      minutesWatched: 0,
      instagramReels: 0,
      youtubeShorts: 0,
      appsBlocked: false,
      unlockedByLeetcode: false,
    });
    return;
  }
  res.json(stats);
});

router.post("/stats/today", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = SyncStatsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { date: dateRaw, reelsSeen, minutesWatched, instagramReels, youtubeShorts } =
    parsed.data;
  // date comes in as a coerced Date object; convert back to YYYY-MM-DD string
  const date = dateRaw instanceof Date
    ? dateRaw.toISOString().split("T")[0]!
    : String(dateRaw);

  const existing = await db
    .select()
    .from(dailyStatsTable)
    .where(
      and(
        eq(dailyStatsTable.userId, userId),
        eq(dailyStatsTable.date, date)
      )
    );

  let stats;
  if (existing.length > 0) {
    [stats] = await db
      .update(dailyStatsTable)
      .set({ reelsSeen, minutesWatched, instagramReels, youtubeShorts })
      .where(
        and(
          eq(dailyStatsTable.userId, userId),
          eq(dailyStatsTable.date, date)
        )
      )
      .returning();
  } else {
    [stats] = await db
      .insert(dailyStatsTable)
      .values({ userId, date, reelsSeen, minutesWatched, instagramReels, youtubeShorts })
      .returning();
  }

  // Update user aggregate totals and streak
  const allStats = await db
    .select()
    .from(dailyStatsTable)
    .where(eq(dailyStatsTable.userId, userId))
    .orderBy(desc(dailyStatsTable.date));

  const totalReelsSeen = allStats.reduce((s, r) => s + r.reelsSeen, 0);
  const totalMinutesWatched = allStats.reduce((s, r) => s + r.minutesWatched, 0);

  // Calculate streak: consecutive days with appsBlocked = true
  let streak = 0;
  const sorted = [...allStats].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let prevDate: Date | null = null;
  for (const s of sorted) {
    if (!s.appsBlocked) break;
    const d = new Date(s.date);
    if (prevDate) {
      const diff =
        (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff > 1) break;
    }
    streak++;
    prevDate = d;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  await db
    .update(usersTable)
    .set({
      totalReelsSeen,
      totalMinutesWatched,
      currentStreak: streak,
      bestStreak: Math.max(user?.bestStreak ?? 0, streak),
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId));

  res.json(stats);
});

router.get("/stats/history", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const stats = await db
    .select()
    .from(dailyStatsTable)
    .where(eq(dailyStatsTable.userId, userId))
    .orderBy(desc(dailyStatsTable.date))
    .limit(30);
  res.json(stats);
});

export default router;
