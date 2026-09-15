Voy a explorar la carpeta "hola mundo" para ver qué archivos contiene antes de realizar la auditoría.
Ahora voy a leer los tres archivos de la carpeta:
He leído los tres archivos. Ahora voy a compilar el informe completo de auditoría.

---

# Auditoría UX y Accesibilidad — `hola mundo/`

## Resumen

Se auditaron los tres archivos de la carpeta `hola mundo/`: `index.html`, `styles.css` y `script.js`. Se trata de una página estática de perfil deportivo (Lionel Messi) con un diseño visual cuidado, buenas prácticas semánticas y una animación de entrada. Sin embargo, se identificaron problemas significativos de **contraste**, un **código de depuración visible**, la **ausencia de indicadores de foco** y una **dependencia total de un recurso externo** para la imagen principal.

---

## Hallazgos

| ID | Prioridad | Archivo | Evidencia | Impacto | Recomendación |
|----|-----------|---------|-----------|---------|---------------|
| **H01** | **Alta** | `styles.css:71` | `h1, h2 { ... color:red; }` — El color rojo puro (`#ff0000`) en los encabezados es claramente código de depuración que se ha quedado en producción. | Los títulos principales se renderizan en rojo brillante sobre fondo crema, rompiendo la estética y la intención visual del diseño. | Eliminar `color:red;` de la regla de `h1, h2`. Los encabezados heredarán `var(--ink)` (`#17221e`), que tiene excelente contraste (~14.7:1). |
| **H02** | **Alta** | `styles.css:64` | `.eyebrow { color: var(--orange); }` — El naranja `#ff704b` sobre fondo `#f4f0e7` ofrece un contraste de apenas **~2.4:1**. | No cumple WCAG AA (requiere 4.5:1 para texto normal, 3:1 para texto grande). El texto de 0.72 rem–0.75 rem es muy pequeño y de uppercase, lo que empeora la legibilidad. | Oscurecer el color de `.eyebrow`. Sugerencia: `#c4530a` o similar que alcance al menos 4.5:1 sobre el fondo. |
| **H03** | **Alta** | `styles.css:144` | `figcaption { ... color: #fff; background: var(--orange); }` — Blanco sobre naranja `#ff704b` ofrece solo **~2.73:1**. | Texto del pie de foto inaccesible para personas con baja agudeza visual o daltonismo. | Usar un naranja más oscuro de fondo (p. ej. `#b5450a`) o texto oscuro sobre naranja claro. |
| **H04** | **Alta** | `styles.css:83,163` | `.intro { color: var(--muted); }` y `.story-copy { color: var(--muted); }` — `#66746e` sobre `#f4f0e7` ofrece **~4.32:1**. | Apenas por debajo del umbral de WCAG AA para texto normal (4.5:1). El texto `.intro` es de 1.08 rem (normal). `--muted` se usa también en `.facts span` a 0.72 rem, que falla claramente. | Oscurecer `--muted` a al menos `#54605a` (~5.5:1) para cubrir todos los usos, incluido el texto pequeño. |
| **H05** | **Alta** | `styles.css` (global) | No se define ningún estilo de `:focus` o `:focus-visible`. | Los usuarios de teclado no ven indicación visual de dónde está el foco. En esta página no hay enlaces ni controles interactivos, pero los elementos-focusables del navegador (si se añaden en el futuro) quedarían sin indicador. | Añadir al menos: `:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }` |
| **H06** | **Media** | `index.html:42–45` | El `<footer>` está anidado dentro de `<main class="page-shell">`. | Semánticamente incorrecto: `<main>` debe contener solo el contenido principal. El pie de página no es contenido principal. | Mover el `<footer>` fuera de `<main>`, o reemplazar `<footer>` por un `<div>` dentro de `<main>` si se desea mantener el layout. |
| **H07** | **Media** | `index.html:43–44` | Los elementos hijos del footer son `<span>`, no `<p>` ni `<small>`. | Pierde semántica de bloque; los lectores de pantalla no asocian el texto como párrafo de pie de página. | Usar `<p>` o `<small>` en lugar de `<span>` dentro del footer. |
| **H08** | **Media** | `index.html:26` | La imagen se carga desde `https://upload.wikimedia.org/...`. | Si Wikimedia cambia la URL, bloquea el acceso o hay un corte de red, la imagen principal no carga y no hay fallback. | Añadir una imagen local como respaldo, usar `<picture>` con srcset, o al menos añadir un `onerror` que muestre un texto alternativo visible. |
| **H09** | **Media** | `index.html` | No existe enlace de "saltar al contenido" (skip link). | Los usuarios de teclado y lectores de pantalla deben navegar secuencialmente hasta llegar al contenido. Aunque la página es corta, es una práctica fundamental. | Añadir un enlace oculto visualmente pero accesible como primer hijo de `<body>`: `<a href="#player-name" class="skip-link">Saltar al contenido</a>` con estilos apropiados. |
| **H10** | **Media** | `styles.css` (global) | No se define un estilo para `@media (prefers-contrast: more)`. | Los usuarios que solicitan alto contraste en su SO no obtienen una adaptación específica. | Considerar reglas con `@media (prefers-contrast: more)` que refuercen colores y bordes. |
| **H11** | **Baja** | `index.html:9` | El favicon es un SVG inline en data-URI que muestra el número "10". | Es creativo pero el alt-text implícito del favicon no es robusto. No tiene impacto crítico en accesibilidad. | Informativo; sin acción urgente. |
| **H12** | **Baja** | `styles.css:57` | `.hero { min-height: 620px; }` | En pantallas de baja altura (o con zoom del 200%), el hero puede requerir scroll antes de ver el contenido. | Usar `min-height: clamp(400px, 80vh, 620px)` para adaptarse mejor a distintas alturas de viewport. |
| **H13** | **Informativa** | `styles.css:39–41,132–135` | Se respeta `prefers-reduced-motion: reduce` deshabilitando animaciones y transiciones. | ✅ Buena práctica. Los usuarios sensibles al movimiento no reciben animaciones. | Sin cambios necesarios. Mantener esta práctica. |
| **H14** | **Informativa** | `index.html:5` | `<meta name="viewport" content="width=device-width, initial-scale=1">` | ✅ Correcto. No bloquea el zoom. | Sin cambios necesarios. |
| **H15** | **Informativa** | `index.html:2,6,8` | `lang="es"`, meta description, título descriptivo. | ✅ Buenas prácticas SEO y accesibilidad. | Sin cambios necesarios. |
| **H16** | **Informativa** | `script.js` | Script mínimo, autocontenido, sin dependencias, con verificación de null. | ✅ Buen patrón. No contamina el scope global. | Sin cambios necesarios. |

---

## Fortalezas

1. **HTML semántico sólido**: Uso correcto de `<main>`, `<section>`, `<figure>`, `<figcaption>`, `<h1>`, `<h2>`, y atributos `aria-labelledby` y `aria-label` para vincular secciones con sus encabezados.
2. **Idioma declarado**: `<html lang="es">` correctamente establecido.
3. **Meta viewport sin bloqueo de zoom**: Permite a los usuarios hacer zoom, requisito WCAG 1.4.4.
4. **Imagen con atributos `alt`, `width` y `height`**: Buena práctica para accesibilidad y prevención de layout shift.
5. **Respeto a `prefers-reduced-motion`**: Las animaciones de entrada y las transiciones de hover se deshabilitan cuando el usuario solicita reducir el movimiento.
6. **Diseño responsive**: Breakpoint en 700px con layout de una columna, tipografía fluida con `clamp()` y contenedor adaptable.
7. **Script mínimo y seguro**: Auto-ejecutante, sin dependencias externas, con verificación de nulidad.
8. **Favicon creativo inline**: No genera peticiones adicionales al servidor.

---

## Novedades

- **Código de depuración visible** (`color: red` en h1/h2): Este es el hallazgo más inmediato que afecta la presentación. Se recomienda resolverlo antes de cualquier despliegue.
- **Contraste insuficiente en múltiples elementos**: Se detectaron al menos 3 combinaciones de color que no alcanzan WCAG AA (naranja, blanco sobre naranja, y el gris apagado para texto normal).
- **Sin estilos de foco**: Aunque la página actual no tiene controles interactivos explícitos, los elementos nativos del navegador (como enlaces si se añaden) no tendrán indicación de foco visible.

---

## Verificación pendiente

| Criterio | Limitación |
|----------|-----------|
| **Contraste de color (medición automatizada)** | Los valores de contraste indicados son cálculos manuales basados en la fórmula de luminancia relativa WCAG 2.x. No se ejecutó una herramienta de auditoría automatizada (como axe, Lighthouse o Colour Contrast Analyser) sobre la página renderizada. **No se declara conformidad WCAG.** |
| **Lectores de pantalla** | No se realizó prueba con NVDA, VoiceOver o JAWS. Los atributos ARIA están bien estructurados en código, pero su comportamiento real requiere prueba en vivo. |
| **Navegación por teclado completa** | La página es estática sin controles personalizados, pero no se verificó el orden de tabulación en el renderizado real. |
| **Lighthouse / axe-core** | No se ejecutó ningún runner automatizado. Los resultados aquí son de revisión manual de código fuente. |
| **Zoom al 200%** | No se verificó visualmente el comportamiento de la página con zoom del navegador al 200%. |
| **Imagen externa** | No se verificó si la URL de Wikimedia sigue activa en este momento. |

---

## Veredicto

La página tiene una **buena base semántica y de diseño responsive**, con prácticas destacadas como el respeto a `prefers-reduced-motion` y el uso correcto de HTML5. Sin embargo, presenta **problemas críticos de accesibilidad** que impiden su conformidad con WCAG 2.1 nivel AA:

- **3 problemas de contraste** que afectan legibilidad para usuarios con discapacidad visual.
- **1 código de depuración visible** (`color: red`) que rompe la experiencia visual.
- **Ausencia de indicadores de foco** visibles.

**Prioridad de acción inmediata:**
1. Eliminar `color: red;` del CSS (H01).
2. Corregir el contraste de `.eyebrow`, `figcaption` y `.intro`/`.story-copy` (H02–H04).
3. Añadir estilos `:focus-visible` (H05).
4. Corregir la semántica del footer (H06–H07).

Con estas correcciones, la página estaría en una posición sólida para cumplir WCAG 2.1 AA, sujeto a verificación automatizada y con herramientas de lectores de pantalla.
