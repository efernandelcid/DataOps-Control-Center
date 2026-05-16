export function renderAlertasCriticas(conexiones) {
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