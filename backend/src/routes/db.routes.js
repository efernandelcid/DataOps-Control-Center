import express from "express";
import { testDBConnection } from "../controllers/db.controller.js";

const router = express.Router();

router.get("/test", testDBConnection);

export default router;