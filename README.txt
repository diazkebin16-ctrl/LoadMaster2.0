Pallet Operations Platform — Prototype v0.20

Cambios principales de esta versión:
- Se rehizo el módulo visual de especificaciones con planos SVG técnicos más legibles.
- 2-Way Runner y 4-Way Runner ya no comparten la misma geometría: el 2-Way usa runners rectos; el 4-Way muestra muescas laterales.
- Block se mantiene como un único tipo y se representa con bloques y acceso de cuatro lados.
- 2-Way Crate y 4-Way Crate muestran solamente la tarima base; no se dibujan paredes ni plywood todavía.
- Las vistas superior, inferior, frontal y lateral se regeneran desde la secuencia real de tablas.
- Mover una tabla 1×4 o 1×6 cambia inmediatamente su posición en las vistas que corresponden.
- La vista frontal muestra la secuencia de tablas y la vista lateral deja clara la diferencia entre runner recto y runner con muescas.
- Se reforzó el tema global Claro / Oscuro / Automático para que también funcione dentro de las pantallas completas de Nueva orden y Especificación.
- Se añadió selector de tema dentro del encabezado de las pantallas completas, además del selector de la barra principal.
- LoadMaster AI v5.58 continúa recibiendo la preferencia de tema de Pallet Operations.
- El plan de materiales mantiene la regla de calidad exacta y las conversiones continúan siendo manuales/autorizadas.

Prueba sugerida:
1. En la barra superior cambia Tema a Oscuro y abre Órdenes > Nueva orden. Toda la pantalla debe permanecer oscura.
2. Dentro de Nueva orden cambia el tema desde el selector del encabezado y confirma que el cambio se aplica inmediatamente.
3. Crea un 2-Way Runner y revisa la vista lateral: el runner debe verse continuo, sin muescas.
4. Cambia a 4-Way Runner y revisa la vista lateral: deben aparecer las dos muescas de entrada lateral.
5. Reordena tablas 1×4 y 1×6. La vista superior y la vista frontal deben cambiar con el nuevo orden.
6. Prueba Block: debe verse con bloques, no con runners.
7. Prueba 2-Way/4-Way Crate: solo debe mostrarse la base del crate.
8. Guarda la orden y abre Especificación para revisar las cuatro vistas técnicas.

Los datos del prototipo se guardan en localStorage del navegador.


HOTFIX v0.16: restaura el render del Centro de control, elimina una definición duplicada de render() y conserva Configuración/tema oscuro en todas las vistas.


NOVEDADES v0.16:
- Corrige la orientación del plano: en un pallet 48×40 los runners recorren 48 in y las tablas cruzan el ancho de 40 in.
- Vista superior/inferior actualizada con esa geometría y con tablas 1×4/1×6 (o cualquier medida) representadas por su ancho real.
- Selector de tablas dinámico: muestra medidas usadas anteriormente y familias existentes en inventario.
- Opción “Crear nueva medida” para agregar, por ejemplo, 1×5 sin cambiar el código.
- Se elimina “Opciones avanzadas de material alternativo” del formulario de Nueva orden. Las conversiones quedan centralizadas en Conversión de madera.


v0.16: El plan automático ahora muestra siempre el material que sí utilizará del inventario, incluso cuando la orden tiene faltantes. Se separan claramente material asignado, material faltante y conversiones sugeridas.


NOVEDADES v0.17:
- “Material que se utilizará” ahora muestra exclusivamente piezas terminadas requeridas por medida, calidad, cantidad, inventario y faltante.
- Inicio agrega “Piezas pendientes a utilizar”, agrupado entre órdenes que todavía esperan material.
- Producción deja de proponer madera larga o planes de corte: solo controla piezas terminadas listas/faltantes.
- Se corrigió el botón de gráfico/especificación restaurando makeDeckSequence(), que faltaba y provocaba que las vistas SVG no abrieran.
- Se conserva el futuro optimizador como una etapa separada que trabajará únicamente con órdenes seleccionadas; esta versión no decide de qué madera obtener los faltantes.


v0.18: Conversión de madera renovada. Permite cortar largo y convertir sección como operaciones manuales separadas. El usuario define explícitamente cuántas piezas destino salen por cada pieza fuente; el sistema agrega exactamente esa cantidad y no calcula ni registra sobrantes/desperdicio. El corte de largo conserva sección/calidad y crea piezas terminadas; la conversión de sección conserva el largo/calidad.


v0.19: Corte múltiple por pieza madre. Permite añadir varios largos editables en una sola operación, calcula el total usado y el sobrante por pieza, multiplica el desperdicio por la cantidad de piezas fuente y lo guarda en un historial. Conversión muestra además totales mensuales de desperdicio para comparar cada mes. La conversión de sección sigue usando rendimiento manual y no registra sobrantes.

HOTFIX v0.20: corrige pantalla en blanco del Centro de control con datos guardados de versiones anteriores; añade migración desde v0.16-v0.19, aislamiento del cálculo de piezas pendientes y recuperación segura de vistas.
