import { Router } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  usersTable,
  leetcodeVerificationsTable,
  blockingConfigTable,
} from "@workspace/db";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";
import { VerifyLeetcodeBody } from "@workspace/api-zod";

const router = Router();
const REQUIRED_SOLVES = 2;

function todayStr(): string {
  return new Date().toISOString().split("T")[0]!;
}

async function fetchLeetcodeSolvesToday(username: string): Promise<number> {
  try {
    const query = `{
      recentAcSubmissionList(username: "${username}", limit: 20) {
        timestamp
      }
    }`;
    const resp = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!resp.ok) return 0;
    const data = (await resp.json()) as {
      data?: { recentAcSubmissionList?: { timestamp: string }[] };
    };
    const submissions = data?.data?.recentAcSubmissionList ?? [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(todayStart.getTime() / 1000);
    const solvedToday = submissions.filter(
      (s) => parseInt(s.timestamp, 10) >= todayTimestamp
    ).length;
    return solvedToday;
  } catch {
    return 0;
  }
}

router.post(
  "/leetcode/verify",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const parsed = VerifyLeetcodeBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { leetcodeUsername } = parsed.data;
    const today = todayStr();

    // Save leetcode username to user
    await db
      .update(usersTable)
      .set({ leetcodeUsername, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));

    const solvedToday = await fetchLeetcodeSolvesToday(leetcodeUsername);
    const verified = solvedToday >= REQUIRED_SOLVES;

    // Upsert verification record
    const existing = await db
      .select()
      .from(leetcodeVerificationsTable)
      .where(
        and(
          eq(leetcodeVerificationsTable.userId, userId),
          eq(leetcodeVerificationsTable.date, today)
        )
      );

    if (existing.length > 0) {
      await db
        .update(leetcodeVerificationsTable)
        .set({
          solvedToday,
          verified,
          verifiedAt: verified ? new Date() : null,
        })
        .where(
          and(
            eq(leetcodeVerificationsTable.userId, userId),
            eq(leetcodeVerificationsTable.date, today)
          )
        );
    } else {
      await db.insert(leetcodeVerificationsTable).values({
        userId,
        date: today,
        solvedToday,
        verified,
        verifiedAt: verified ? new Date() : null,
      });
    }

    // If verified, unlock apps until midnight
    if (verified) {
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);

      const existingBlock = await db
        .select()
        .from(blockingConfigTable)
        .where(eq(blockingConfigTable.userId, userId));

      if (existingBlock.length > 0) {
        await db
          .update(blockingConfigTable)
          .set({ unlockedUntil: midnight, updatedAt: new Date() })
          .where(eq(blockingConfigTable.userId, userId));
      } else {
        await db.insert(blockingConfigTable).values({
          userId,
          blockingEnabled: true,
          instagramBlocked: true,
          youtubeBlocked: true,
          unlockedUntil: midnight,
        });
      }
    }

    res.json({
      verified,
      solvedToday,
      unlockedApps: verified,
      message: verified
        ? `Great job! You've solved ${solvedToday} problems today. Apps unlocked until midnight.`
        : `You've solved ${solvedToday}/${REQUIRED_SOLVES} problems today. Solve ${REQUIRED_SOLVES - solvedToday} more to unlock apps.`,
    });
  }
);

router.get(
  "/leetcode/status",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const today = todayStr();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const [verification] = await db
      .select()
      .from(leetcodeVerificationsTable)
      .where(
        and(
          eq(leetcodeVerificationsTable.userId, userId),
          eq(leetcodeVerificationsTable.date, today)
        )
      );

    const [blocking] = await db
      .select()
      .from(blockingConfigTable)
      .where(eq(blockingConfigTable.userId, userId));

    const unlockedApps =
      verification?.verified === true &&
      blocking?.unlockedUntil != null &&
      blocking.unlockedUntil > new Date();

    res.json({
      verified: verification?.verified ?? false,
      solvedToday: verification?.solvedToday ?? 0,
      unlockedApps,
      requiredSolves: REQUIRED_SOLVES,
      leetcodeUsername: user?.leetcodeUsername ?? null,
    });
  }
);

export default router;
