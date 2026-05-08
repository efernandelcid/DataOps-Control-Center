const API_URL = "http://localhost:3000/api";

async function cargarDashboard() {
  const conexiones = await fetch(`${API_URL}/connections`).then(res => res.json());
  const alertas = await fetch(`${API_URL}/alerts`).then(res => res.json());

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
        <td>
          <button onclick="checkConnection(${c.id})">Check</button>
        </td>
      </tr>
    `;
  });
}

async function checkConnection(id) {
  await fetch(`${API_URL}/connections/${id}/check`);
  cargarDashboard();
}

cargarDashboard();
setInterval(cargarDashboard, 10000);