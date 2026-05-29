import pool from "../db/pool.js";

export const simulateFailover = async (req, res) => {
  try {
    const recoveryTimeMs = Math.floor(Math.random() * 2000) + 500;

    const result = await pool.query(
      `
      INSERT INTO failover_events
      (primary_db, replica_db, reason, recovery_time_ms, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        "dataops_postgres",
        "pg-standby",
        "Primary database unavailable",
        recoveryTimeMs,
        "FAILOVER_ACTIVE"
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getFailoverHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM failover_events
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};