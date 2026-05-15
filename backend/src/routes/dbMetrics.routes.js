import express from "express";
import { getDbMetrics } from "../controllers/dbMetrics.controller.js";

const router = express.Router();

router.get("/", getDbMetrics);

export default router;