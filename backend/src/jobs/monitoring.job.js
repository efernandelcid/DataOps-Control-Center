import cron from "node-cron";
import pool from "../db/pool.js";
import { checkDatabase } from "../services/databaseCheck.service.js";

export function startMonitoringJob() {
  cron.schedule("*/30 * * * * *", async () => {
    console.log("Ejecutando monitoreo automático...");

    try {
      const result = await pool.query("SELECT * FROM connections ORDER BY id ASC");
      const connections = result.rows;

      for (const connection of connections) {
        const start = Date.now();

        const health = await checkDatabase({
          ...connection,
          password: connection.password_encrypted
        });

        const responseTime = Date.now() - start;

        await pool.query(
          `
          UPDATE connections
          SET status = $1,
              last_message = $2
          WHERE id = $3
          `,
          [health.status, health.message, connection.id]
        );

        await pool.query(
          `
          INSERT INTO health_logs
          (connection_id, status, message, response_time_ms)
          VALUES ($1, $2, $3, $4)
          `,
          [connection.id, health.status, health.message, responseTime]
        );

        await pool.query(
          `
          INSERT INTO db_metrics
          (
            connection_id,
            cpu,
            memory,
            connections_count,
            locks_count,
            deadlocks_count,
            disk_usage_mb
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            connection.id,
            health.metrics?.cpu || 0,
            health.metrics?.memory || 0,
            health.metrics?.connections_count || 0,
            health.metrics?.locks_count || 0,
            health.metrics?.deadlocks_count || 0,
            health.metrics?.disk_usage_mb || 0
          ]
        );
      }

      console.log("Monitoreo automático finalizado.");
    } catch (error) {
      console.error("Error en monitoreo automático:", error.message);
    }
  });
}