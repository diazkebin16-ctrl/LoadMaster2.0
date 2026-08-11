# Pallet Operations - Asistente IA V1

Módulo **aislado** preparado para integración posterior. No modifica Inventario, Producción, Agregar orden, Clientes, LoadMaster, Despacho, Reportes ni motores existentes.

## Arquitectura

Flujo previsto:

`Usuario -> AssistantUI -> AIAssistant -> ToolRegistry/API Layer -> adaptadores/módulos -> base de datos`

El asistente es un **orquestador**. La lógica real de Inventario, Producción, Despacho y optimizadores debe permanecer en sus módulos. Los motores pesados no se cargan ni arrancan desde este paquete salvo que una herramienta futura los invoque bajo demanda.

## Archivos

- `assistant-ui.js`: chat, historial visual, enviar, procesando, cancelar, errores, nueva conversación y tablas.
- `assistant-core.js`: contexto, ciclo de mensajes, cancelación y contrato público.
- `assistant-provider.js`: `AIProvider`, `LocalProvider`, `OpenAIProvider`, `FutureProvider`.
- `assistant-tools.js`: registro/ejecución controlada de herramientas, timeout y confirmación de escritura.
- `assistant-permissions.js`: permisos limitados al usuario conectado.
- `assistant-audit.js`: auditoría sin razonamiento privado.
- `mock-adapter.js`: mocks separados de la integración real.
- `assistant.css`: estilos independientes.
- `tests.mjs`: 10 pruebas mínimas de la especificación.
- `index.js`: exportaciones.

## Contrato de integración

```js
initializeAIAssistant(config)
sendAssistantMessage(message, context)
registerAITool(toolDefinition)
setAssistantUser(user)
clearAssistantConversation()
destroyAssistant()
```

También puede usarse directamente `new AIAssistant(config)`.

## Configuración básica

```js
import { initializeAIAssistant } from "./assistant-core.js";
import { registerMockTools } from "./mock-adapter.js";

const assistant = initializeAIAssistant({
  provider: "local",
  user: { id: "U-123", permissions: ["assistant:read"] },
  timeoutMs: 20000,
  toolTimeoutMs: 15000,
  audit: {
    sink: async entry => console.log("AUDIT", entry)
  }
});

registerMockTools(tool => assistant.registerTool(tool));
```

## OpenAI u otro proveedor

Las API keys **no deben estar en el navegador**. `OpenAIProvider` espera un `transport` que llame a un endpoint del servidor:

```js
const assistant = initializeAIAssistant({
  provider: "openai",
  transport: async payload => {
    const response = await fetch("/api/ai-assistant", {
      method: "POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify({
        message: payload.message,
        context: payload.context,
        tools: payload.tools
      })
    });
    if (!response.ok) throw new Error("Proveedor IA no disponible");
    return response.json();
  },
  user: currentUser
});
```

El backend es responsable de guardar la API key en variables de entorno, aplicar autenticación y decidir qué llamadas al modelo están permitidas.

## Herramientas

Una herramienta no debe descargar datasets completos si una consulta específica puede resolver la petición.

```js
assistant.registerTool({
  name: "getOrderDetails",
  description: "Obtiene una orden por ID.",
  permission: "orders:read",
  operation: "read",
  execute: async ({ orderId }, { signal, user }) => {
    return ordersApi.getById(orderId, { signal, user });
  }
});
```

Herramientas conceptuales previstas: `getOrders`, `getOrderDetails`, `searchInventory`, `getInventoryItem`, `getProductionRecords`, `getEmployeeProduction`, `getCustomer`, `getDispatchStatus`, `getMaterialRequirements`, `getAuditHistory`.

## Escrituras y confirmación

La V1 es principalmente lectura/análisis. Para una futura escritura:

```js
assistant.registerTool({
  name: "updateOrderPriority",
  operation: "write",
  permission: "orders:write",
  requiresConfirmation: true,
  execute: async ({orderId, priority}) => ordersApi.updatePriority(orderId, priority)
});
```

Una ejecución sin `confirmed:true` devuelve una acción pendiente. La UI de integración debe mostrarla al usuario y solo después llamar `assistant.confirmAction(action)`.

## Auditoría

Registra: usuario, fecha/hora, pregunta, herramienta, parámetros relevantes, resumen de resultado, lectura/escritura y éxito/error. No almacena razonamiento privado del modelo.

## Manejo de errores

- Timeout global para mensajes.
- Timeout por herramienta.
- Cancelación mediante `AbortController`.
- Errores de permisos diferenciados.
- La UI nunca debe quedar en carga infinita: `finally` restablece el estado.
- Si una herramienta devuelve `null` o una lista vacía, la capa de respuesta debe indicarlo; no debe inventar datos.

## Mocks

`mock-adapter.js` contiene datos ficticios y adaptadores mock. No se mezclan con integración real. Sustituirlos por adaptadores a APIs/servicios de Pallet Operations durante la integración posterior.

## Pruebas

Requiere Node.js moderno:

```bash
npm test
```

Cubre:
1. pregunta general;
2. órdenes;
3. inventario;
4. producción;
5. sin resultados;
6. error de herramienta;
7. timeout;
8. contexto;
9. acción sin permiso;
10. confirmación antes de escritura.

## Dependencias

No tiene dependencias npm de runtime. Usa APIs estándar de JavaScript (`AbortController`, módulos ES).

## Integración posterior

No copie lógica de negocio dentro del asistente. Cree adaptadores que llamen a los servicios ya existentes y registre esas funciones como herramientas. LoadMaster y otros optimizadores deben permanecer inactivos hasta que una herramienta específica los requiera.

Antes de integrar, revisar este contrato y mapear permisos, autenticación, estructuras reales de datos y endpoints existentes. Este paquete deliberadamente **no asume** estructuras no proporcionadas.
