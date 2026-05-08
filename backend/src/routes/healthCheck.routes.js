import express from "express";
import { checkConnectionById } from "../controllers/healthCheck.controller.js";

const router = express.Router();

router.get("/:id/check", checkConnectionById);

export default router;