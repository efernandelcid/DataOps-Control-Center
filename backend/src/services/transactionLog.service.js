import pool from "../db/pool.js";

export async function registerTransactionLog({
  sessionId,
  operation,
  inicio,
  fin,
  waitTime,
  lockType
}) {
  await pool.query(
    `
    INSERT INTO tx_log
    (session_id, operation_type, start_time, end_time, wait_time_ms, lock_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      sessionId,
      operation,
      inicio,
      fin,
      waitTime,
      lockType
    ]
  );
}