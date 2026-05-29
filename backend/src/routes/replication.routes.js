import { Router } from "express";

import {
  simulateReplication,
  getReplicationHistory
} from "../controllers/replication.controller.js";

import { verifyToken }
from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/simulate",
  verifyToken,
  simulateReplication
);

router.get(
  "/",
  verifyToken,
  getReplicationHistory
);

export default router;
