const API_URL = window.APP_CONFIG?.API_URL || "http://localhost:3000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function getConnections() {
  return await fetch(`${API_URL}/connections`, {
    headers: getAuthHeaders()
  }).then(res => res.json());
}

export async function getAlerts() {
  return await fetch(`${API_URL}/alerts`, {
    headers: getAuthHeaders()
  }).then(res => res.json());
}

export async function getMetrics() {
  return await fetch(`${API_URL}/metrics`, {
    headers: getAuthHeaders()
  }).then(res => res.json());
}

export async function getDbMetrics() {
  return await fetch(`${API_URL}/db-metrics`, {
    headers: getAuthHeaders()
  }).then(res => res.json());
}

export async function getSystemStatus() {
  return await fetch(`${API_URL}/system-status`, {
    headers: getAuthHeaders()
  }).then(res => res.json());
}

export async function checkConnectionById(id) {
  return await fetch(`${API_URL}/connections/${id}/check`, {
    headers: getAuthHeaders()
  });
}

export async function getBackups() {
  return await fetch(`${API_URL}/backups`, {
    headers: getAuthHeaders()
  }).then(res => res.json());
}

export async function getReplication() {
  return await fetch(`${API_URL}/replication`, {
    headers: getAuthHeaders()
  }).then(res => res.json());
}

export async function getFailoverHistory() {
  return await fetch(`${API_URL}/failover`, {
    headers: getAuthHeaders()
  }).then(res => res.json());
}