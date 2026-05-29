import { Router } from "express";
import { simulateBackup, getBackupHistory } from "../controllers/backup.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/simulate", verifyToken, simulateBackup);
router.get("/", verifyToken, getBackupHistory);

export default router;