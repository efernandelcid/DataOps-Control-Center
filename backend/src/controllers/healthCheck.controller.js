import pool from "../db/pool.js";
import { checkDatabase } from "../services/databaseCheck.service.js";
import { setCache } from "../services/cache.service.js";

export const checkConnectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM connections WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Conexión no encontrada"
      });
    }

    const connection = result.rows[0];

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
      [
        health.status,
        health.message,
        id
      ]
    );

    await setCache("connections:list", null, 1);

    await pool.query(
      `
      INSERT INTO health_logs
      (connection_id, status, message, response_time_ms)
      VALUES ($1, $2, $3, $4)
      `,
      [
        id,
        health.status,
        health.message,
        responseTime
      ]
    );

    if (health.status === "ERROR") {
  await pool.query(
    `
    INSERT INTO alert_log
    (db_id, condition_triggered, status)
    VALUES ($1, $2, $3)
    `,
    [
      id,
      `Fallo de conexión: ${health.message}`,
      "OPEN"
    ]
  );
}

    res.json({
      connection_id: id,
      status: health.status,
      message: health.message,
      response_time_ms: responseTime
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};