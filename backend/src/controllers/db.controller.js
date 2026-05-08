import pool from "../db/pool.js";

export const testDBConnection = async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "SUCCESS",
      database_time: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};