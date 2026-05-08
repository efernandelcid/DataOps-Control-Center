const API_URL = "http://localhost:3000/api";

async function cargarDashboard() {
  const conexiones = await fetch(`${API_URL}/connections`).then(res => res.json());
  const alertas = await fetch(`${API_URL}/alerts`).then(res => res.json());

  let metricas = [];

  try {
    metricas = await fetch(`${API_URL}/metrics`).then(res => res.json());
  } catch (error) {
    console.error("Error cargando métricas:", error);
  }

  document.getElementById("totalConnections").textContent = conexiones.length;
  document.getElementById("activeConnections").textContent =
    conexiones.filter(c => c.status === "ACTIVE").length;
  document.getElementById("totalAlerts").textContent = alertas.length;

  const tbody = document.getElementById("connectionsTable");
  tbody.innerHTML = "";

  conexiones.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.motor}</td>
        <td>${c.host}:${c.port}</td>
        <td class="${c.status}">${c.status}</td>
        <td>${c.last_message || "Sin revisión reciente"}</td>
        <td>
          <button onclick="checkConnection(${c.id})">Check</button>
        </td>
      </tr>
    `;
  });

  const metricsBody = document.getElementById("metricsTable");

  if (metricsBody) {
    metricsBody.innerHTML = "";

    metricas.forEach(m => {
      metricsBody.innerHTML += `
        <tr>
          <td>${m.nombre || "-"}</td>
          <td>${m.motor || "-"}</td>
          <td class="${m.status}">${m.status}</td>
          <td>${m.message || "-"}</td>
          <td>${m.response_time_ms ?? "-"} ms</td>
          <td>${m.checked_at ? new Date(m.checked_at).toLocaleString("es-GT", {
            timeZone: "America/Guatemala"
        })
    : "-"
  }
</td>
        </tr>
      `;
    });
  }
}

async function checkConnection(id) {
  await fetch(`${API_URL}/connections/${id}/check`);
  cargarDashboard();
}

cargarDashboard();
setInterval(cargarDashboard, 10000);