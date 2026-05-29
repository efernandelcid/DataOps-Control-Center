const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

import {
  getConnections,
  getAlerts,
  getMetrics,
  getDbMetrics,
  checkConnectionById,
  getSystemStatus,
  getBackups,
  getReplication,
  getFailoverHistory
} from "./services/api.service.js";

import {
  renderResumen,
  setApiStatus,
  setLastUpdate
} from "./ui/dashboard.ui.js";

import { renderAlertasCriticas } from "./ui/alerts.ui.js";
import { renderTablaConexiones } from "./ui/connections.ui.js";

import {
  renderMetricasAvanzadas,
  renderHistorial,
  renderGraficaTiempoRespuesta
} from "./ui/metrics.ui.js";

let conexionesGlobales = [];

function renderBackups(backups) {
  const tbody = document.getElementById("backupsTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  backups.forEach(b => {
    tbody.innerHTML += `
      <tr>
        <td>${b.backup_type || "-"}</td>
        <td>${b.file_name || "-"}</td>
        <td>${b.file_size_mb || b.size_mb || "-"}</td>
        <td>${b.duration_seconds || "-"} s</td>
        <td><span class="status-badge ${b.status || "ACTIVE"}">${b.status || "-"}</span></td>
        <td>${b.created_at ? new Date(b.created_at).toLocaleString() : "-"}</td>
      </tr>
    `;
  });
}

function renderReplication(replication) {
  const tbody = document.getElementById("replicationTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  replication.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td>${r.primary_db || "-"}</td>
        <td>${r.replica_db || "-"}</td>
        <td>${r.replication_lag_ms ?? "-"}</td>
        <td><span class="status-badge ${r.status || ""}">${r.status || "-"}</span></td>
        <td>${r.checked_at ? new Date(r.checked_at).toLocaleString() : "-"}</td>
      </tr>
    `;
  });
}

function renderFailover(events) {
  const tbody = document.getElementById("failoverTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  events.forEach(event => {
    tbody.innerHTML += `
      <tr>
        <td>${event.primary_db || "-"}</td>
        <td>${event.replica_db || "-"}</td>
        <td>${event.reason || "-"}</td>
        <td>${event.recovery_time_ms ?? "-"} ms</td>
        <td><span class="status-badge ${event.status || ""}">${event.status || "-"}</span></td>
        <td>${event.created_at ? new Date(event.created_at).toLocaleString() : "-"}</td>
      </tr>
    `;
  });
}

async function cargarDashboard() {
  let conexiones = [];
  let alertas = [];
  let metricas = [];
  let dbMetrics = [];
  let systemStatus = null;
  let backups = [];
  let replication = [];
  let failover = [];

  try {
    conexiones = await getConnections();
    conexionesGlobales = conexiones;

    alertas = await getAlerts();
    metricas = await getMetrics();
    dbMetrics = await getDbMetrics();
    systemStatus = await getSystemStatus();

    backups = await getBackups();
    replication = await getReplication();
    failover = await getFailoverHistory();

    setApiStatus(true);
  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
    setApiStatus(false);
  }

  renderResumen(conexiones, alertas);

  const systemStatusElement = document.getElementById("systemStatus");
  if (systemStatusElement) {
    systemStatusElement.textContent = systemStatus?.status || "ERROR";
  }

  renderAlertasCriticas(conexiones);
  aplicarFiltrosConexiones();
  renderHistorial(metricas);
  renderGraficaTiempoRespuesta(metricas);
  renderMetricasAvanzadas(dbMetrics);
  renderBackups(backups);
  renderReplication(replication);
  renderFailover(failover);
  setLastUpdate();
}

window.checkConnection = async function (id) {
  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = true);

  try {
    await checkConnectionById(id);
    await cargarDashboard();
  } catch (error) {
    console.error("Error ejecutando check:", error);
    alert("No se pudo revisar la conexión.");
  } finally {
    buttons.forEach(btn => btn.disabled = false);
  }
};

window.exportarCSV = async function () {
  try {
    const metricas = await getMetrics();

    let csv = "Base de datos,Motor,Estado,Mensaje,Tiempo,Fecha\n";

    metricas.forEach(m => {
      csv += `"${m.nombre || "-"}","${m.motor || "-"}","${m.status || "-"}","${m.message || "-"}","${m.response_time_ms ?? "-"} ms","${m.checked_at || "-"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_monitoreo.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exportando CSV:", error);
    alert("No se pudo exportar el reporte.");
  }
};

function aplicarFiltrosConexiones() {
  const search = document.getElementById("searchConnection")?.value.toLowerCase() || "";
  const motor = document.getElementById("filterMotor")?.value || "";
  const status = document.getElementById("filterStatus")?.value || "";

  const filtradas = conexionesGlobales.filter(c => {
    const nombre = c.nombre?.toLowerCase() || "";
    const host = c.host?.toLowerCase() || "";

    const coincideBusqueda =
      nombre.includes(search) ||
      host.includes(search);

    const coincideMotor = motor === "" || c.motor === motor;
    const coincideStatus = status === "" || c.status === status;

    return coincideBusqueda && coincideMotor && coincideStatus;
  });

  renderTablaConexiones(filtradas);

  const filterResultCount = document.getElementById("filterResultCount");

  if (filterResultCount) {
    filterResultCount.textContent =
      `Mostrando ${filtradas.length} de ${conexionesGlobales.length} conexiones`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const sessionUser = document.getElementById("sessionUser");
  const sessionRole = document.getElementById("sessionRole");
  const logoutBtn = document.getElementById("logoutBtn");

  if (sessionUser) sessionUser.textContent = `Usuario: ${username}`;
  if (sessionRole) sessionRole.textContent = `Rol: ${role}`;

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  document.getElementById("searchConnection")?.addEventListener("input", aplicarFiltrosConexiones);
  document.getElementById("filterMotor")?.addEventListener("change", aplicarFiltrosConexiones);
  document.getElementById("filterStatus")?.addEventListener("change", aplicarFiltrosConexiones);
});

cargarDashboard();
setInterval(cargarDashboard, 10000);