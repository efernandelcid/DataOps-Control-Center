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
  await client.query("SELECT NOW()");
  await client.end();

  return {
    status: "ACTIVE",
    message: "PostgreSQL conectado"
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