import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyToken, getDashboardMetrics);

export default router;