import pool from "../db/pool.js";

export const getDashboardMetrics = async (req, res) => {
  try {

    const totalConnections = await pool.query(`
      SELECT COUNT(*) FROM connections
    `);

    const activeConnections = await pool.query(`
      SELECT COUNT(*) FROM connections
      WHERE status = 'ACTIVE'
    `);

    const errorConnections = await pool.query(`
      SELECT COUNT(*) FROM connections
      WHERE status = 'ERROR'
    `);

    const avgResponse = await pool.query(`
      SELECT AVG(duration_ms) as average
      FROM query_log
    `);

    const slowQueries = await pool.query(`
      SELECT COUNT(*) 
      FROM query_log
      WHERE classification IN ('SLOW', 'CRITICAL')
    `);

    const recentErrors = await pool.query(`
      SELECT nombre, last_message, created_at
      FROM connections
      WHERE status = 'ERROR'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      total_connections: Number(totalConnections.rows[0].count),
      active_connections: Number(activeConnections.rows[0].count),
      error_connections: Number(errorConnections.rows[0].count),
      average_response_ms: Number(avgResponse.rows[0].average || 0).toFixed(2),
      slow_queries: Number(slowQueries.rows[0].count),
      recent_errors: recentErrors.rows
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};