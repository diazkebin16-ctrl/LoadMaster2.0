export class AuditLogger {
  constructor({ sink, maxEntries = 500 } = {}) {
    this.sink = sink;
    this.maxEntries = maxEntries;
    this.entries = [];
  }

  async log(entry) {
    const safeEntry = {
      timestamp: new Date().toISOString(),
      userId: entry.userId ?? null,
      question: entry.question ?? null,
      tool: entry.tool ?? null,
      parameters: entry.parameters ?? null,
      resultSummary: entry.resultSummary ?? null,
      operation: entry.operation || "read",
      success: Boolean(entry.success),
      error: entry.error || null
    };
    // Nunca se registra razonamiento privado del modelo.
    this.entries.push(safeEntry);
    if (this.entries.length > this.maxEntries) this.entries.shift();
    if (typeof this.sink === "function") await this.sink(safeEntry);
    return safeEntry;
  }

  getEntries() { return this.entries.map(item => ({ ...item })); }
  clear() { this.entries.length = 0; }
}
