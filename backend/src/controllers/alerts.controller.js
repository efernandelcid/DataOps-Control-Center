import pool from "../db/pool.js";

export const getAlerts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        c.nombre AS connection_name,
        a.severity,
        a.condition_triggered,
        a.status,
        a.created_at
      FROM alert_log a
      JOIN connections c
      ON c.id = a.db_id
      ORDER BY a.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const closeAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE alert_log
      SET status = 'CLOSED'
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Alerta no encontrada"
      });
    }

    res.json({
      message: "Alerta cerrada correctamente",
      alert: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};