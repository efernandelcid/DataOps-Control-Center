import pool from "../db/pool.js";

export async function registerFailoverEvent({
  primaryDb,
  replicaDb,
  reason,
  recoveryTimeMs,
  status
}) {
  const result = await pool.query(
    `
    INSERT INTO failover_events
    (primary_db, replica_db, reason, recovery_time_ms, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [primaryDb, replicaDb, reason, recoveryTimeMs, status]
  );

  return result.rows[0];
}