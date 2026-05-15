const API_URL = window.APP_CONFIG?.API_URL || "http://localhost:3000/api";

function setApiStatus(isOnline) {
  const apiStatus = document.getElementById("apiStatus");
  if (!apiStatus) return;

  if (isOnline) {
    apiStatus.textContent = "API conectada correctamente";
    apiStatus.className = "api-status online";
  } else {
    apiStatus.textContent = "No se pudo conectar con la API";
    apiStatus.className = "api-status offline";
  }
}

async function cargarDashboard() {
  let conexiones = [];
  let alertas = [];
  let metricas = [];
  let dbMetrics = [];

  try {
    conexiones = await fetch(`${API_URL}/connections`).then(res => res.json());
    alertas = await fetch(`${API_URL}/alerts`).then(res => res.json());
    metricas = await fetch(`${API_URL}/metrics`).then(res => res.json());
    dbMetrics = await fetch(`${API_URL}/db-metrics`).then(res => res.json());

    setApiStatus(true);
  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
    setApiStatus(false);
  }
  const loadingStatus = document.getElementById("loadingStatus");
if (loadingStatus) {
  loadingStatus.style.display = "inline-block";
}

  document.getElementById("totalConnections").textContent = conexiones.length;
  document.getElementById("activeConnections").textContent =
    conexiones.filter(c => c.status === "ACTIVE").length;
  document.getElementById("totalAlerts").textContent = alertas.length;

  cargarAlertasCriticas(conexiones);
  cargarTablaConexiones(conexiones);
  cargarHistorial(metricas);
  cargarGraficaTiempoRespuesta(metricas);
  cargarMetricasAvanzadas(dbMetrics);
  if (loadingStatus) {
  loadingStatus.style.display = "none";
}

const lastUpdate = document.getElementById("lastUpdate");

if (lastUpdate) {
  lastUpdate.textContent = `Última actualización: ${new Date().toLocaleString("es-GT", {
    timeZone: "America/Guatemala"
  })}`;
}
}

function motorClass(motor) {
  return motor === "SQLServer" ? "SQLServer" : motor;
}

function cargarAlertasCriticas(conexiones) {
  const criticalAlerts = document.getElementById("criticalAlerts");
  if (!criticalAlerts) return;

  const errores = conexiones.filter(c => c.status === "ERROR");

  criticalAlerts.innerHTML = errores.length === 0
    ? `<p class="success-text">No hay alertas críticas activas.</p>`
    : errores.map(e => `
        <div class="alert-card">
          <strong>${e.nombre}</strong>
          <span>${e.motor} - ${e.host}:${e.port}</span>
          <p>${e.last_message || "Sin detalle del error"}</p>
        </div>
      `).join("");
}

function cargarTablaConexiones(conexiones) {
  const tbody = document.getElementById("connectionsTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  conexiones.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>
          <span class="db-badge ${motorClass(c.motor)}">${c.motor}</span>
        </td>
        <td>${c.host}:${c.port}</td>
        <td>
          <span class="status-badge ${c.status}">${c.status}</span>
        </td>
        <td>${c.last_message || "Sin revisión reciente"}</td>
        <td>
          <button onclick="checkConnection(${c.id})">Check</button>
        </td>
      </tr>
    `;
  });
}

function cargarHistorial(metricas) {
  const metricsBody = document.getElementById("metricsTable");
  if (!metricsBody) return;

  metricsBody.innerHTML = "";

  metricas.forEach(m => {
    metricsBody.innerHTML += `
      <tr>
        <td>${m.nombre || "-"}</td>
        <td>${m.motor || "-"}</td>
        <td>
          <span class="status-badge ${m.status}">${m.status}</span>
        </td>
        <td>${m.message || "-"}</td>
        <td>${m.response_time_ms ?? "-"} ms</td>
        <td>
          ${
            m.checked_at
              ? new Date(m.checked_at).toLocaleString("es-GT", {
                  timeZone: "America/Guatemala"
                })
              : "-"
          }
        </td>
      </tr>
    `;
  });
}

function cargarGraficaTiempoRespuesta(metricas) {
  const ctx = document.getElementById("responseChart");
  if (!ctx) return;

  const ultimasMetricas = metricas.slice(0, 10).reverse();

  const labels = ultimasMetricas.map(m =>
    new Date(m.checked_at).toLocaleTimeString("es-GT", {
      timeZone: "America/Guatemala"
    })
  );

  const tiempos = ultimasMetricas.map(m => m.response_time_ms || 0);

  if (window.responseChartInstance) {
    window.responseChartInstance.destroy();
  }

  window.responseChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Tiempo de respuesta (ms)",
        data: tiempos,
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.2)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "white" } }
      },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });
}

function cargarMetricasAvanzadas(dbMetrics) {
  if (!dbMetrics || dbMetrics.length === 0) return;

  const avg = (field) => {
    const values = dbMetrics.map(m => Number(m[field]) || 0);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const maxConnections = Math.max(...dbMetrics.map(m => Number(m.connections_count) || 0));
  const maxLocks = Math.max(...dbMetrics.map(m => Number(m.locks_count) || 0));
  const maxDeadlocks = Math.max(...dbMetrics.map(m => Number(m.deadlocks_count) || 0));

  document.getElementById("avgCpu").textContent = `${avg("cpu").toFixed(2)}%`;
  document.getElementById("avgMemory").textContent = `${avg("memory").toFixed(2)}%`;
  document.getElementById("avgConnections").textContent = maxConnections;
  document.getElementById("avgDisk").textContent = `${avg("disk_usage_mb").toFixed(2)} MB`;
  document.getElementById("avgLocks").textContent = maxLocks;
  document.getElementById("avgDeadlocks").textContent = maxDeadlocks;
}

window.exportarCSV = async function () {
  try {
    const metricas = await fetch(`${API_URL}/metrics`).then(res => res.json());

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

async function checkConnection(id) {
  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = true);

  try {
    await fetch(`${API_URL}/connections/${id}/check`);
    await cargarDashboard();
  } catch (error) {
    console.error("Error ejecutando check:", error);
    alert("No se pudo revisar la conexión.");
  } finally {
    buttons.forEach(btn => btn.disabled = false);
  }
}

cargarDashboard();
setInterval(cargarDashboard, 10000);