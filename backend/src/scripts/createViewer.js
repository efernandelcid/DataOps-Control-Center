import bcrypt from "bcryptjs";
import pool from "../db/pool.js";

const username = "viewer";
const password = "viewer123";
const role = "VIEWER";

async function createViewer() {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username)
      DO UPDATE SET password_hash = $2, role = $3
      `,
      [username, passwordHash, role]
    );

    console.log("Usuario VIEWER creado correctamente");
    console.log("Usuario:", username);
    console.log("Contraseña:", password);

    process.exit(0);
  } catch (error) {
    console.error("Error creando usuario VIEWER:", error.message);
    process.exit(1);
  }
}

createViewer();