# Add Order Module — extracted from Pallet Operations v0.48

Este paquete fue preparado para continuar el trabajo de **Agregar orden** en un chat separado.

## Contenido
- `order-module-source.js`: funciones extraídas del flujo de Nueva orden y sus helpers visuales/materiales inmediatos.
- `styles.css`: estilos de la versión v0.48 como referencia visual para conservar la interfaz.
- `RESUMEN_PARA_NUEVO_CHAT.txt`: especificación funcional acumulada y reglas que deben respetarse.
- `INTEGRATION_CONTRACT.md`: contrato de datos para regresar el módulo al sistema principal.

`order-module-source.js` es una extracción de desarrollo, no una copia del sistema completo. Depende de servicios del host como estado de clientes, plantillas, persistencia, diálogo y guardado final. En el nuevo chat se puede convertir en un pequeño módulo ejecutable independiente manteniendo el contrato de integración.

La fuente original usada para esta extracción fue `Pallet-Operations-Platform-Prototype-v0.48.zip`.
