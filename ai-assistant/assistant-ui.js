export class AssistantUI {
  constructor({ assistant, container }) {
    if (!assistant) throw new Error("AssistantUI necesita una instancia assistant.");
    this.assistant = assistant;
    this.container = typeof container === "string" ? document.querySelector(container) : container;
    if (!this.container) throw new Error("No se encontró el contenedor del asistente.");
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <section class="po-ai">
        <header class="po-ai__header">
          <div><strong>Asistente IA</strong><small>Pallet Operations</small></div>
          <button type="button" data-action="new">Nueva conversación</button>
        </header>
        <div class="po-ai__status" role="status" aria-live="polite"></div>
        <div class="po-ai__history" aria-live="polite"></div>
        <form class="po-ai__composer">
          <textarea rows="3" placeholder="Pregunta sobre órdenes, inventario, producción..." required></textarea>
          <div class="po-ai__actions">
            <button type="button" data-action="cancel" disabled>Detener</button>
            <button type="submit">Enviar</button>
          </div>
        </form>
      </section>`;
    this.historyEl = this.container.querySelector(".po-ai__history");
    this.statusEl = this.container.querySelector(".po-ai__status");
    this.form = this.container.querySelector("form");
    this.input = this.container.querySelector("textarea");
    this.cancelButton = this.container.querySelector('[data-action="cancel"]');
    this.form.addEventListener("submit", e => this.onSubmit(e));
    this.cancelButton.addEventListener("click", () => this.assistant.cancel());
    this.container.querySelector('[data-action="new"]').addEventListener("click", () => {
      this.assistant.clearConversation();
      this.historyEl.innerHTML = "";
      this.setStatus("Nueva conversación.");
    });
  }

  async onSubmit(event) {
    event.preventDefault();
    const message = this.input.value.trim();
    if (!message) return;
    this.append("user", message);
    this.input.value = "";
    this.setBusy(true);
    try {
      const response = await this.assistant.sendMessage(message);
      this.appendResponse(response);
      this.setStatus("");
    } catch (error) {
      this.append("error", this.friendlyError(error));
      this.setStatus("Ocurrió un error. Puede reintentar.");
    } finally {
      this.setBusy(false);
    }
  }

  appendResponse(response) {
    if (response.type === "table" && Array.isArray(response.data)) {
      this.appendTable(response.data);
      return;
    }
    if (response.type === "alert") {
      this.append("alert", response.content);
      return;
    }
    this.append("assistant", response.content || "Sin datos disponibles.");
  }

  append(role, text) {
    const item = document.createElement("article");
    item.className = `po-ai__message po-ai__message--${role}`;
    item.textContent = text;
    this.historyEl.appendChild(item);
    this.historyEl.scrollTop = this.historyEl.scrollHeight;
  }

  appendTable(rows) {
    if (!rows.length) return this.append("assistant", "No se encontraron resultados.");
    const table = document.createElement("table");
    const keys = Object.keys(rows[0]);
    table.innerHTML = `<thead><tr>${keys.map(k => `<th>${escapeHtml(k)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr>${keys.map(k => `<td>${escapeHtml(String(r[k] ?? ""))}</td>`).join("")}</tr>`).join("")}</tbody>`;
    const wrapper = document.createElement("article");
    wrapper.className = "po-ai__message po-ai__message--assistant";
    wrapper.appendChild(table);
    this.historyEl.appendChild(wrapper);
  }

  setBusy(busy) {
    this.cancelButton.disabled = !busy;
    this.form.querySelector('button[type="submit"]').disabled = busy;
    this.setStatus(busy ? "Procesando..." : "");
  }

  setStatus(text) { this.statusEl.textContent = text; }

  friendlyError(error) {
    if (error?.code === "ASSISTANT_PERMISSION_DENIED") return "No tiene permiso para realizar esa acción.";
    if (error?.code === "ASSISTANT_CANCELLED_OR_TIMEOUT") return "La consulta fue cancelada o tardó demasiado.";
    return error?.message || "Error inesperado.";
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}
