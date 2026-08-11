import { createProvider } from "./assistant-provider.js";
import { PermissionManager } from "./assistant-permissions.js";
import { AuditLogger } from "./assistant-audit.js";
import { ToolRegistry } from "./assistant-tools.js";

export class AIAssistant {
  constructor(config = {}) {
    this.config = {
      timeoutMs: 20000,
      maxHistory: 40,
      ...config
    };
    this.permissions = new PermissionManager(config.user);
    this.audit = new AuditLogger(config.audit);
    this.tools = new ToolRegistry({
      permissions: this.permissions,
      audit: this.audit,
      defaultTimeoutMs: config.toolTimeoutMs || 15000
    });
    this.provider = createProvider(config);
    this.history = [];
    this.activeController = null;
    this.destroyed = false;
  }

  registerTool(definition) { return this.tools.register(definition); }
  setUser(user) { this.permissions.setUser(user); return this; }
  clearConversation() { this.history = []; }
  getHistory() { return this.history.map(x => ({ ...x })); }
  getAuditEntries() { return this.audit.getEntries(); }

  async runTool(name, parameters = {}, options = {}) {
    this.assertAlive();
    return this.tools.execute(name, parameters, options);
  }

  async sendMessage(message, context = {}) {
    this.assertAlive();
    if (!String(message || "").trim()) throw new Error("El mensaje está vacío.");
    this.permissions.assert("assistant:read");

    this.cancel();
    const controller = new AbortController();
    this.activeController = controller;
    const userEntry = { role: "user", content: String(message), timestamp: new Date().toISOString() };
    this.pushHistory(userEntry);

    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await this.provider.sendMessage({
        message: String(message),
        context: {
          ...context,
          history: this.getHistory(),
          user: this.permissions.snapshot()
        },
        tools: this.tools.definitions(),
        signal: controller.signal,
        executeTool: (name, parameters, opts = {}) =>
          this.runTool(name, parameters, { ...opts, question: String(message), signal: controller.signal })
      });

      const normalized = normalizeResponse(response);
      this.pushHistory({ role: "assistant", ...normalized, timestamp: new Date().toISOString() });
      return normalized;
    } catch (error) {
      if (error?.name === "AbortError") {
        const timeout = new Error("La operación fue cancelada o excedió el tiempo permitido.");
        timeout.code = "ASSISTANT_CANCELLED_OR_TIMEOUT";
        throw timeout;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      if (this.activeController === controller) this.activeController = null;
    }
  }

  cancel() {
    this.activeController?.abort();
    this.activeController = null;
  }

  async confirmAction(action) {
    if (!action?.tool) throw new Error("Acción inválida.");
    return this.runTool(action.tool, action.parameters || {}, { confirmed: true });
  }

  async destroy() {
    this.cancel();
    await this.provider?.destroy?.();
    this.tools.tools.clear();
    this.history = [];
    this.destroyed = true;
  }

  pushHistory(entry) {
    this.history.push(entry);
    if (this.history.length > this.config.maxHistory) {
      this.history.splice(0, this.history.length - this.config.maxHistory);
    }
  }

  assertAlive() {
    if (this.destroyed) throw new Error("El asistente fue destruido.");
  }
}

function normalizeResponse(response) {
  if (typeof response === "string") return { type: "text", content: response };
  if (!response || typeof response !== "object") return { type: "text", content: "Sin respuesta." };
  return {
    type: response.type || "text",
    content: response.content ?? "",
    data: response.data,
    meta: response.meta
  };
}

let singleton = null;
export function initializeAIAssistant(config = {}) {
  singleton = new AIAssistant(config);
  return singleton;
}
export function sendAssistantMessage(message, context) {
  if (!singleton) throw new Error("Primero llame initializeAIAssistant(config).");
  return singleton.sendMessage(message, context);
}
export function registerAITool(toolDefinition) {
  if (!singleton) throw new Error("Primero llame initializeAIAssistant(config).");
  return singleton.registerTool(toolDefinition);
}
export function setAssistantUser(user) {
  if (!singleton) throw new Error("Primero llame initializeAIAssistant(config).");
  return singleton.setUser(user);
}
export function clearAssistantConversation() {
  if (!singleton) throw new Error("Primero llame initializeAIAssistant(config).");
  return singleton.clearConversation();
}
export async function destroyAssistant() {
  if (singleton) await singleton.destroy();
  singleton = null;
}
