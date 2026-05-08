import pool from "../db/pool.js";

export const getMetrics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        c.nombre AS connection_name,
        c.motor,
        m.cpu,
        m.memory,
        m.connections_count,
        m.locks_count,
        m.deadlocks_count,
        m.disk_usage_mb,
        m.capture_time
      FROM db_metrics m
      JOIN connections c
      ON c.id = m.db_id
      ORDER BY m.capture_time DESC
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getMetricsByConnection = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT *
      FROM db_metrics
      WHERE db_id = $1
      ORDER BY capture_time DESC
    `, [id]);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};