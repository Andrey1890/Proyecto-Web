# Auditoría 2: Dermakor

**Fecha:** 2026-10-05  
**Alcance:** `index.html`, `assets/styles.css`, `js/script.js`, `data/products.json` y recursos de `assets/`.  
**Estándar evaluado:** WCAG 2.2 nivel AA (incluye criterios de nivel A y AA).  
**Método:** inspección estática del HTML, CSS, JavaScript y JSON; comprobaciones en navegador de flujo del carrito, validación de formulario, teclado, reflow entre 320 y 1280 px y espaciado de texto WCAG. No se ejecutó una auditoría completa con axe/Lighthouse ni pruebas con lector de pantalla.

## Resumen ejecutivo

La aplicación muestra el catálogo JSON, conserva el carrito y adapta el layout a móvil, tablet y escritorio. Las verificaciones realizadas muestran reflow sin desbordamiento a 320, 375, 768 y 1280 px, incluso aplicando el espaciado de texto de WCAG. También se observó que los errores del formulario se enlazan mediante `aria-describedby` y `aria-invalid`.

**No se debe considerar una tienda lista para producción:** el carrito no crea pedidos ni procesa pagos; el formulario no envía datos a un servicio; los importes e ilustraciones son demostrativos. Se detectaron dos incumplimientos verificables de WCAG 2.2 AA: contraste insuficiente en el contorno de los campos de formulario en estado normal y animación continua sin control para pausarla.

## Hallazgos prioritarios

### A2-01 — No se puede completar una compra

- **Prioridad:** Bloqueante para ventas reales
- **Criterio relacionado:** funcionalidad y prevención de errores en transacciones (3.3.4, aplicable cuando exista una transacción)
- **Evidencia:** [index.html](index.html#L186), [js/script.js](js/script.js#L374)
- **Problema:** el diálogo permite editar el carrito y presenta subtotal/total, pero no tiene acción de checkout, revisión del pedido, dirección, impuestos/envío calculados, pago ni confirmación del pedido.
- **Impacto:** el usuario puede preparar un carrito, pero no comprar. El total actual equivale al subtotal y excluye explícitamente envío e impuestos.
- **Recomendación:** integrar un backend y una pasarela segura; recalcular precios e inventario en servidor, mostrar gastos antes del compromiso y ofrecer revisión, confirmación y comprobante accesibles.

### A2-02 — El formulario de contacto no envía solicitudes

- **Prioridad:** Alta
- **Criterios relacionados:** 3.3.1, 3.3.3 y 4.1.3
- **Evidencia:** [index.html](index.html#L291), [js/script.js](js/script.js#L452)
- **Problema:** el controlador cancela el envío y, aunque los datos sean válidos, comunica que no se envió la solicitud. No existe endpoint ni almacenamiento de solicitudes.
- **Impacto:** los contactos no llegan al negocio. El aviso es honesto, pero el botón todavía se llama «Enviar solicitud».
- **Recomendación:** conectar un servicio HTTPS y añadir estados accesibles de envío, éxito y error. Mientras no exista destino, cambiar el CTA para que no prometa envío o deshabilitar el flujo.

### A2-03 — Contraste insuficiente en los campos del formulario

- **Prioridad:** Alta, incumplimiento WCAG 2.2 AA
- **Criterio:** 1.4.11 Non-text Contrast
- **Evidencia:** [assets/styles.css](assets/styles.css#L14), [assets/styles.css](assets/styles.css#L561)
- **Problema:** el borde normal usa `--line: #dbe9e9` sobre el fondo del campo `#f7fbfa`; la relación medida es aproximadamente **1.2:1**, inferior al mínimo de **3:1** para la información visual necesaria para identificar componentes de interfaz. El contorno al enfocar es más visible, pero no corrige el estado normal.
- **Recomendación:** oscurecer el borde hasta lograr al menos 3:1 contra el fondo adyacente; verificar también select, textarea, estados de error/deshabilitado y modo de alto contraste.

### A2-04 — Animación decorativa continua sin control de pausa

- **Prioridad:** Alta, incumplimiento WCAG 2.2 nivel A
- **Criterio:** 2.2.2 Pause, Stop, Hide
- **Evidencia:** [assets/styles.css](assets/styles.css#L269), [assets/styles.css](assets/styles.css#L319), [assets/styles.css](assets/styles.css#L737)
- **Problema:** el tubo y una insignia se mueven indefinidamente mientras hay otro contenido en pantalla. `prefers-reduced-motion` reduce el movimiento para quienes configuran esa preferencia, pero no proporciona un control visible de pausa para el resto de usuarios.
- **Recomendación:** eliminar el movimiento continuo o añadir un control accesible de pausar/reanudar. Mantener la regla de movimiento reducido.

### A2-05 — La jerarquía de encabezados es confusa

- **Prioridad:** Media, incumplimiento relacionado con WCAG 2.2 AA
- **Criterio relacionado:** 1.3.1 Info and Relationships; el salto de nivel no constituye automáticamente una infracción si las relaciones se expresan de otra forma.
- **Evidencia:** [index.html](index.html#L63), [index.html](index.html#L111), [index.html](index.html#L125)
- **Problema:** después del `h1` del hero aparecen varios `h3` de las tarjetas de «Nosotros» antes del primer `h2`. Esto puede hacer menos clara la jerarquía anunciada por tecnologías de asistencia.
- **Recomendación:** usar texto no encabezado en tarjetas decorativas o reorganizar los encabezados para que sigan una jerarquía coherente (`h1` → `h2` → `h3`).

### A2-06 — La expresión regular del correo acepta direcciones mal formadas

- **Prioridad:** Media
- **Criterios relacionados:** 3.3.1 Error Identification y 3.3.3 Error Suggestion
- **Evidencia:** [js/script.js](js/script.js#L415), [index.html](index.html#L298)
- **Problema:** la expresión regular permite, entre otros casos, puntos consecutivos en el dominio o en el segmento local. `novalidate` desactiva la validación de envío nativa y esta expresión se convierte en la comprobación efectiva.
- **Impacto:** el usuario puede recibir un mensaje de éxito de validación para un correo que no sea utilizable.
- **Recomendación:** combinar la validación nativa `type="email"` con reglas de negocio razonables y mensajes precisos; no intentar implementar toda la gramática RFC con una regex extensa. Probar entradas válidas e inválidas, incluidos Unicode y dominios internacionales.

### A2-07 — Enlaces legales y contacto no llevan a destinos reales

- **Prioridad:** Alta para publicación
- **Criterio relacionado:** 2.4.4 Link Purpose (In Context) solo respecto al texto genérico «Conocer más». Los enlaces `href="#"` son un defecto funcional, no una infracción automática de este criterio.
- **Evidencia:** [index.html](index.html#L315), [index.html](index.html#L348)
- **Problema:** los enlaces legales apuntan a `#`; WhatsApp utiliza el número identificado como demostrativo. No hay un canal comercial verificado ni políticas que expliquen el tratamiento de datos.
- **Impacto:** los enlaces no cumplen su función y el número puede dirigir al usuario a un destinatario ajeno. La recopilación de datos no está respaldada por una política publicada.
- **Recomendación:** añadir páginas legales reales, verificar el número comercial y enlazar la política de privacidad antes de recopilar información.

### A2-08 — Los artículos guardados que desaparecen del catálogo quedan ocultos en el carrito

- **Prioridad:** Media
- **Criterio relacionado:** integridad funcional; no es un incumplimiento WCAG directo
- **Evidencia:** [js/script.js](js/script.js#L253), [js/script.js](js/script.js#L316)
- **Problema:** `readCart()` restaura IDs sin contrastarlos con el catálogo. Después, `renderCart()` omite IDs desconocidos, pero no los elimina del almacenamiento ni informa al usuario.
- **Impacto:** un carrito antiguo puede conservar datos invisibles y no se puede retirar ese artículo individualmente. El contador y el total no lo reflejan.
- **Recomendación:** al cargar el catálogo, purgar y persistir los IDs inexistentes o presentarlos como artículos discontinuados con una acción accesible para quitarlos.

### A2-09 — La cantidad puede eliminarse o truncarse al editarla

- **Prioridad:** Baja
- **Criterio relacionado:** 3.3.2 Labels or Instructions; usabilidad de control
- **Evidencia:** [js/script.js](js/script.js#L393)
- **Problema:** `Number.parseInt()` convierte `1.5` en `1`; un valor vacío o inválido se interpreta como `NaN` y `updateCartItem()` elimina el artículo. El campo tiene `min` y `step`, pero no se comprueba `validity` ni se explica que un valor inválido se eliminará.
- **Recomendación:** validar `valueAsNumber`/`validity`, anunciar el error y conservar la cantidad anterior; si cero debe significar eliminar, explicitarlo o dejar esa acción al botón «Eliminar».

### A2-10 — Datos e ilustraciones del catálogo son de demostración

- **Prioridad:** Alta antes de producción
- **Criterios relacionados:** exactitud del contenido; accesibilidad 1.1.1 para correspondencia entre imagen y alternativa
- **Evidencia:** [data/products.json](data/products.json#L1), [data/products.json](data/products.json#L5), [index.html](index.html#L143)
- **Problema:** el catálogo avisa que imágenes y precios son referenciales, y las SVG son empaques ilustrativos; no se confirma que nombres, presentaciones, descripciones o importes correspondan a productos Dermaclar comercializados. Los `alt` describen envases genéricos, no necesariamente el producto exacto.
- **Impacto:** el aviso evita presentar precios e imágenes como oficiales, pero los nombres del catálogo todavía podrían interpretarse como reales.
- **Recomendación:** confirmar cada registro con el negocio y la marca, usar fotografías autorizadas o identificar cada ilustración explícitamente como mockup, y describir en `alt` el contenido real de cada recurso.

### A2-11 — El respaldo offline no garantiza una experiencia offline completa

- **Prioridad:** Baja
- **Evidencia:** [js/script.js](js/script.js#L216), [js/script.js](js/script.js#L221)
- **Problema:** IndexedDB conserva el JSON y permite recuperar la lista si falla esa petición, pero no hay Service Worker que almacene y sirva el HTML, CSS, JavaScript y recursos en un arranque sin red. La prueba realizada bloqueó la petición del JSON con la página ya cargada; no simuló una primera visita completamente desconectada.
- **Recomendación:** si se promete uso offline, implementar y probar un Service Worker y una estrategia de caché para el shell y los recursos; si no, describirlo como fallback de catálogo, no como soporte offline completo.

## Matriz WCAG 2.2 A/AA

**Estados:** Cumple por inspección/prueba acotada; Parcial: hay soporte, pero falta resolver o probar parte; No cumple: incumplimiento observado; N/A: la página no contiene el tipo de contenido/función; No verificado: requiere una prueba adicional.

### 1. Perceptible

| Criterio | Estado | Observación |
|---|---|---|
| 1.1.1 Non-text Content | Parcial | Imágenes tienen `alt` y SVG decorativas están ocultas; falta confirmar que alternativas y contenido del mockup representen los productos reales. |
| 1.2.1 Audio-only and Video-only (Prerecorded) | N/A | No hay audio ni video. |
| 1.2.2 Captions (Prerecorded) | N/A | No hay video. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | N/A | No hay multimedia sincronizada. |
| 1.2.4 Captions (Live) | N/A | No hay contenido en vivo. |
| 1.2.5 Audio Description (Prerecorded) | N/A | No hay video. |
| 1.3.1 Info and Relationships | Parcial | La jerarquía salta de `h1` a `h3` en Nosotros; conviene corregirla, pero el salto por sí solo no demuestra una infracción normativa. |
| 1.3.2 Meaningful Sequence | Cumple por inspección | El contenido conserva un orden DOM legible; falta validación con lector de pantalla. |
| 1.3.3 Sensory Characteristics | N/A | No se dan instrucciones que dependan solo de forma, color, tamaño o ubicación. |
| 1.3.4 Orientation | No verificado | Hay diseño responsive; no se probó cada flujo en orientación vertical y horizontal. |
| 1.3.5 Identify Input Purpose | Cumple por inspección | Los campos de nombre, organización, email y teléfono tienen `autocomplete` apropiado. |
| 1.4.1 Use of Color | Cumple por inspección | Errores incluyen texto y `aria-invalid`, no solo color. |
| 1.4.2 Audio Control | N/A | No hay audio automático. |
| 1.4.3 Contrast (Minimum) | Parcial | Se midieron ejemplos de texto por encima de 4.5:1; no se escanearon todos los estados/elementos con herramienta automática. |
| 1.4.4 Resize Text | No verificado | No se hizo prueba visual formal al 200% de zoom. |
| 1.4.5 Images of Text | Cumple por inspección | Nombre, descripción y precio se presentan como texto HTML; las etiquetas dentro de mockups no son el único medio de comunicar la información. |
| 1.4.10 Reflow | Cumple en prueba acotada | No hubo desplazamiento horizontal a 320, 375, 768 ni 1280 px. |
| 1.4.11 Non-text Contrast | No cumple | El borde normal de campos alcanza solo 1.2:1 frente al fondo; mínimo requerido 3:1. |
| 1.4.12 Text Spacing | Cumple en prueba acotada | Se aplicaron los valores del criterio (interlineado, separación de párrafo y espacios entre letras/palabras); no hubo desbordamiento en 320–1280 px. |
| 1.4.13 Content on Hover or Focus | N/A | Hover/foco solo cambia presentación; no revela contenido adicional que deba descartarse o persistir. |

### 2. Operable

| Criterio | Estado | Observación |
|---|---|---|
| 2.1.1 Keyboard | Parcial | Controles son nativos y el modal/menú disponen de teclado; falta recorrer exhaustivamente toda la página solo con teclado. |
| 2.1.2 No Keyboard Trap | Cumple en prueba acotada | El diálogo se cierra con `Escape` y el foco vuelve al botón invocador. |
| 2.1.4 Character Key Shortcuts | N/A | No hay atajos de una sola tecla. |
| 2.2.1 Timing Adjustable | N/A | No hay límites de tiempo ni sesiones temporizadas en la interfaz. |
| 2.2.2 Pause, Stop, Hide | No cumple | Hay movimiento infinito decorativo sin control de pausa; `prefers-reduced-motion` no basta como alternativa para todos. |
| 2.3.1 Three Flashes or Below Threshold | Cumple por inspección | No se observan destellos. |
| 2.4.1 Bypass Blocks | Cumple por inspección | Existe enlace «Saltar al contenido principal». |
| 2.4.2 Page Titled | Cumple por inspección | La página tiene título descriptivo en español. |
| 2.4.3 Focus Order | Parcial | Orden DOM razonable y foco del diálogo restaurado; falta recorrido completo con teclado/AT. |
| 2.4.4 Link Purpose (In Context) | Parcial | «Conocer más» es genérico; los enlaces del pie apuntan a `#`, defecto funcional que no constituye por sí mismo una falla de este criterio. |
| 2.4.5 Multiple Ways | N/A | Es una única página; no hay conjunto de páginas entre las que localizar una página concreta. |
| 2.4.6 Headings and Labels | Parcial | Los títulos y controles describen su función; el orden jerárquico de encabezados falla en la sección Nosotros. |
| 2.4.7 Focus Visible | Cumple por inspección | Hay reglas `:focus-visible` con contorno explícito. |
| 2.4.11 Focus Not Obscured (Minimum) | No verificado | El encabezado sticky y el diálogo requieren recorrido de foco sistemático a distintos scrolls/tamaños. |
| 2.5.1 Pointer Gestures | N/A | No se requieren gestos multipunto o basados en trayectoria. |
| 2.5.2 Pointer Cancellation | Cumple por inspección | Las acciones usan controles estándar activados al soltar/confirmar; no hay handlers de puntero que ejecuten al presionar. |
| 2.5.3 Label in Name | Cumple por inspección | Los controles tienen texto visible o nombre accesible que refleja su función. |
| 2.5.4 Motion Actuation | N/A | No hay acciones activadas por movimiento del dispositivo. |
| 2.5.7 Dragging Movements | N/A | No hay funciones de arrastrar y soltar. |
| 2.5.8 Target Size (Minimum) | Cumple por inspección/prueba | Botones principales y controles medidos tienen objetivos de al menos 44 px; enlaces de navegación superan 24 px. |

### 3. Comprensible

| Criterio | Estado | Observación |
|---|---|---|
| 3.1.1 Language of Page | Cumple por inspección | `html` declara `lang="es"`. |
| 3.1.2 Language of Parts | Cumple por inspección | No hay pasajes completos en otro idioma que requieran cambio de idioma; marcas y siglas son nombres/abreviaturas. |
| 3.2.1 On Focus | Cumple por inspección | Recibir foco no cambia de contexto. |
| 3.2.2 On Input | Cumple por inspección | El filtro actualiza la lista en la misma página; no navega ni envía automáticamente. |
| 3.2.3 Consistent Navigation | N/A | No hay varias páginas que comparar. |
| 3.2.4 Consistent Identification | Cumple por inspección | Botones de agregar y demás controles repetidos mantienen una función consistente. |
| 3.2.6 Consistent Help | N/A | No hay un mecanismo de ayuda repetido entre páginas. |
| 3.3.1 Error Identification | Cumple en prueba acotada | Los campos inválidos se marcan con `aria-invalid` y mensaje asociado. |
| 3.3.2 Labels or Instructions | Cumple por inspección | Campos, filtro y cantidades tienen etiquetas; se indican campos obligatorios. |
| 3.3.3 Error Suggestion | Parcial | Hay mensajes con formato esperado; la regex de email permite formatos mal formados. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | N/A actualmente | No se completa ninguna transacción ni se envían datos; será obligatorio diseñar revisión/confirmación antes de activar compras. |
| 3.3.7 Redundant Entry | N/A | No hay un proceso por pasos que solicite volver a introducir información. |
| 3.3.8 Accessible Authentication (Minimum) | N/A | No existe autenticación. |

### 4. Robusto

| Criterio | Estado | Observación |
|---|---|---|
| 4.1.1 Parsing | No exigible en WCAG 2.2 | Este criterio fue eliminado de WCAG 2.2; se recomienda validar HTML igualmente para compatibilidad. |
| 4.1.2 Name, Role, Value | Cumple por inspección/prueba acotada | Se usan botones, etiquetas, diálogo nativo, `aria-expanded`, `aria-controls` y nombres accesibles. |
| 4.1.3 Status Messages | Cumple por inspección/prueba | Catálogo, carrito y formulario anuncian estados mediante `role="status"`/`aria-live`. |

## Pruebas realizadas

- Catálogo JSON: cinco productos, fecha/moneda y rutas locales válidas.
- Carrito: agregar, cambiar unidades, subtotales/totales, eliminar y restaurar tras recargar.
- Persistencia observada: `localStorage`, `IndexedDB`, `sessionStorage` y cookie.
- Fallback: se bloqueó la petición de `products.json` con la página ya cargada; el catálogo se recuperó desde IndexedDB. No equivale a una prueba de primera visita sin conexión.
- Responsive/reflow: 320, 375, 768, 1024 y 1280 px sin desbordamiento horizontal; el diseño usa una, dos y tres columnas según el ancho.
- Texto ampliado: sin desbordamiento a 320, 375, 768 y 1280 px.
- Formulario: campos vacíos marcan errores asociados y enfocan el primer campo inválido; no se envía la solicitud.
- Diálogo: `Escape` cierra el modal y el foco vuelve al control de apertura.
- Herramientas: `node --check`, parsing JSON y diagnósticos del editor no reportaron errores. No se ejecutó validador HTML, axe, Lighthouse ni pruebas manuales con AT.

## Prioridad recomendada

1. Corregir el borde de campos para lograr contraste mínimo 3:1 y añadir pausa/eliminar la animación continua.
2. Reparar jerarquía de encabezados y endurecer validación de email/cantidad.
3. Conectar backend de contacto y checkout; verificar precios, productos, datos legales y WhatsApp antes de aceptar clientes.
4. Depurar productos discontinuados del carrito y decidir si se requiere soporte offline completo.
5. Ejecutar axe/Lighthouse, validador HTML, zoom 200%, navegación completa con teclado, lector de pantalla y orientación vertical/horizontal.

## Limitaciones

Esta auditoría no es una certificación de conformidad WCAG. Los estados «cumple por inspección» requieren confirmación con tecnologías de asistencia y pruebas de usuario; los importes, ilustraciones y productos del catálogo siguen siendo datos referenciales. La interfaz todavía no procesa pedidos ni envía mensajes.
