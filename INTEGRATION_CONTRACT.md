# Contrato de integración — Agregar orden

El módulo debe entregar al sistema principal un objeto `order` equivalente al de Pallet Operations v0.48.

```js
{
  id,
  clientOrder,
  clientReference,
  customer,
  product,
  qty,
  deliveryDate,
  deliveryTimeFrom,
  deliveryTimeTo,
  due,
  shipping,
  condition,        // condición única o "mixed"
  qcRequired,
  htRequired,
  trailerReturn,
  trailerReturnNote,
  stage: "waiting_material",
  notes,
  products: [],
  palletSpecs: [],
  palletSpec: {},
  palletSku,
  trailerWidth: 96,
  trailerLength: 628,
  loadItems: []
}
```

Cada `products[]` debe conservar como corresponda: `length`, `width`, `qty`, `condition`, `type`, `runnerFamily`, `runners`, `runnerGrade`, `blocks`, `topBoards`, `bottomBoards`, `topSequence`, `bottomSequence`, `salePrice`, `materialOrigin`, `maxHeight`, `canRotate`, nombre/plantilla.

## Servicios que el host deberá proporcionar al reintegrar
- catálogo/lista de clientes y preferencias;
- creación de cliente;
- catálogo de plantillas;
- número interno siguiente;
- persistencia de orden y plantillas;
- inventario solo para información/estimaciones que correspondan;
- notificaciones/toasts;
- abrir/cerrar diálogo.

El módulo no debe depender de vistas de Producción, Fabricación, Carga, Reportes, Historial o LoadMaster para poder editarse de forma aislada.
