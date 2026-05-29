import pool from "../db/pool.js";
import { registerBackup } from "../services/backup.service.js";

export const simulateBackup = async (req, res) => {
  try {
    const start = Date.now();

    const backupType = req.body.backup_type || "FULL";

    const fileName =
      `backup_${backupType.toLowerCase()}_${Date.now()}.bak`;

    const sizeMb =
      (Math.random() * 500 + 50).toFixed(2);

    const durationSeconds =
  Math.floor((Date.now() - start) / 1000 + Math.random() * 3);

    const backup = await registerBackup({
      backupType,
      fileName,
      sizeMb,
      durationSeconds,
      status: "SUCCESS"
    });

    res.json(backup);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });
  }
};

export const getBackupHistory = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM backup_history
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