Ahora voy a leer todos los archivos HTML, CSS y JS del proyecto para realizar la auditoría completa.
Ahora tengo toda la información necesaria. Voy a compilar el informe de auditoría completo.

---

# Auditoría UX y Accesibilidad

## Resumen

Se auditó el proyecto completo `.` (raíz de CI-CDpractica), conformado por **4 archivos HTML**, **2 archivos CSS** y **1 archivo JavaScript**. El proyecto contiene tres experiencias distintas:

| Página | Archivos | Estado general |
|---|---|---|
| **`hola mundo/`** (Perfil Messi) | `index.html`, `styles.css`, `script.js` | Buena base semántica, problemas de contraste |
| **Raíz `/`** (Dermakor) | `index.html`, `styles.css` | La más completa; excelente semántica y responsive |
| **`formularios 1/`** | `index.html` | Deficiencias graves de accesibilidad |
| **`Trabajo clase/`** | `index.html` (vacío) | Sin contenido auditable |

**Hallazgos críticos totales:** 4 de prioridad Alta, 7 de prioridad Media, 6 de prioridad Baja y 3 Informativos.

---

## Hallazgos

### H01 — Contraste insuficiente en `hola mundo/styles.css` (texto muted)
- **Prioridad:** Alta
- **Archivo:** `hola mundo/styles.css` (líneas 3, 80–86, 163–164, 166–175)
- **Evidencia:** `--muted: #66746e` sobre fondo `--paper: #f4f0e7` genera un ratio de contraste de ~4.34:1. Esto afecta a `.intro`, `.story-copy`, `footer` y `.facts span`.
- **Impacto:** Usuario con baja visibilidad no puede leer párrafo introductorio, texto narrativo, datos del jugador ni pie de página. Falla WCAG 1.4.3 (AA normal text ≥ 4.5:1).
- **Recomendación:** Oscurecer `--muted` a al menos `#556058` o superior para superar 4.5:1. Alternativamente, usar el color `--ink` (#17221e) en bloques de texto continuo.

### H02 — Contraste insuficiente en `hola mundo/styles.css` (texto orange/eyebrow)
- **Prioridad:** Alta
- **Archivo:** `hola mundo/styles.css` (líneas 62–69)
- **Evidencia:** `--orange: #ff704b` sobre fondo `--paper: #f4f0e7` genera un ratio de ~2.44:1. Afecta a todas las etiquetas `.eyebrow`.
- **Impacto:** Las etiquetas descriptivas ("Perfil del futbolista", "El jugador") son ilegibles para usuarios con deficiencias visuales. Falla WCAG 1.4.3.
- **Recomendación:** Usar un naranja más oscuro como `#c7502e` (~4.6:1) o combinar con fondo oscuro.

### H03 — Contraste insuficiente en `hola mundo/styles.css` (figcaption)
- **Prioridad:** Alta
- **Archivo:** `hola mundo/styles.css` (líneas 137–147)
- **Evidencia:** Texto blanco (`#fff`) sobre fondo naranja (`#ff704b`) genera un ratio de ~2.76:1 en texto de 0.78rem.
- **Impacto:** La leyenda de la imagen es ilegible. Falla WCAG 1.4.3.
- **Recomendación:** Oscurecer el fondo del figcaption o usar texto oscuro (#17221e).

### H04 — Etiquetas de formulario no asociadas en `formularios 1/index.html`
- **Prioridad:** Alta
- **Archivo:** `formularios 1/index.html` (líneas 10–63)
- **Evidencia:** Todos los campos usan `<span>` en lugar de `<label>`. No existen atributos `id` en los `<input>` ni `for` en las etiquetas. Ejemplo: `<span>Usuario:</span> <input type="text" name="usuario">`.
- **Impacto:** Tecnologías de asistencia (lectores de pantalla) no pueden asociar etiquetas con campos. Usuarios de voz no pueden activar campos. Falla WCAG 1.3.1, 4.1.2.
- **Recomendación:** Reemplazar `<span>` por `<label for="campo">` y añadir `id` a cada `<input>`. Ejemplo: `<label for="usuario">Usuario:</label><input id="usuario" type="text" ...>`.

### H05 — Foco de teclado sin estilo visible en `hola mundo/`
- **Prioridad:** Media
- **Archivo:** `hola mundo/styles.css`
- **Evidencia:** No se define ningún estilo `:focus` o `:focus-visible` para enlaces, botones o elementos interactivos. No existe skip link.
- **Impacto:** Usuarios que navegan por teclado no pueden identificar el elemento enfocado. Falla WCAG 2.4.7.
- **Recomendación:** Añadir estilos `:focus-visible` con outline visible (ej. `outline: 3px solid var(--acid); outline-offset: 3px;`) y considerar un skip link.

### H06 — HTML duplicado y sin DOCTYPE en `formularios 1/index.html`
- **Prioridad:** Media
- **Archivo:** `formularios 1/index.html` (líneas 1–2)
- **Evidencia:** Doble etiqueta `<html>` (línea 1: `<html>`, línea 2: `<html lang="es">`). Ausencia de `<!DOCTYPE html>`.
- **Impacto:** El navegador puede entrar en modo quirks, causando renderizado inconsistente y problemas de accesibilidad. Falla en validez del documento.
- **Recomendación:** Eliminar la primera `<html>` y añadir `<!DOCTYPE html>` al inicio.

### H07 — Título y viewport ausentes en `formularios 1/index.html`
- **Prioridad:** Media
- **Archivo:** `formularios 1/index.html`
- **Evidencia:** No existe `<title>` en `<head>`. No existe `<meta name="viewport">`.
- **Impacto:** Sin título, la pestaña del navegador no indica el contenido (WCAG 2.4.2). Sin viewport, la página no es responsive y zoom manual está bloqueado en móviles (WCAG 1.4.4).
- **Recomendación:** Añadir `<title>Formularios en HTML</title>` y `<meta name="viewport" content="width=device-width, initial-scale=1">`.

### H08 — Ausencia de elementos `<label>` con `aria-label` en formulario raíz
- **Prioridad:** Media
- **Archivo:** `index.html` (Dermakor, líneas 308–325)
- **Evidencia:** Los `<label>` envuelven los inputs correctamente, lo cual es bueno. Sin embargo, el formulario no tiene un `aria-label` o `aria-labelledby` en el `<form>` para identificar su propósito.
- **Impacto:** Lectores de pantalla no anuncian claramente el propósito del formulario completo. Impacto menor.
- **Recomendación:** Añadir `aria-label="Solicitar catálogo y precios"` al elemento `<form>`.

### H09 — Dependencia de imagen externa sin fallback en `hola mundo/`
- **Prioridad:** Media
- **Archivo:** `hola mundo/index.html` (línea 26)
- **Evidencia:** `<img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Lionel_Messi_2018.jpg" ...>` — imagen alojada en Wikimedia.
- **Impacto:** Si Wikimedia está bloqueado, cae o cambia URL, la imagen no carga y el usuario ve un ícono roto sin alternativa textual visible más allá del alt.
- **Recomendación:** Considerar una imagen local como respaldo o añadir un fondo/degradado en el `figure` que mantenga la composición.

### H10 — Dependencia de Google Fonts en Dermakor
- **Prioridad:** Baja
- **Archivo:** `index.html` (Dermakor, líneas 8–10)
- **Evidencia:** Carga Inter y Poppins desde `fonts.googleapis.com` con `preconnect`.
- **Impacto:** Si Google Fonts no carga (bloqueo corporativo, privacidad), el diseño degrada a `system-ui`. Ya hay fallbacks en CSS (`'Inter', system-ui, ...`), lo cual es correcto.
- **Recomendación:** Aceptarble actualmente. Para mayor resiliencia, considerar self-hosting de fuentes.

### H11 — Animación `bob` infinita en Dermakor sin verificación de reduced-motion
- **Prioridad:** Baja
- **Archivo:** `index.html` (Dermakor, línea 277), `styles.css` (línea 303)
- **Evidencia:** El tubo y el chip inferior usan `animation: bob 5s ease-in-out infinite`. Existe `@media (prefers-reduced-motion: reduce)` en CSS que desactiva todas las animaciones.
- **Impacto:** ✅ Ya mitigado. La regla en líneas 701–709 de `styles.css` usa `animation-duration: .01ms !important`.
- **Recomendación:** Sin cambios necesarios. Buen manejo.

### H12 — Estructura de encabezados incorrecta en `formularios 1/index.html`
- **Prioridad:** Baja
- **Archivo:** `formularios 1/index.html`
- **Evidencia:** Solo existe un `<h1>` sin subtítulos `<h2>` o `<h3>` que organicen el formulario. Los `<span>` no proporcionan estructura semántica.
- **Impacto:** Navegación por encabezados de lectores de pantalla no tiene estructura lógica.
- **Recomendación:** Añadir `<h2>` para secciones del formulario (Datos personales, Preferencias, etc.) o al menos etiquetas `<fieldset>` con `<legend>`.

### H13 — Uso de `<br>` para layout en `formularios 1/index.html`
- **Prioridad:** Baja
- **Archivo:** `formularios 1/index.html` (múltiples líneas)
- **Evidencia:** `<br>` se usa entre cada campo del formulario para crear espaciado vertical.
- **Impacto:** Separación visual sin separación semántica. Los lectores de pantalla leen los saltos de línea innecesariamente.
- **Recomendación:** Usar CSS (`margin`, `gap` en flexbox/grid) para el espaciado. Reemplazar `<br>` por estructura semántica.

### H14 — `<main>` sin `id` de salto en `hola mundo/`
- **Prioridad:** Baja
- **Archivo:** `hola mundo/index.html`
- **Evidencia:** Existe `<main class="page-shell">` pero no tiene `id="contenido"` ni existe un skip link que apunte a él.
- **Impacto:** Usuarios de teclado deben tabular por todo el contenido para llegar al主体.
- **Recomendación:** Añadir `id="contenido"` al `<main>` y un skip link al inicio del `<body>`.

### H15 — Footer usa `<span>` en lugar de elementos semánticos en `hola mundo/`
- **Prioridad:** Informativa
- **Archivo:** `hola mundo/index.html` (líneas 42–45)
- **Evidencia:** `<footer>` contiene dos `<span>` directamente sin contenedor `<div>` ni `<p>`.
- **Impacto:** Menor; el contenido es legible pero la estructura semántica podría mejorar.
- **Recomendación:** Envolver en `<div>` o usar `<p>` para cada línea.

### H16 — `scroll-behavior: smooth` en Dermakor
- **Prioridad:** Informativa
- **Archivo:** `styles.css` (Dermakor, línea 68)
- **Evidencia:** `html { scroll-behavior: smooth; scroll-padding-top: 88px; }`
- **Impacto:** El scroll suave puede causar mareos en algunos usuarios. Ya se maneja con `prefers-reduced-motion: reduce` que establece `scroll-behavior: auto !important` (línea 708).
- **Recomendación:** ✅ Correctamente mitigado.

### H17 — Archivo vacío `Trabajo clase/index.html`
- **Prioridad:** Informativa
- **Archivo:** `Trabajo clase/index.html`
- **Evidencia:** El archivo tiene 0 líneas de contenido.
- **Impacto:** Ninguno en producción; puede generar confusión en el repositorio.
- **Recomendación:** Eliminar el archivo o añadir contenido mínimo si es un placeholder.

### H18 — Figura con rotación decorativa en `hola mundo/`
- **Prioridad:** Informativa
- **Archivo:** `hola mundo/styles.css` (líneas 100–104, 146)
- **Evidencia:** `.portrait { transform: rotate(2deg); }` y `figcaption { transform: rotate(-3deg); }`.
- **Impacto:** La rotación puede dificultar la lectura para usuarios con discapacidades cognitivas. Ya se respeta `prefers-reduced-motion`.
- **Recomendación:** Sin cambios necesarios; es un estilo decorativo aceptable.

---

## Fortalezas

### `hola mundo/`
1. **HTML semántico sólido:** Uso correcto de `<main>`, `<section>`, `<figure>`, `<figcaption>`, `<h1>`–`<h2>` con jerarquía correcta.
2. **`lang="es"`** correctamente declarado.
3. **Imagen con `alt` descriptivo y dimensiones explícitas** (`width="900" height="1125"`) — ayuda al rendering y CLS.
4. **`prefers-reduced-motion` respetado** tanto para animaciones de entrada como hover.
5. **Responsive** con breakpoint en 700px y uso de `clamp()`.
6. **Favicon inline SVG** — no depende de archivo externo.
7. **Meta description** presente y descriptiva.

### Dermakor (`/` raíz)
1. **Semántica excelente:** `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<figure>`, `<blockquote>`, `<cite>` implícito.
2. **Skip link** funcional con `:focus-visible`.
3. **Navegación con `aria-label`** claros ("Navegación principal", "Mapa del sitio").
4. **Indicador de foco personalizado** con `:focus-visible` en enlaces y botones.
5. **Clase `.visually-hidden`** correctamente implementada para contenido solo-leído-por-pantalla.
6. **Jerarquía de encabezados** impecable: `h1` → `h2` → `h3` en todas las secciones.
7. **Soporte dark mode** con `prefers-color-scheme: dark`.
8. **`prefers-reduced-motion`** comprehensivo: desactiva animaciones, transiciones y scroll suave.
9. **Responsivo multicapa:** breakpoints en 480, 481, 768, 1024, 1200 px.
10. **Formulario con `<label>`** correctamente asociado y atributos `required`.
11. **Imágenes con `alt` descriptivo** y decorativas con `aria-hidden="true"`.
12. **`scroll-padding-top`** compensa el header sticky correctamente.

### `formularios 1/`
1. Uso de tipos de input semanticamente correctos (`email`, `tel`, `number`, `date`, `color`, `radio`, `range`, `file`).

---

## Novedades

| Elemento | Detalle |
|---|---|
| **Favicon SVG data URI** | Ambas páginas principales usan inline SVG como favicon, eliminando dependencia de archivo externo. |
| **`prefers-color-scheme`** | Dermakor implementa dark mode completo con variables CSS. |
| **Animaciones con reduced-motion** | Ambos CSS respetan `prefers-reduced-motion: reduce`. Dermakor es más agresivo (desactiva todo con `!important`). |
| **`clamp()` para tipografía fluida** | Tanto `hola mundo/` como Dermakor usan `clamp()` para escalar fuentes responsivamente. |
| **`color-scheme: light dark`** | Dermakor declara `color-scheme` en `:root` para alertar al navegador sobre soporte de dark mode. |

---

## Verificación pendiente

| Verificación | Motivo |
|---|---|
| **Contraste real con herramienta** | Los ratios calculados son estimaciones manuales. Se recomienda validar con [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) o axe DevTools. |
| **Tests automatizados WCAG** | No se ejecutó ninguna herramienta automatizada (axe, Lighthouse, WAVE). Los hallazgos son de revisión manual. |
| **Navegación por teclado completa** | No se pudo ejecutar navegación en vivo. Se recomienda tabular toda la página y verificar foco visible, orden lógico y activación por Enter/Espacio. |
| **Lectores de pantalla** | No se probó con NVDA, VoiceOver o JAWS. Se recomienda verificar anuncio de role, estado y label. |
| **Zoom al 200%** | No se verificó que el layout no se rompa al duplicar el tamaño de fuente del navegador. |
| **Formularios: envío real** | No se probó comportamiento de validación nativa ni mensajes de error. |
| **Rendimiento de carga** | No se midió CLS, LCP o FID. La imagen externa de Wikimedia puede generar layout shift. |

---

## Veredicto

### `hola mundo/` — ⚠️ Mejorable
**Puntuación aproximada: 65/100**

La base semántica y la estructura son buenas. Sin embargo, **los problemas de contraste en tres elementos clave (muted text, eyebrow orange y figcaption)** representan barreras reales para usuarios con baja visibilidad. Estos son issues de WCAG Nivel AA que deben resolverse antes de declarar conformidad. La ausencia de estilos de foco y skip link también penaliza la navegación por teclado.

**Acciones prioritarias:**
1. Corregir contraste de `--muted`, `--orange` y `figcaption` (H01, H02, H03)
2. Añadir estilos `:focus-visible` y skip link (H05, H14)

### Dermakor (`/` raíz) — ✅ Buen estado
**Puntuación aproximada: 88/100**

Es la página más completa y accesible del proyecto. Semántica, ARIA, responsive, dark mode, reduced motion y formulario con labels correctamente asociados. Los pendientes son menores: auto-identificación del formulario con `aria-label` y decisiones sobre dependencias externas (fonts, imagen).

### `formularios 1/` — ❌ Requiere correcciones críticas
**Puntuación aproximada: 25/100**

El formulario es una Demo educativa pero tiene **barreras graves de accesibilidad**: sin `<label>` asociado, sin `<!DOCTYPE>`, sin `<title>`, sin viewport, HTML duplicado y layout por `<br>`. Un usuario dependiente de tecnologías de asistencia no podría completar este formulario.

### Limitaciones de esta auditoría
- **No se ejecutaron herramientas automatizadas** (Lighthouse, axe, WAVE). Los ratios de contraste son cálculos manuales aproximados. Se recomienda validar con herramientas.
- **No se probó en dispositivo móvil real** ni con lectores de pantalla.
- **No se verificó conformidad WCAG 2.1/2.2** completa; la revisión cubrió los criterios más relevantes de Nivel AA de forma manual.
- **El archivo `Trabajo clase/index.html` está vacío** y no fue auditado.
