const API_URL = window.APP_CONFIG?.API_URL || "http://localhost:3000/api";

export async function getConnections() {
  return await fetch(`${API_URL}/connections`).then(res => res.json());
}

export async function getAlerts() {
  return await fetch(`${API_URL}/alerts`).then(res => res.json());
}

export async function getMetrics() {
  return await fetch(`${API_URL}/metrics`).then(res => res.json());
}

export async function getDbMetrics() {
  return await fetch(`${API_URL}/db-metrics`).then(res => res.json());
}

export async function checkConnectionById(id) {
  return await fetch(`${API_URL}/connections/${id}/check`);
}