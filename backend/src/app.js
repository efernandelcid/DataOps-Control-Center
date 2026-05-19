import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import dbRoutes from "./routes/db.routes.js";
import dbMetricsRoutes from "./routes/dbMetrics.routes.js";
import connectionsRoutes from "./routes/connections.routes.js";

import healthCheckRoutes from "./routes/healthCheck.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";
import alertsRoutes from "./routes/alerts.routes.js";
import systemStatusRoutes from "./routes/systemStatus.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/db", dbRoutes);
app.use("/api/connections", connectionsRoutes);
app.use("/api/connections", healthCheckRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/db-metrics", dbMetricsRoutes);
app.use("/api/system-status", systemStatusRoutes);

export default app;