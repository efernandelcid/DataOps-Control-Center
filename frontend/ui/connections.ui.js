function motorClass(motor) {
  return motor === "SQLServer" ? "SQLServer" : motor;
}

export function renderTablaConexiones(conexiones) {
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