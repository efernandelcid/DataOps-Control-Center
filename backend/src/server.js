import dotenv from "dotenv";
import app from "./app.js";
import { startMonitoringJob } from "./jobs/monitoring.job.js";
import { startCleanupJob } from "./jobs/cleanup.job.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

startMonitoringJob();

startCleanupJob();