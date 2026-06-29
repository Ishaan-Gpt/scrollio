import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, blockingConfigTable } from "@workspace/db";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";
import { UpdateBlockingStatusBody } from "@workspace/api-zod";

const router = Router();

router.get(
  "/blocking/status",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const [config] = await db
      .select()
      .from(blockingConfigTable)
      .where(eq(blockingConfigTable.userId, userId));

    if (!config) {
      res.json({
        instagramBlocked: false,
        youtubeBlocked: false,
        blockingEnabled: false,
        unlockedUntil: null,
      });
      return;
    }

    res.json({
      instagramBlocked: config.instagramBlocked,
      youtubeBlocked: config.youtubeBlocked,
      blockingEnabled: config.blockingEnabled,
      unlockedUntil: config.unlockedUntil?.toISOString() ?? null,
    });
  }
);

router.post(
  "/blocking/status",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const parsed = UpdateBlockingStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { blockingEnabled, instagramBlocked, youtubeBlocked } = parsed.data;

    const existing = await db
      .select()
      .from(blockingConfigTable)
      .where(eq(blockingConfigTable.userId, userId));

    let config;
    if (existing.length > 0) {
      [config] = await db
        .update(blockingConfigTable)
        .set({
          blockingEnabled,
          instagramBlocked: instagramBlocked ?? existing[0]!.instagramBlocked,
          youtubeBlocked: youtubeBlocked ?? existing[0]!.youtubeBlocked,
          updatedAt: new Date(),
        })
        .where(eq(blockingConfigTable.userId, userId))
        .returning();
    } else {
      [config] = await db
        .insert(blockingConfigTable)
        .values({
          userId,
          blockingEnabled,
          instagramBlocked: instagramBlocked ?? true,
          youtubeBlocked: youtubeBlocked ?? true,
        })
        .returning();
    }

    res.json({
      instagramBlocked: config!.instagramBlocked,
      youtubeBlocked: config!.youtubeBlocked,
      blockingEnabled: config!.blockingEnabled,
      unlockedUntil: config!.unlockedUntil?.toISOString() ?? null,
    });
  }
);

export default router;
