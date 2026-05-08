import express from "express";
import {
  getConnections,
  createConnection,
  getConnectionById,
  deleteConnection
} from "../controllers/connections.controller.js";

const router = express.Router();

router.get("/", getConnections);
router.post("/", createConnection);
router.get("/:id", getConnectionById);
router.delete("/:id", deleteConnection);

export default router;