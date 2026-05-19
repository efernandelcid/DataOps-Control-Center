import pool from "../db/pool.js";

export const getSystemStatus = async (req, res) => {
  try {
    const connections = await pool.query(`
      SELECT
        COUNT(*) AS total_connections,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_connections,
        COUNT(*) FILTER (WHERE status = 'ERROR') AS error_connections
      FROM connections
    `);

    const logs = await pool.query(`
      SELECT COUNT(*) AS total_logs
      FROM health_logs
    `);

    const metrics = await pool.query(`
      SELECT COUNT(*) AS total_metrics
      FROM db_metrics
    `);

    res.json({
      status: "OK",
      backend: "ACTIVE",
      database: "CONNECTED",
      total_connections: Number(connections.rows[0].total_connections),
      active_connections: Number(connections.rows[0].active_connections),
      error_connections: Number(connections.rows[0].error_connections),
      total_logs: Number(logs.rows[0].total_logs),
      total_metrics: Number(metrics.rows[0].total_metrics),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      backend: "ACTIVE",
      database: "ERROR",
      message: error.message
    });
  }
};