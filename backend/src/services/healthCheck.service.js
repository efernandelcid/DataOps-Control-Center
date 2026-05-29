import pkg from "pg";
import sql from "mssql";
import oracledb from "oracledb";
import { setCache } from "../services/cache.service.js";



const { Pool } = pkg;

export const checkPostgresConnection = async (connection) => {
  const start = Date.now();

  const testPool = new Pool({
    host: connection.host,
    port: connection.port,
    database: connection.database_name,
    user: connection.user_name,
    password: connection.password_encrypted,
    connectionTimeoutMillis: 3000,
  });

  try {
    await testPool.query("SELECT 1");
    const responseTime = Date.now() - start;
    await testPool.end();

    return {
      status: "ACTIVE",
      responseTime,
      message: "PostgreSQL conectado"
    };
  } catch (error) {
    await testPool.end();

    return {
      status: "ERROR",
      responseTime: Date.now() - start,
      message: error.message
    };
  }
};

export const checkSqlServerConnection = async (connection) => {
  const start = Date.now();

  try {
    const pool = await sql.connect({
      server: connection.host,
      port: Number(connection.port),
      database: connection.database_name,
      user: connection.user_name,
      password: connection.password_encrypted,
      options: {
        encrypt: false,
        trustServerCertificate: true
      },
      connectionTimeout: 3000,
      requestTimeout: 3000
    });

    await pool.request().query("SELECT 1 AS test");
    await pool.close();

    return {
      status: "ACTIVE",
      responseTime: Date.now() - start,
      message: "SQL Server conectado"
    };
  } catch (error) {
    return {
      status: "ERROR",
      responseTime: Date.now() - start,
      message: error.message
    };
  }
};

export const checkOracleConnection = async (connection) => {
  const start = Date.now();

  let oracleConnection;

  try {
    oracleConnection = await oracledb.getConnection({
      user: connection.user_name,
      password: connection.password_encrypted,
      connectString: `${connection.host}:${connection.port}/${connection.database_name}`
    });

    await oracleConnection.execute("SELECT 1 FROM dual");

    return {
      status: "ACTIVE",
      responseTime: Date.now() - start,
      message: "Oracle conectado"
    };
  } catch (error) {
    return {
      status: "ERROR",
      responseTime: Date.now() - start,
      message: error.message
    };
  } finally {
    if (oracleConnection) {
      try {
        await oracleConnection.close();
      } catch {}
    }
  }
};

export const checkDatabaseConnection = async (connection) => {
  if (connection.motor === "PostgreSQL") {
    return await checkPostgresConnection(connection);
  }

  if (connection.motor === "SQLServer") {
    return await checkSqlServerConnection(connection);
  }

  if (connection.motor === "Oracle") {
    return await checkOracleConnection(connection);
  }

  return {
    status: "ERROR",
    responseTime: 0,
    message: "Motor no soportado"
  };
};