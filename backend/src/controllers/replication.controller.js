import pool from "../db/pool.js";
import { registerReplicationStatus }
from "../services/replication.service.js";

export const simulateReplication = async (req, res) => {

  try {

    const lagMs =
      Math.floor(Math.random() * 500);

    const status =
      lagMs > 300 ? "WARNING" : "HEALTHY";

    const replication =
      await registerReplicationStatus({
        primaryDb: "dataops_postgres",
        replicaDb: "pg-standby",
        lagMs,
        status
      });

    res.json(replication);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

export const getReplicationHistory = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM replica_status
      ORDER BY checked_at DESC
      LIMIT 20
    `);

    res.json(result.rows);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};