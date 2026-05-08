import express from "express";

import {
  getMetrics,
  getMetricsByConnection
} from "../controllers/metrics.controller.js";

const router = express.Router();

router.get("/", getMetrics);
router.get("/:id", getMetricsByConnection);

export default router;