# Add Order Module v0.48 — CORREGIDO

Este paquete sí es ejecutable con **Live Server**.

## Qué debe aparecer
Al abrir `index.html` con Live Server, el formulario **Nueva orden · Paso 1 de 2** debe abrirse automáticamente a pantalla completa.
Después de completar Paso 1 y pulsar Continuar, aparece **Paso 2 de 2** para productos/pallets.

No se muestra el menú general de Pallet Operations ni los otros módulos. Si cancelas o cierras el formulario, aparece una pantalla simple con el botón **Abrir Agregar orden** para volver a entrar.

## Archivos
- `index.html`: entrada ejecutable independiente.
- `module.js`: arranque automático del flujo de Agregar orden.
- `module.css`: oculta la aplicación general y deja solo este módulo.
- `app.js`: motor v0.48 usado para conservar el comportamiento y las dependencias originales del flujo.
- `styles.css`: estilos originales de v0.48.
- `RESUMEN_PARA_NUEVO_CHAT.txt`: reglas funcionales para continuar trabajando en otro chat.
- `INTEGRATION_CONTRACT.md`: notas para reintegrar el módulo al proyecto principal.

## Importante para el chat nuevo
Trabajar únicamente el flujo **Agregar orden (Paso 1 + Paso 2)**. No rediseñar otros módulos. Mantener compatibilidad con el contrato de integración para que el ZIP final pueda volver a incorporarse a Pallet Operations.
