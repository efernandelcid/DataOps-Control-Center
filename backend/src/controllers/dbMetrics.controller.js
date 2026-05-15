import pool from "../db/pool.js";

export const getDbMetrics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        dm.id,
        dm.connection_id,
        c.nombre,
        c.motor,
        dm.cpu,
        dm.memory,
        dm.connections_count,
        dm.locks_count,
        dm.deadlocks_count,
        dm.disk_usage_mb,
        dm.capture_time
      FROM db_metrics dm
      INNER JOIN connections c ON c.id = dm.connection_id
      ORDER BY dm.capture_time DESC
      LIMIT 50
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};