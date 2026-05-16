export function renderResumen(conexiones, alertas) {
  document.getElementById("totalConnections").textContent = conexiones.length;
  document.getElementById("activeConnections").textContent =
    conexiones.filter(c => c.status === "ACTIVE").length;
  document.getElementById("totalAlerts").textContent = alertas.length;
}

export function setApiStatus(isOnline) {
  const apiStatus = document.getElementById("apiStatus");
  if (!apiStatus) return;

  apiStatus.textContent = isOnline
    ? "API conectada correctamente"
    : "No se pudo conectar con la API";

  apiStatus.className = isOnline
    ? "api-status online"
    : "api-status offline";
}

export function setLastUpdate() {
  const lastUpdate = document.getElementById("lastUpdate");
  if (!lastUpdate) return;

  lastUpdate.textContent = `Última actualización: ${new Date().toLocaleString("es-GT", {
    timeZone: "America/Guatemala"
  })}`;
}