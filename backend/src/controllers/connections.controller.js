import pool from "../db/pool.js";

export const getConnections = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre, motor, host, port, database_name, user_name, status, created_at FROM connections ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConnection = async (req, res) => {
  try {
    const { nombre, motor, host, port, database_name, user_name, password_encrypted } = req.body;

    const result = await pool.query(
      `INSERT INTO connections 
      (nombre, motor, host, port, database_name, user_name, password_encrypted, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
      RETURNING id, nombre, motor, host, port, database_name, user_name, status, created_at`,
      [nombre, motor, host, port, database_name, user_name, password_encrypted]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConnectionById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, motor, host, port, database_name, user_name, status, created_at FROM connections WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Conexión no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteConnection = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM connections WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Conexión no encontrada" });
    }

    res.json({ message: "Conexión eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};