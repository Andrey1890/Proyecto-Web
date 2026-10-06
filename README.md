# Dermakor · catálogo Dermaclar

Sitio estático en español para consultar productos Dermaclar, buscar por nombre o presentación, administrar un carrito y solicitar una cotización al distribuidor. Los precios son referencias PVP en USD del catálogo proporcionado: no garantizan disponibilidad ni una venta. El envío y los impuestos se confirman directamente con el distribuidor.

## Uso

- **Apertura local:** abre `index.html` en el navegador. La página incluye una copia del catálogo para funcionar cuando `file://` bloquea `fetch()`.
- **Hosting estático:** publica la carpeta completa, manteniendo las rutas. En HTTP/HTTPS el catálogo se carga desde `data/products.json`. No requiere backend, instalación de dependencias ni proceso de compilación.
- Busca productos y filtra por categoría. Agrégalos al carrito, ajusta cantidades o elimínalos.
- Desde el carrito, completa los datos de contacto y entrega, revisa el paso de pago y confirma la solicitud. La acción final abre WhatsApp con una cotización no vinculante para que la revises y decidas si la envías.

## Catálogo

`data/products.json` contiene los 15 productos y sus presentaciones, categorías, descripciones, precios y rutas de imagen. Las 15 fotografías `assets/catalog-*.jpg` son recortes locales de las páginas del catálogo entregado en `Util/`; no se cargan desde servicios externos. Los precios y las presentaciones se deben verificar con el distribuidor antes de publicar o cotizar.

El elemento `#catalog-fallback` de `index.html` duplica el JSON para el modo `file://`. Si cambia el catálogo, actualiza ambas fuentes. La fecha `updatedAt` también se muestra en la página.

## Carrito, cotización y pago

- El importe se calcula en centavos para evitar errores de redondeo. El subtotal/total es provisional y no incluye envío ni impuestos.
- Los campos del carrito validan datos con expresiones regulares y muestran errores asociados accesibles. La búsqueda y el filtro del catálogo se pueden usar por teclado.
- El pago es solo una referencia visual. No ingreses datos reales de tarjeta: el sitio no tiene pasarela, no guarda ni transmite esos campos y no procesa cobros. El mensaje de WhatsApp tampoco los incluye.
- Al elegir solicitar una cotización, el mensaje preparado contiene productos, contacto y dirección ingresados para que la persona lo revise antes de enviarlo. No se envía automáticamente, no confirma un pedido ni reserva productos.
- La consulta de contacto también se prepara en WhatsApp. Los datos solo se comparten si la persona decide enviar el mensaje desde ese servicio.

## Implementación y persistencia

- HTML semántico, CSS responsive y JavaScript sin frameworks.
- `localStorage` conserva cantidades del carrito; `sessionStorage` recuerda la categoría seleccionada.
- IndexedDB guarda una copia local del catálogo para su uso si falla la carga de red. Una cookie registra la fecha de actualización del carrito.
- El acceso a almacenamiento puede estar limitado por las políticas del navegador. Si IndexedDB no está disponible, se informa en consola y la fuente principal sigue siendo el JSON; en `file://` se usa el catálogo integrado.

## Accesibilidad

Incluye enlace para saltar al contenido, navegación adaptable, foco visible, textos alternativos, estados anunciados para catálogo/carrito, errores asociados mediante `aria-describedby` y `aria-invalid`, diálogo nativo y respeto a la preferencia de movimiento reducido.

## Contacto indicado en el catálogo

Distribuidor en Quito: Atahualpa E1-136 y Av. República, edificio La Casa del Futbolista, primer piso, oficina 3. Teléfono y WhatsApp: **099 609 6996**. Redes: **@dermclarquitoecuador** y **@elizabethmerinoecuador**. Confirma con el distribuidor los datos y las condiciones vigentes.

Los catálogos, capturas e instrucciones originales de `Util/` se conservan sin cambios.
