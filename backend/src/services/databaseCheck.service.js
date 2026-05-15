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
          message: "Motor no soportado"
        };
    }
  } catch (error) {
    return {
      status: "ERROR",
      message: error.message
    };
  }
}

async function checkPostgres(connection) {
  const client = new Client({
    host: connection.host,
    port: Number(connection.port),
    database: connection.database_name,
    user: connection.user_name,
    password: connection.password
  });

  await client.connect();

  const result = await client.query(`
  SELECT
    (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()) AS connections_count,
    (SELECT COUNT(*) FROM pg_locks) AS locks_count,
    (SELECT COALESCE(SUM(deadlocks), 0) FROM pg_stat_database WHERE datname = current_database()) AS deadlocks_count,
    pg_database_size(current_database()) / 1024 / 1024 AS disk_usage_mb
`);

  await client.end();

  return {
  status: "ACTIVE",
  message: "PostgreSQL conectado",
  metrics: {
    cpu: 0,
    memory: 0,
    connections_count: Number(result.rows[0].connections_count) || 0,
    locks_count: 0,
    deadlocks_count: 0,
    disk_usage_mb: Number(result.rows[0].disk_usage_mb) || 0
  }
};
}

async function checkSQLServer(connection) {
  const pool = await sql.connect({
    user: connection.user_name,
    password: connection.password,
    server: connection.host,
    database: connection.database_name,
    port: Number(connection.port),
    options: {
      trustServerCertificate: true
    }
  });

  await pool.request().query("SELECT GETDATE()");
  await pool.close();

  return {
    status: "ACTIVE",
    message: "SQL Server conectado"
  };
}

async function checkOracle(connection) {
  const conn = await oracledb.getConnection({
    user: connection.user_name,
    password: connection.password,
    connectString: `${connection.host}:${connection.port}/${connection.database_name}`
  });

  await conn.execute("SELECT SYSDATE FROM dual");
  await conn.close();

  return {
    status: "ACTIVE",
    message: "Oracle conectado"
  };
}