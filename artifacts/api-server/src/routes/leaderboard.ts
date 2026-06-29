import { Router } from "express";
import { desc } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const router = Router();

router.get("/leaderboard", async (req, res): Promise<void> => {
  const metric = (req.query["metric"] as string) || "streak";
  const limit = Math.min(parseInt((req.query["limit"] as string) || "50", 10), 100);

  let orderCol;
  if (metric === "reelsBlocked") {
    orderCol = usersTable.totalDaysBlocked;
  } else if (metric === "timeSaved") {
    orderCol = usersTable.totalMinutesWatched;
  } else {
    orderCol = usersTable.currentStreak;
  }

  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      currentStreak: usersTable.currentStreak,
      bestStreak: usersTable.bestStreak,
      totalDaysBlocked: usersTable.totalDaysBlocked,
      totalMinutesWatched: usersTable.totalMinutesWatched,
    })
    .from(usersTable)
    .orderBy(desc(orderCol))
    .limit(limit);

  const entries = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    username: u.username,
    displayName: u.displayName,
    currentStreak: u.currentStreak,
    value:
      metric === "reelsBlocked"
        ? u.totalDaysBlocked
        : metric === "timeSaved"
          ? u.totalMinutesWatched
          : u.currentStreak,
  }));

  res.json(entries);
});

export default router;
