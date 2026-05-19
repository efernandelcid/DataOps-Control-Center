import express from "express";
import { getSystemStatus } from "../controllers/systemStatus.controller.js";

const router = express.Router();

router.get("/", getSystemStatus);

export default router;