import { Router } from "express";
import { simulateTransaction } from "../controllers/transaction.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/simulate", verifyToken, simulateTransaction);

export default router;