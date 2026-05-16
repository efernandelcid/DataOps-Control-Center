export function renderMetricasAvanzadas(dbMetrics) {
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

export function renderHistorial(metricas) {
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

export function renderGraficaTiempoRespuesta(metricas) {
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