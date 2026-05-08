import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import dbRoutes from "./routes/db.routes.js";
import connectionsRoutes from "./routes/connections.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/db", dbRoutes);
app.use("/api/connections", connectionsRoutes);

export default app;