# Módulo final — Agregar orden

Paquete limpio para reintegrar el flujo **Agregar orden (Paso 1 + Paso 2)** a Pallet Operations.

## Archivos de ejecución

- `index.html` — entrada independiente para probar el módulo.
- `app.js` — lógica completa compatible con Pallet Operations v0.48 y todas las mejoras realizadas en Agregar orden.
- `styles.css` — estilos base requeridos por el flujo.
- `module.js` — lanzador del módulo aislado; útil para pruebas independientes.
- `module.css` — estilos del modo aislado; útil para pruebas independientes.

## Documentación

La carpeta `docs/` contiene el contrato de integración, el resumen funcional y la verificación previa.

## Regla de integración

Al llevar este paquete al proyecto principal, integrar únicamente el flujo **Agregar orden** y sus dependencias necesarias. No sustituir ni eliminar funciones de inventario, producción, fabricación, carga, historial, reportes, LoadMaster u otros módulos salvo que una integración posterior lo requiera explícitamente.

El objeto final de orden debe mantener compatibilidad con el contrato descrito en `docs/INTEGRATION_CONTRACT.md`.

## Estado

Este paquete conserva todas las funciones de la versión verificada. La limpieza realizada es estructural: organización de archivos y documentación, sin eliminar ni simplificar lógica funcional.


## Materiales de tablas/piezas
Cada elemento de `topBoards[]` y `bottomBoards[]` puede incluir `materialType`. Valores base: `Madera`, `Plywood`, `OSB`, `Lámina`, `Plástico`; también admite materiales personalizados. Si falta el campo por compatibilidad con datos antiguos, se interpreta como `Madera`.

## Dimensiones de tablas y materiales

`topBoards[]` y `bottomBoards[]` usan ahora como datos principales:

- `materialType`: Madera, Plywood, OSB, Lámina, Plástico o material personalizado.
- `thickness`: grosor en pulgadas.
- `width`: ancho en pulgadas.
- `length`: largo en pulgadas.
- `qty`: cantidad por pallet.
- `grade`: calidad seleccionada.
- `family`: se conserva automáticamente como `thickness x width` por compatibilidad con código y datos antiguos.

Ejemplo de una pieza OSB:
`{ materialType: "OSB", thickness: 0.5, width: 48, length: 96, family: "0.5x48" }`

En la interfaz de Especificaciones se resume como:
`OSB · 0.5×48×96`

Las plantillas y órdenes antiguas que solo contienen `family: "1x4"` o solamente `width` siguen siendo interpretadas automáticamente.


## Calidades por material
Las calidades personalizadas se almacenan en `settings.customQualitiesByMaterial`. Madera conserva Reciclado/#1/#2/#3/#4. Otros materiales usan `unspecified` (Sin especificar) por defecto y sus propias calidades personalizadas.


## Identidad compartida Orden ↔ Inventario ↔ Conversión
La identidad de un material se basa en `materialType + family(thickness×width) + length + grade + category + origin`.
- Una compra de OSB 0.5×48×96 calidad New se registra como materia prima.
- Una orden que necesite OSB calidad New mantiene esa misma identidad de material/calidad.
- Mientras la materia prima no esté convertida a la medida final, la orden muestra faltante de piezas terminadas.
- La conversión conserva `materialType` y `grade` de la fuente.
- Cuando la salida convertida coincide con material, dimensiones y calidad requeridos, pasa a ser inventario terminado compatible con la orden.


## Condiciones y tipos de producto personalizados
- `settings.customConditions[]` guarda condiciones creadas por el usuario. Cada condición conserva el comportamiento técnico de la condición base seleccionada al crearla.
- `settings.customProductTypes[]` guarda tipos de producto creados por el usuario. Cada tipo conserva las reglas del tipo base seleccionado: `base`, `entry`, `canRotate`, `notched` y `maxHeight`.
- Las opciones integradas permanecen sin cambios.


## Costos por producto
- `fabricationCost`: costo/pago de fabricación por pallet definido en Paso 2.
- `materialCostEstimate`: estimación del costo de material por pallet al guardar la medida.
- La estimación usa primero piezas terminadas exactas; si no existen, busca materia prima compatible por material, calidad y dimensiones.
- Al finalizar fabricación, el costo configurado por producto se usa como costo de mano de obra de ese producto.


## Valor y ganancia
En el resumen de costos de cada medida se muestran:
- Valor: precio de venta por pallet.
- Ganancia por pallet: valor - costo de material - costo de fabricación.
- Ganancia total de la medida: ganancia por pallet × cantidad.
Estos datos quedan derivados de los campos guardados en el producto, preparados para integrarlos posteriormente al historial y reportes semanales/mensuales/totales.


## QC / HT por medida
Cada producto guarda `qcRequired` y `htRequired`.
- Se guardan dentro de la plantilla como valores predeterminados.
- Al aplicar una plantilla se autocompletan.
- Se pueden activar o desactivar para una orden específica sin modificar la plantilla original.
- La orden activa QC/HT globalmente si cualquiera de sus medidas lo requiere.


## Identificación QC / HT en el nombre
El nombre visible de cada medida agrega automáticamente:
- `HT` cuando `htRequired=true` (revisión + estampa HT).
- `QC` cuando `qcRequired=true` y no requiere HT (revisión sin estampa).
- Sin sufijo cuando ninguno aplica.
El sistema elimina sufijos QC/HT anteriores antes de recalcular para evitar duplicados. La plantilla conserva los flags QC/HT como predeterminados y el nombre base separado.


## Nombre visible con condición + QC/HT
El identificador visible ahora se construye como:
`Nombre base + condición + QC/HT`.
Ejemplos: `48×40 4 Way Nuevo HT`, `48×40 4 Way Reciclado QC`.
La condición y el sufijo QC/HT se recalculan para evitar duplicados al editar o reutilizar plantillas.


## Órdenes mixtas: pallets + inventario directo
Paso 2 permite alternar entre:
- `Pallet / crate`: flujo técnico existente.
- `Producto del inventario`: cualquier existencia del catálogo unificado (lumber/materiales, paneles, pallets terminados y pallets de inventario).

La orden guarda `inventoryItems[]` separados de `products[]` para no contaminar la lógica técnica de fabricación de pallets.
Cada línea directa conserva `sourceKind`, `sourceId`, `label`, `qty`, `salePrice` y `unitCostSnapshot`.
Al crear la orden se reserva la cantidad disponible del inventario directo. Al completar la orden se descuenta y se libera su reserva. El historial conserva esas líneas y suma venta/costo directo a los totales.


## Productos adicionales que no existen en inventario
El Paso 2 distingue entre:
- `Seleccionar del inventario`: reserva una existencia real.
- `Agregar producto nuevo / comprar`: crea una línea `sourceKind: "external"` con `procurement: "purchase"` y `purchaseStatus: "pending_purchase"`.

Estas líneas guardan nombre, tipo/material, descripción/medida, cantidad, costo estimado de compra y precio de venta. No reservan ni descuentan inventario hasta que en el futuro se conecten al flujo de compra/recepción. Se mantienen separadas de `products[]` para no contaminar la fabricación de pallets.
`additionalItems[]` es el nombre nuevo del modelo; `inventoryItems[]` se mantiene como copia de compatibilidad al guardar órdenes existentes.


## Producto adicional · Describir producto
La ruta manual ahora captura tipo de producto, medida/descripción, calidad opcional, cantidad, unidad de venta y precio de venta.
No existe un campo de costo de compra en la orden. El costo se resuelve contra Inventario por tipo + medida/descripción + calidad y usa el costo promedio registrado allí. Si todavía no existe coincidencia, el costo queda pendiente.


## QC / HT en productos adicionales
Cada línea adicional guarda `qcRequired` y `htRequired`, tanto al seleccionar del inventario como al describir un producto. Si cualquier producto adicional requiere QC o HT, la orden también queda marcada globalmente con ese requisito.


## Nota opcional por línea
`products[]` y `additionalItems[]` pueden guardar `itemNote`.
La nota pertenece a una medida/producto específico, no a toda la orden. Se usa para instrucciones como flejado por tamaño de pila, pintura, empaque u otras indicaciones del cliente y se muestra en la especificación de la orden.


## Buscadores en selectores
Los selectores extensos usan el componente reutilizable `enhanceSearchableSelects()`.
Se activa mediante `data-search-select` y filtra opciones por texto ignorando mayúsculas, acentos y la diferencia entre `×` y `x`. Las opciones de crear/agregar (`__...__`) permanecen visibles durante la búsqueda.
Se usa en plantillas, productos del inventario, tipos de producto, medidas/materiales de runner, recepción de inventario y fuente de conversión.


## Identidad 2-Way / 4-Way para runners y blocks
`way` forma parte de la identidad de una pieza terminada, independientemente de si el material es nuevo o reciclado.
- Un requisito `2×4×48 · 4-Way` solo se satisface con inventario terminado que también sea `4-Way`.
- Una pieza `2×4×48` sin clasificación no cuenta como lista para un runner 4-Way.
- Runner, Base crate y Block heredan `type.entry` (`2-way` / `4-way`) como requisito estructural.
- Conversión incluye la operación `Convertir 2-Way / 4-Way (notch)`, que conserva material, familia, largo y calidad y crea una pieza terminada con el `way` destino.


## Auto-enlace Producto descrito ↔ Inventario
Una línea descrita conserva identidad estructurada: tipo/material, dimensiones parseadas desde la descripción, calidad, cantidad y unidad.
`describedAdditionalInventoryStatus()` reevalúa la orden contra el inventario actual cada vez que se muestra:
- suma disponibilidad de todas las coincidencias exactas;
- marca `Material listo` únicamente si la cantidad disponible cubre la cantidad requerida;
- calcula costo actual desde el inventario coincidente;
- si el material se agrega al inventario después de crear la orden, no hay que editar la orden: al volver a verla se actualiza automáticamente.


## Definiciones de producto
Los tipos nuevos ya no son nombres sueltos.

### Pallet / Crate estructural
Al crear un tipo nuevo se guardan reglas y valores predeterminados: estructura runner/block/crate, 2-Way/4-Way, giro, notch, máximo por pila, largo/ancho, runner/base, cantidad de runners y tablas arriba/abajo. La definición inicializa el editor técnico sin impedir ajustes por orden.

### Productos adicionales
Cada tipo define un `schema`: `dimensional`, `weight`, `count`, `length` o `custom`, además de unidad predeterminada y si usa calidad.
El mismo schema controla:
1. cómo se describe en una orden;
2. cómo se agrega al inventario;
3. cómo se busca una coincidencia automática.

Los productos no dimensionales viven en `genericInventory[]`; los dimensionales continúan usando `lumber[]` para conservar corte/conversión.


## Campos dinámicos por definición de producto
Cada `productDefinition` guarda `fields[]`. Campos soportados:
`thickness`, `width`, `length`, `weight`, `quality`, `description`, `quantity`, `unit`.

Orden e Inventario generan sus formularios desde la misma lista.
Ejemplo: Aserrín con `fields: ["weight","quality"]` muestra únicamente Peso + Calidad; en Orden se agrega el Precio de venta y en Inventario se agrega Existencia + Costo. Si `weight` existe sin `quantity`, el peso se usa como cantidad requerida para disponibilidad.
La identidad de coincidencia automática se genera dinámicamente a partir de los campos seleccionados.


## Unidades y campos totalmente configurables
`customUnits[]` guarda unidades creadas por el usuario. Todos los selectores de unidad generados por una definición incluyen `+ Añadir nueva unidad…`.

La creación de un producto ya no obliga a escoger combinaciones como “Por peso / bolsa”. Se seleccionan campos individualmente (`fields[]`), sin campos preseleccionados. Por ejemplo:
- Aserrín: `weight + quality`
- OSB: `thickness + width + length + quality + quantity`
- Clavos: `description + quantity`
- Producto especial: cualquier combinación.

La unidad predeterminada es independiente de los campos. Si el usuario necesita una nueva (`ton`, `rollo`, `galón`, etc.), se crea y queda reutilizable en Orden e Inventario.
