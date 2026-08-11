function withTimeout(promise, timeoutMs, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    const finish = fn => value => { clearTimeout(timer); fn(value); };
    timer = setTimeout(() => {
      const error = new Error(`La herramienta excedió el timeout de ${timeoutMs} ms.`);
      error.code = "ASSISTANT_TOOL_TIMEOUT";
      reject(error);
    }, timeoutMs);

    if (signal) {
      if (signal.aborted) return finish(reject)(new DOMException("Cancelado", "AbortError"));
      signal.addEventListener("abort", () => finish(reject)(new DOMException("Cancelado", "AbortError")), { once: true });
    }
    Promise.resolve(promise).then(finish(resolve), finish(reject));
  });
}

export class ToolRegistry {
  constructor({ permissions, audit, defaultTimeoutMs = 15000 } = {}) {
    this.permissions = permissions;
    this.audit = audit;
    this.defaultTimeoutMs = defaultTimeoutMs;
    this.tools = new Map();
  }

  register(definition) {
    if (!definition?.name || typeof definition.execute !== "function") {
      throw new Error("Una herramienta requiere name y execute().");
    }
    const normalized = {
      description: "",
      operation: "read",
      permission: "assistant:read",
      requiresConfirmation: definition.operation === "write",
      timeoutMs: this.defaultTimeoutMs,
      ...definition
    };
    this.tools.set(normalized.name, normalized);
    return () => this.tools.delete(normalized.name);
  }

  definitions() {
    return [...this.tools.values()].map(({ execute, ...publicDefinition }) => publicDefinition);
  }

  get(name) { return this.tools.get(name); }

  async execute(name, parameters = {}, options = {}) {
    const tool = this.get(name);
    if (!tool) throw new Error(`Herramienta no registrada: ${name}`);

    this.permissions?.assert(tool.permission);

    if (tool.operation === "write" && tool.requiresConfirmation && !options.confirmed) {
      return {
        confirmationRequired: true,
        action: { tool: name, parameters },
        message: "Esta acción modifica información y requiere confirmación explícita."
      };
    }

    const started = Date.now();
    try {
      const result = await withTimeout(
        tool.execute(parameters, { signal: options.signal, user: this.permissions?.user }),
        tool.timeoutMs,
        options.signal
      );
      await this.audit?.log({
        userId: this.permissions?.user?.id,
        question: options.question,
        tool: name,
        parameters,
        resultSummary: summarize(result),
        operation: tool.operation,
        success: true
      });
      return { data: result, elapsedMs: Date.now() - started };
    } catch (error) {
      await this.audit?.log({
        userId: this.permissions?.user?.id,
        question: options.question,
        tool: name,
        parameters,
        operation: tool.operation,
        success: false,
        error: error.message
      });
      throw error;
    }
  }
}

function summarize(value) {
  if (value == null) return "sin resultado";
  if (Array.isArray(value)) return `${value.length} elemento(s)`;
  if (typeof value === "object") return `objeto con ${Object.keys(value).length} campo(s)`;
  return String(value).slice(0, 160);
}
