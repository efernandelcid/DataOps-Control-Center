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
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import backupRoutes from "./routes/backup.routes.js";
import replicationRoutes from "./routes/replication.routes.js";

import { verifyToken, requireRole } from "./middlewares/auth.middleware.js";
import failoverRoutes from "./routes/failover.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/health", verifyToken, healthRoutes);
app.use("/api/db", verifyToken, dbRoutes);
app.use("/api/connections", verifyToken, connectionsRoutes);
app.use("/api/metrics", verifyToken, metricsRoutes);
app.use("/api/alerts", verifyToken, alertsRoutes);
app.use("/api/db-metrics", verifyToken, dbMetricsRoutes);
app.use("/api/system-status", verifyToken, systemStatusRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/backups", backupRoutes);
app.use("/api/replication", replicationRoutes );
app.use("/api/failover", failoverRoutes);


app.use(
  "/api/connections",
  verifyToken,
  requireRole("ADMIN"),
  healthCheckRoutes
);

export default app;