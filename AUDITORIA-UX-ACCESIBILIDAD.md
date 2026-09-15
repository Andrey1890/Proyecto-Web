# Auditoría UX y Accesibilidad

## Resumen

Se auditó la carpeta `hola mundo/` que contiene una página estática de perfil de Lionel Messi con tres archivos: `index.html`, `styles.css` y `script.js`. La página utiliza HTML semántico, animaciones con `prefers-reduced-motion`, diseño responsive y una imagen externa de Wikimedia Commons. Se identificaron problemas potenciales de contraste de colores y dependencia de recursos externos, junto con fortalezas en estructura semántica y manejo de movimiento.

## Hallazgos

| ID | Prioridad | Archivo | Evidencia | Impacto | Recomendación |
|----|-----------|---------|-----------|---------|---------------|
| H1 | Alta | `styles.css:71` | El color `--orange: #ff704b` se usa para texto (`.eyebrow`, `figcaption`) sobre fondo claro (`--paper: #f4f0e7`). Contraste aparente insuficiente para texto normal (WCAG 1.4.3). | Usuarios con baja visibilidad podrían no leer el texto naranja. | Cambiar a un color con mayor contraste (>= 4.5:1). Alternativa: usar naranja solo para elementos grandes o decorativos. |
| H2 | Alta | `styles.css:3, 63, 97, 163, 172` | El color `--muted: #66746e` se usa para texto secundario (`.intro`, `.facts span`, `.story-copy`, `footer`). Contraste aparente aproximado 4.2:1 sobre fondo claro, por debajo de AA para texto normal. | Texto secundario difícil de leer para personas con discapacidad visual. | Aumentar el valor de luminosidad del color o usar un color más oscuro. Verificar con herramienta de contraste. |
| H3 | Media | `index.html:26` | La imagen proviene de `upload.wikimedia.org` (recurso externo). Si el recurso no carga, se muestra el `alt` correcto, pero la experiencia visual se rompe. | La imagen es central para el diseño; su ausencia afecta la comprensión del perfil. | Considerar alojar la imagen localmente o proporcionar un fallback visual más elaborado. |
| H4 | Media | `styles.css:54` | El layout `.hero` usa `grid-template-columns: minmax(0, .9fr) minmax(300px, 1.1fr)`. En pantallas muy pequeñas (< 300px) podría haber desbordamiento horizontal. | Posible ruptura del layout en dispositivos con pantalla extremadamente estrecha. | Ajustar el `minmax` para permitir colapso completo en pantallas pequeñas. |
| H5 | Baja | `index.html:42-45` | El `<footer>` no tiene contenido interactivo ni enlaces, pero no se ha verificado si es navegable por teclado (no hay enlaces focables). | Si hubiera enlaces, deberían ser accesibles por teclado. | No requiere acción inmediata, pero se recomienda verificar si se agregan enlaces futuros. |
| H6 | Informativa | `styles.css:25-33, 132-135` | Las animaciones `.reveal` y `.portrait` tienen transiciones. Se incluye `@media (prefers-reduced-motion: reduce)` que desactiva animaciones. | Cumple con WCAG 2.3.3 (Animaciones de interfaz). | Mantiene conformidad. No se requiere acción. |
| H7 | Informativa | `index.html:4` | `<meta name="viewport" content="width=device-width, initial-scale=1">` está presente. | Buena práctica para responsive. | No se requiere acción. |
| H8 | Informativa | `index.html:2` | `<html lang="es">` declara el idioma correctamente. | Cumple con WCAG 3.1.1 (Idioma de la página). | No se requiere acción. |
| H9 | Informativa | `index.html:17` | Estructura de encabezados: `<h1>` único, `<h2>` para siguiente sección. Jerarquía correcta. | Cumple con WCAG 1.3.1 (Información y relaciones). | No se requiere acción. |
| H10 | Informativa | `index.html:26` | El atributo `alt` de la imagen es descriptivo: "Lionel Messi durante un partido de fútbol". | Cumple con WCAG 1.1.1 (Contenido no textual). | No se requiere acción. |

## Fortalezas

1. **HTML semántico**: Uso correcto de `<main>`, `<section>`, `<figure>`, `<figcaption>`, `<footer>`. Atributos `aria-labelledby` para asociar encabezados con secciones.
2. **Manejo de movimiento**: Animaciones desactivadas con `prefers-reduced-motion: reduce`, cumpliendo WCAG 2.3.3.
3. **Responsive**: Uso de `clamp()`, `min()`, `@media (max-width: 700px)` para adaptar el diseño a diferentes pantallas.
4. **Jerarquía de encabezados**: Estructura lógica con `<h1>` único y `<h2>` subsiguiente.
5. **Accesibilidad de imagen**: Atributo `alt` descriptivo y `width`/`height` para evitar layout shift.
6. **Metadatos**: `meta description`, `meta viewport`, `lang="es"` correctamente implementados.
7. **Favicon accesible**: SVG inline con contraste adecuado.

## Novedades

- **Animaciones de entrada**: Efecto `.reveal` que aparece al cargar la página.
- **Interacción hover en imagen**: Efecto de escala y sombra en `.portrait` al pasar el mouse.
- **Año dinámico en footer**: `script.js` actualiza el año automáticamente.
- **Diseño con paleta de colores definida**: Variables CSS para tinta, papel, acento, etc.

## Verificación pendiente

1. **Medición de contraste**: Usar herramientas como [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) o [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) para validar H1 y H2.
2. **Pruebas de teclado**: Navegar por la página usando solo Tab, Shift+Tab, Enter y flechas. Verificar que no hay trampas de foco.
3. **Lectores de pantalla**: Probar con NVDA, JAWS o VoiceOver para verificar que el contenido se lee correctamente.
4. **Pruebas en dispositivos reales**: Verificar el responsive en móviles y tabletas.
5. **Validación HTML**: Usar el validador del W3C para detectar errores de marcado.
6. **Lighthouse**: Ejecutar auditoría de Lighthouse en Chrome DevTools para obtener puntuaciones de accesibilidad y rendimiento.

## Veredicto

**No se puede declarar conformidad WCAG completa** sin mediciones automatizadas y pruebas manuales. La página muestra una base sólida en semántica, responsive y manejo de movimiento, pero presenta **riesgos significativos de contraste de colores** (H1, H2) que podrían incumplir WCAG 1.4.3 (Contraste mínimo). Se recomienda:

1. **Corregir los colores de contraste** antes de considerar conformidad.
2. **Ejecutar Lighthouse** y herramientas de contraste para obtener datos objetivos.
3. **Realizar pruebas con usuarios** si es posible.

La dependencia de la imagen externa (H3) no afecta la accesibilidad pero sí la robustez del diseño. En general, la página es funcional y bien estructurada, pero necesita ajustes de color para cumplir estándares de accesibilidad.