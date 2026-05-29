import { Router } from "express";
import {
  simulateFailover,
  getFailoverHistory
} from "../controllers/failover.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/simulate", verifyToken, simulateFailover);
router.get("/", verifyToken, getFailoverHistory);

export default router;