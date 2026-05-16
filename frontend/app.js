import {
  getConnections,
  getAlerts,
  getMetrics,
  getDbMetrics,
  checkConnectionById
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

async function cargarDashboard() {
  let conexiones = [];
  let alertas = [];
  let metricas = [];
  let dbMetrics = [];

  try {
    conexiones = await getConnections();
    alertas = await getAlerts();
    metricas = await getMetrics();
    dbMetrics = await getDbMetrics();

    setApiStatus(true);
  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
    setApiStatus(false);
  }

  renderResumen(conexiones, alertas);
  renderAlertasCriticas(conexiones);
  renderTablaConexiones(conexiones);
  renderHistorial(metricas);
  renderGraficaTiempoRespuesta(metricas);
  renderMetricasAvanzadas(dbMetrics);
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

cargarDashboard();
setInterval(cargarDashboard, 10000);