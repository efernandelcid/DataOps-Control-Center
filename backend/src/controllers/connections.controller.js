import pool from "../db/pool.js";
import { getCache, setCache } from "../services/cache.service.js";
import { analyzeQuery } from "../services/queryAnalyzer.service.js";

async function registrarCacheMetric(cacheKey, resultType, responseTimeMs) {
  try {
    await pool.query(
      `INSERT INTO cache_metrics (cache_key, result_type, response_time_ms)
       VALUES ($1, $2, $3)`,
      [cacheKey, resultType, responseTimeMs]
    );
  } catch (error) {
    console.error("Error registrando métrica de caché:", error.message);
  }
}

export const getConnections = async (req, res) => {
  const startTime = Date.now();
  const cacheKey = "connections:list";

  try {
    const cachedConnections = await getCache(cacheKey);

    if (cachedConnections) {
      const responseTime = Date.now() - startTime;
      await registrarCacheMetric(cacheKey, "HIT", responseTime);
      return res.json(cachedConnections);
    }

    const result = await analyzeQuery(
      "SELECT id, nombre, motor, host, port, database_name, user_name, status, last_message, created_at FROM connections ORDER BY id DESC"
    );

    await setCache(cacheKey, result.rows, 60);

    const responseTime = Date.now() - startTime;
    await registrarCacheMetric(cacheKey, "MISS", responseTime);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConnection = async (req, res) => {
  try {
    const {
      nombre,
      motor,
      host,
      port,
      database_name,
      user_name,
      password_encrypted
    } = req.body;

    const result = await pool.query(
      `INSERT INTO connections 
      (nombre, motor, host, port, database_name, user_name, password_encrypted, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
      RETURNING id, nombre, motor, host, port, database_name, user_name, status, created_at`,
      [nombre, motor, host, port, database_name, user_name, password_encrypted]
    );

    await setCache("connections:list", null, 1);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConnectionById = async (req, res) => {
  try {
    const cacheKey = `connections:${req.params.id}`;
    const cachedConnection = await getCache(cacheKey);

    if (cachedConnection) {
      return res.json(cachedConnection);
    }

    const result = await pool.query(
      "SELECT id, nombre, motor, host, port, database_name, user_name, status, created_at FROM connections WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Conexión no encontrada" });
    }

    await setCache(cacheKey, result.rows[0], 60);

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

    await setCache("connections:list", null, 1);

    res.json({ message: "Conexión eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};