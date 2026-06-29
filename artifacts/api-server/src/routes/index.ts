import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";
import leetcodeRouter from "./leetcode";
import blockingRouter from "./blocking";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(statsRouter);
router.use(leaderboardRouter);
router.use(leetcodeRouter);
router.use(blockingRouter);

export default router;
