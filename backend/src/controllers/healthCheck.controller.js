import pool from "../db/pool.js";
import { checkDatabase } from "../services/databaseCheck.service.js";

export const checkConnectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const connectionResult = await pool.query(
      "SELECT * FROM connections WHERE id = $1",
      [id]
    );

    if (connectionResult.rows.length === 0) {
      return res.status(404).json({ message: "Conexión no encontrada" });
    }

    const connection = connectionResult.rows[0];

    const checkResult = await checkDatabase({
    ...connection,
    password: connection.password_encrypted
    });

    await pool.query(
    "UPDATE connections SET status = $1, last_message = $2 WHERE id = $3",
    [checkResult.status, checkResult.message, id]
    );

    await pool.query(
      `INSERT INTO db_metrics 
      (db_id, cpu, memory, connections_count, locks_count, deadlocks_count, disk_usage_mb)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        10.5,
        35.2,
        1,
        0,
        0,
        250.75
      ]
    );

    if (checkResult.status === "ERROR") {
    await pool.query(`
    INSERT INTO alert_log
    (db_id, severity, condition_triggered, status)
    VALUES ($1, $2, $3, 'OPEN')
    `, [
    id,
    'HIGH',
    checkResult.message
    ]);
  }

    res.json({
      connection_id: id,
      status: checkResult.status,
      response_time_ms: checkResult.responseTime,
      message: checkResult.message
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};