import pool from "../db/pool.js";

export async function registerReplicationStatus({
  primaryDb,
  replicaDb,
  lagMs,
  status
}) {

  const result = await pool.query(
    `
    INSERT INTO replica_status
    (
      primary_db,
      replica_db,
      replication_lag_ms,
      status
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      primaryDb,
      replicaDb,
      lagMs,
      status
    ]
  );

  return result.rows[0];
}