import express from "express";

import {
  getAlerts,
  closeAlert
} from "../controllers/alerts.controller.js";

const router = express.Router();

router.get("/", getAlerts);
router.put("/:id/close", closeAlert);

export default router;