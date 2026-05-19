import cron from "node-cron";
import pool from "../db/pool.js";

export function startCleanupJob() {
  cron.schedule("0 0 * * *", async () => {
    console.log("Ejecutando limpieza automática de logs...");

    try {
      await pool.query(`
        DELETE FROM health_logs
        WHERE checked_at < NOW() - INTERVAL '30 days'
      `);

      await pool.query(`
        DELETE FROM db_metrics
        WHERE capture_time < NOW() - INTERVAL '30 days'
      `);

      console.log("Limpieza automática finalizada.");
    } catch (error) {
      console.error("Error en limpieza automática:", error.message);
    }
  });
}