Pallet Operations Platform — Prototype v0.49

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

v0.25
- Editor visual: tablas superiores e inferiores se pueden arrastrar directamente sobre el pallet para guardar su posición real.
- Las separaciones ya no se fuerzan a ser uniformes; se permiten tablas juntas o con espacios diferentes.
- Flechas debajo del plano quedan como ajuste fino de 0.5 pulgadas.
- En 4-Way Runner, las tablas inferiores se ajustan automáticamente fuera de las muescas para no dibujar una tabla donde no hay superficie de clavado.
- Vista lateral, superior, inferior y nota de especificación usan las posiciones guardadas.


v0.28
- Editor compacto con selector Arriba / Abajo.
- Arrastre directo + ajuste fino de 1/2 pulgada en ambos lados.
- Evita superposición entre tablas y mantiene las tablas inferiores fuera de muescas 4-Way.
- Material reciclado separado de madera nueva; conserva origen al cortar/convertir.


v0.30
- Firmar descarga acepta varios lotes en un mismo tráiler, cada uno con medida, cantidad y destino independiente.
- Los lotes para desarme/scrap pueden registrarse sin medida fija.
- Tráilers pendientes muestra solo Pendientes y Descargados hoy; el conteo diario se reinicia automáticamente por fecha.
- La tarjeta Descargados hoy abre el historial del día y permite revisar el detalle completo de cada descarga.
- Historial ahora permite cambiar entre Venta de pallets, Compra de madera y Descarga de tráilers.
- Las recepciones de madera nuevas quedan registradas en el historial de compras.

v0.34
- Se agrega base de preferencias por cliente: control de calidad (QC), Heat Treatment (HT) y regla de retorno del tráiler.
- Al crear una orden, QC y HT siguen apagados por defecto; pueden activarse por orden y guardarse como preferencia del cliente.
- Las órdenes con QC/HT muestran la alerta durante Órdenes, Producción/Corte, Fabricación y Carga.
- QC es opcional: no bloquea el flujo. Si se toca “Inspección QC realizada”, se registra fecha y nota; si no se toca, no se fuerza ningún paso.
- Configuración incluye administración básica de preferencias por cliente.
- Inventario agrega una categoría base para plywood / OSB / paneles con espesor, largo, ancho, cantidad, mínimo y costo unitario.
- Desarme reciclado agrega rangos 20–50, 50–80 y 50–120 pulgadas y permite clasificar runners reciclados como 2-Way o 4-Way.
- El material reciclado por rango sigue sin generar desperdicio al procesarse porque su largo exacto es desconocido.
- Los runners reciclados 2-Way y 4-Way quedan diferenciados en inventario para evitar mezclarlos en órdenes recicladas.
- Se restauraron funciones de historial mensual de desperdicio y conteo diario de desarme que podían faltar en la versión anterior.
- La versión sigue siendo modo Administrador; se deja documentada la preparación futura para roles, ocultando precios/costos a perfiles no autorizados cuando se implemente autenticación.

Pendiente para fases posteriores:
- Flujo multiusuario real con inicio de sesión y permisos por rol.
- Flujo completo de chofer/carga/entrega con firmas por etapa.
- Optimizador de corte de madera por órdenes seleccionadas.
- Optimizador global de plywood entre pedidos pendientes.
- Asistente inteligente sobre historial y operación.


v0.34
- Corregido el menú lateral para permitir desplazamiento vertical cuando hay más módulos de los que caben en pantalla.
- El pie del menú permanece visible y la lista de módulos se desplaza de forma independiente.
- Mejorado el desplazamiento táctil en móvil.


v0.34
- Órdenes responsive: vista compacta y tarjetas automáticas en pantallas estrechas, sin desplazamiento horizontal.
- Reacondicionado / reparación ya no solicita tablas, runners ni diseño de fabricación en la orden.
- Nuevas calidades 48×40 A, 48×40 AA y 48×40 B.
- A/AA/B quedan fijas como 48×40, 4-Way y con giro permitido; no solicitan tablas ni runners.
- Especificación simplificada para condiciones que no requieren desglose de madera.

v0.35
- El editor inferior de posiciones ya permite arrastrar tarjetas libremente en móvil y escritorio.
- Soltar una tarjeta en el centro de otra coloca ambas en la misma posición y registra una tabla doble; se muestra indicador ×2/×N.
- Soltar hacia el borde izquierdo o derecho de otra tarjeta la mueve antes o después de esa posición.
- Los botones de ajuste fino mantienen pasos exactos de 1/2 pulgada y ahora caben dentro de cada tarjeta.
- La lista inferior deja de usar desplazamiento horizontal: las tarjetas se acomodan automáticamente en varias filas según el ancho disponible.
- El dibujo superior conserva la protección contra superposición; la edición relajada y el apilado solo se realizan desde las tarjetas inferiores.
- En tablas inferiores 4-Way se sigue respetando la restricción de no colocarlas sobre muescas.


## v0.37
- Nueva Orden: datos generales separados y restaurados: cliente, número de orden, referencia del cliente, fecha de entrega, horario de entrega, tipo de entrega, retorno y nota logística.
- Se conservan QC y HT en el mismo bloque general de la orden.


v0.49
- Asistente IA V1 integrado con carga bajo demanda.
- Herramientas reales de solo lectura para órdenes, inventario, producción y clientes.
- Permisos, auditoría, timeout y cancelación.
- LoadMaster permanece sin cambios.
