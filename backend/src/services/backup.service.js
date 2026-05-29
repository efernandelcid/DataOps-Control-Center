import pool from "../db/pool.js";

export async function registerBackup({
  backupType,
  fileName,
  sizeMb,
  durationSeconds,
  status
}) {
  const result = await pool.query(
    `
    INSERT INTO backup_history
    (
      backup_type,
      file_name,
      file_size_mb,
      duration_seconds,
      restore_point,
      status
    )
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
    RETURNING *
    `,
    [
      backupType,
      fileName,
      sizeMb,
      durationSeconds,
      status
    ]
  );

  return result.rows[0];
};