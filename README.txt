PALLET OPERATIONS — PROTOTIPO FUNCIONAL POR ETAPAS v0.2

Objetivo
Este prototipo no pretende ser la plataforma final. Sirve para probar la arquitectura y, sobre todo, cómo una misma orden se mueve entre módulos.

Qué se puede probar
1. Inventario de madera
   - Recibir madera.
   - Ver existencia, reservado y disponible.
2. Producción / Corte
   - Crear una orden nueva.
   - Reservar madera disponible.
   - Bloquear el corte si no alcanza el inventario.
   - Marcar material listo y enviar aviso a Fabricación.
3. Fabricación
   - Iniciar fabricación.
   - Terminar pallets.
   - Actualizar inventario terminado y mandar la orden a Carga.
4. Carga y despacho
   - Ver tipos de despacho por color.
   - Abrir LoadMaster AI v5.58 integrado.
   - Marcar cargando.
   - Adjuntar una foto opcional (por ejemplo, factura firmada).
   - Registrar firma/nombre.
   - Para recogida del cliente: completar y enviar a Historial.
   - Para envío de fábrica: marcar En tránsito y luego Entregado.
5. Historial
   - Ver pedidos completados.
   - Cambiar el plazo de retención de ejemplo (30/60/90 días).
6. Persistencia
   - Los cambios se guardan en localStorage del navegador.
   - Botón ↺ restablece la demostración.

Cómo abrir
Abra index.html en un navegador moderno. Para que el iframe de LoadMaster funcione de forma más confiable, puede servir la carpeta con un servidor HTTP local, por ejemplo:
python3 -m http.server 8000
Luego abra http://localhost:8000/

Nota
Los datos son ficticios. No modifica sistemas reales ni inventario de fábrica.


v0.3: LoadMaster fue aplanado al directorio principal para evitar errores 404 en GitHub Pages al subir desde teléfono. Abra index.html; el botón LoadMaster usa loadmaster.html.
