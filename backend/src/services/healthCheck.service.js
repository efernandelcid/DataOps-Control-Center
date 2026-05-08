import pkg from "pg";
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
      message: "Conexión exitosa"
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