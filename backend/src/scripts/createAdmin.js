import bcrypt from "bcryptjs";
import pool from "../db/pool.js";

const username = "admin";
const password = "admin123";
const role = "ADMIN";

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO NOTHING
      `,
      [username, passwordHash, role]
    );

    console.log("Usuario ADMIN creado correctamente");
    console.log("Usuario:", username);
    console.log("Contraseña:", password);

    process.exit(0);
  } catch (error) {
    console.error("Error creando usuario ADMIN:", error.message);
    process.exit(1);
  }
}

createAdmin();