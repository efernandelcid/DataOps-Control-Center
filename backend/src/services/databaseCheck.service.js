import pkg from "pg";
import sql from "mssql";
import oracledb from "oracledb";

const { Client } = pkg;

export async function checkDatabase(connection) {
  try {
    switch (connection.motor) {
      case "PostgreSQL":
        return await checkPostgres(connection);

      case "SQLServer":
        return await checkSQLServer(connection);

      case "Oracle":
        return await checkOracle(connection);

      default:
        return {
          status: "ERROR",
          message: "Motor no soportado",
          responseTime: 0,
          metrics: defaultMetrics()
        };
    }
  } catch (error) {
    return {
      status: "ERROR",
      message: error.message || "Error desconocido",
      responseTime: 0,
      metrics: defaultMetrics()
    };
  }
}

function defaultMetrics() {
  return {
    cpu: 0,
    memory: 0,
    connections_count: 0,
    locks_count: 0,
    deadlocks_count: 0,
    disk_usage_mb: 0
  };
}

async function checkPostgres(connection) {
  const start = Date.now();

  const client = new Client({
    host: connection.host,
    port: Number(connection.port),
    database: connection.database_name,
    user: connection.user_name,
    password: connection.password,
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()) AS connections_count,
        (SELECT COUNT(*) FROM pg_locks) AS locks_count,
        (SELECT COALESCE(SUM(deadlocks), 0) FROM pg_stat_database WHERE datname = current_database()) AS deadlocks_count,
        pg_database_size(current_database()) / 1024 / 1024 AS disk_usage_mb
    `);

    return {
      status: "ACTIVE",
      message: "PostgreSQL conectado",
      responseTime: Date.now() - start,
      metrics: {
        cpu: 0,
        memory: 0,
        connections_count: Number(result.rows[0].connections_count) || 0,
        locks_count: Number(result.rows[0].locks_count) || 0,
        deadlocks_count: Number(result.rows[0].deadlocks_count) || 0,
        disk_usage_mb: Number(result.rows[0].disk_usage_mb) || 0
      }
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: error.message,
      responseTime: Date.now() - start,
      metrics: defaultMetrics()
    };
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

async function checkSQLServer(connection) {
  const start = Date.now();
  let pool;

  try {
    pool = await sql.connect({
      user: connection.user_name,
      password: connection.password,
      server: connection.host,
      database: connection.database_name,
      port: Number(connection.port),
      options: {
        encrypt: false,
        trustServerCertificate: true
      },
      connectionTimeout: 3000,
      requestTimeout: 3000
    });

    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM sys.dm_exec_sessions) AS connections_count
    `);

    return {
      status: "ACTIVE",
      message: "SQL Server conectado",
      responseTime: Date.now() - start,
      metrics: {
        cpu: 0,
        memory: 0,
        connections_count: Number(result.recordset[0].connections_count) || 0,
        locks_count: 0,
        deadlocks_count: 0,
        disk_usage_mb: 0
      }
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: error.message,
      responseTime: Date.now() - start,
      metrics: defaultMetrics()
    };
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch {}
    }
  }
}

async function checkOracle(connection) {
  const start = Date.now();
  let conn;

  try {
    conn = await oracledb.getConnection({
      user: connection.user_name,
      password: connection.password,
      connectString: `${connection.host}:${connection.port}/${connection.database_name}`
    });

    await conn.execute("SELECT SYSDATE FROM dual");

    return {
      status: "ACTIVE",
      message: "Oracle conectado",
      responseTime: Date.now() - start,
      metrics: {
        cpu: 0,
        memory: 0,
        connections_count: 1,
        locks_count: 0,
        deadlocks_count: 0,
        disk_usage_mb: 0
      }
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: error.message,
      responseTime: Date.now() - start,
      metrics: defaultMetrics()
    };
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
}