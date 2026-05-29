import pool from "../db/pool.js";

function classifyQuery(durationMs) {
  if (durationMs < 100) return "FAST";
  if (durationMs <= 500) return "MEDIUM";
  if (durationMs <= 2000) return "SLOW";
  return "CRITICAL";
}

export async function analyzeQuery(queryText, params = []) {
  const startTime = Date.now();

  const result = await pool.query(queryText, params);

  const durationMs = Date.now() - startTime;
  const classification = classifyQuery(durationMs);

  await pool.query(
    `INSERT INTO query_log 
    (query_text, duration_ms, rows_returned, index_used, execution_plan, classification)
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      queryText,
      durationMs,
      result.rowCount || 0,
      null,
      "Plan de ejecución no capturado en esta versión académica",
      classification
    ]
  );

  return result;
}