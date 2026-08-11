const wait = (ms, signal) => new Promise((resolve, reject) => {
  const id = setTimeout(resolve, ms);
  signal?.addEventListener("abort", () => {
    clearTimeout(id);
    reject(new DOMException("Cancelado", "AbortError"));
  }, { once: true });
});

const orders = [
  { id: "ORD-1001", customerId: "C-001", status: "delayed", dueDate: "2026-08-09", priority: "high" },
  { id: "ORD-1002", customerId: "C-002", status: "production", dueDate: "2026-08-13", priority: "normal" },
  { id: "ORD-1003", customerId: "C-001", status: "ready_dispatch", dueDate: "2026-08-12", priority: "high" }
];

const inventory = [
  { id: "MAT-001", description: "2x4 lumber", quantity: 420, minimum: 300, unit: "pcs" },
  { id: "MAT-002", description: "Deck boards", quantity: 80, minimum: 150, unit: "pcs" },
  { id: "MAT-003", description: "Nails", quantity: 9000, minimum: 5000, unit: "pcs" }
];

const production = [
  { id: "PR-01", employeeId: "E-01", orderId: "ORD-1002", pallets: 42, date: "2026-08-11" },
  { id: "PR-02", employeeId: "E-02", orderId: "ORD-1002", pallets: 37, date: "2026-08-11" }
];

export async function mockGetOrders(filters = {}, { signal } = {}) {
  await wait(60, signal);
  return orders.filter(o => !filters.status || o.status === filters.status);
}
export async function mockGetOrderDetails({ orderId }, { signal } = {}) {
  await wait(40, signal);
  return orders.find(o => o.id === orderId) || null;
}
export async function mockSearchInventory(filters = {}, { signal } = {}) {
  await wait(60, signal);
  return inventory.filter(i =>
    (!filters.lowOnly || i.quantity < i.minimum) &&
    (!filters.query || i.description.toLowerCase().includes(filters.query.toLowerCase()))
  );
}
export async function mockGetInventoryItem({ id }, { signal } = {}) {
  await wait(40, signal);
  return inventory.find(i => i.id === id) || null;
}
export async function mockGetProduction(filters = {}, { signal } = {}) {
  await wait(60, signal);
  return production.filter(p => !filters.employeeId || p.employeeId === filters.employeeId);
}
export async function mockGetEmployeeProduction({ employeeId }, ctx = {}) {
  return mockGetProduction({ employeeId }, ctx);
}
export async function mockGetCustomer({ customerId }, { signal } = {}) {
  await wait(30, signal);
  return { id: customerId, name: `Mock Customer ${customerId}`, mock: true };
}
export async function mockGetDispatchStatus({ orderId }, { signal } = {}) {
  await wait(30, signal);
  const order = orders.find(o => o.id === orderId);
  return order ? { orderId, ready: order.status === "ready_dispatch", status: order.status } : null;
}
export async function mockGetMaterialRequirements({ orderId }, { signal } = {}) {
  await wait(30, signal);
  return { orderId, requirements: [{ inventoryId: "MAT-002", required: 120, available: 80 }] };
}
export async function mockGetAuditHistory({ type, id }, { signal } = {}) {
  await wait(30, signal);
  return [{ type, id, event: "mock-history", timestamp: "2026-08-11T12:00:00Z" }];
}
export async function mockFailure() { throw new Error("Error mock solicitado."); }
export async function mockSlow(_, { signal } = {}) { await wait(5000, signal); return { ok: true }; }

export function registerMockTools(register) {
  const tools = [
    ["getOrders", "Consultar órdenes con filtros específicos.", mockGetOrders],
    ["getOrderDetails", "Consultar detalle de una orden.", mockGetOrderDetails],
    ["searchInventory", "Buscar inventario sin descargarlo completo.", mockSearchInventory],
    ["getInventoryItem", "Consultar un artículo de inventario.", mockGetInventoryItem],
    ["getProductionRecords", "Consultar registros de producción.", mockGetProduction],
    ["getEmployeeProduction", "Consultar producción por empleado.", mockGetEmployeeProduction],
    ["getCustomer", "Consultar un cliente.", mockGetCustomer],
    ["getDispatchStatus", "Consultar estado de despacho.", mockGetDispatchStatus],
    ["getMaterialRequirements", "Consultar requerimientos de material.", mockGetMaterialRequirements],
    ["getAuditHistory", "Consultar historial/auditoría.", mockGetAuditHistory]
  ];
  tools.forEach(([name, description, execute]) => register({
    name, description, execute, operation: "read", permission: "assistant:read"
  }));
}
