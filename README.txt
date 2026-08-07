Pallet Operations — Prototipo funcional v0.7

Cambios principales de esta versión:
- Nuevo módulo "Órdenes" en el menú principal.
- Nueva orden en 2 pasos: datos administrativos + descripción técnica del pallet.
- Número interno automático y número de orden del cliente opcional.
- Plantillas reutilizables por cliente / diseño.
- Inventario de madera separado por largo y calidad #1–#4 (#1 es la mejor).
- El usuario ya no selecciona manualmente 8/10/12/16 ft para la orden.
- Planificador automático de material: compara existencias disponibles, calidad requerida y desperdicio lineal.
- Si el inventario no alcanza, la orden se bloquea antes de reservar material.
- Runners con calidad requerida.
- Parte superior e inferior admiten varios tipos de tabla (1x4 / 1x6), cada uno con cantidad y calidad.
- "Altura máx. inicial" cambió a "Máximo por pila en LoadMaster".
- LoadMaster AI v5.58 permanece integrado y recibe automáticamente medida/cantidad/altura/giro.

IMPORTANTE: el optimizador de corte de v0.7 es un prototipo lineal para validar el flujo y la selección automática desde inventario. La lógica industrial completa de corte y aprovechamiento de remanentes se seguirá refinando por etapas.

Para GitHub Pages: subir TODOS los archivos del ZIP al mismo nivel.
