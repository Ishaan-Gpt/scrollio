import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { hashPassword, verifyPassword, signToken } from "../lib/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password, displayName } = parsed.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (existing.length > 0) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({ username, displayName, passwordHash })
    .returning();

  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: {
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
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: {
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
    },
  });
});

export default router;
