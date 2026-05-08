import pool from "../db/pool.js";

export const getMetrics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        hl.id,
        hl.connection_id,
        c.nombre,
        c.motor,
        hl.status,
        hl.message,
        hl.response_time_ms,
        hl.checked_at
      FROM health_logs hl
      INNER JOIN connections c ON c.id = hl.connection_id
      ORDER BY hl.checked_at DESC
      LIMIT 50
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

    const result = await pool.query(
      `
      SELECT
        id,
        connection_id,
        status,
        message,
        response_time_ms,
        checked_at
      FROM health_logs
      WHERE connection_id = $1
      ORDER BY checked_at DESC
      LIMIT 50
      `,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};