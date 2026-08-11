export class AIProvider {
  constructor(config = {}) { this.config = config; }
  async sendMessage() { throw new Error("AIProvider.sendMessage() must be implemented."); }
  async destroy() {}
}

export class LocalProvider extends AIProvider {
  async sendMessage({ message, context = {}, tools = [] }) {
    return {
      type: "text",
      content: `Asistente local activo. Consulta recibida: "${message}".`,
      meta: { provider: "local", context, availableTools: tools.map(t => t.name) }
    };
  }
}

export class OpenAIProvider extends AIProvider {
  async sendMessage(payload) {
    if (typeof this.config.transport !== "function") {
      throw new Error(
        "OpenAIProvider necesita config.transport ejecutado del lado servidor. " +
        "Nunca coloque API keys en JavaScript del navegador."
      );
    }
    return this.config.transport(payload);
  }
}

export class FutureProvider extends AIProvider {
  async sendMessage() {
    throw new Error("FutureProvider es un adaptador reservado para implementación futura.");
  }
}

export function createProvider(config = {}) {
  if (config.providerInstance) return config.providerInstance;
  switch (config.provider || "local") {
    case "local": return new LocalProvider(config);
    case "openai": return new OpenAIProvider(config);
    case "future": return new FutureProvider(config);
    default: throw new Error(`Proveedor desconocido: ${config.provider}`);
  }
}
