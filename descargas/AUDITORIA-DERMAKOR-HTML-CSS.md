# Auditoría UX y Accesibilidad — `.auditoria-dermakor-temporal/`

**Archivos auditados:** `index.html`, `styles.css`
**Fecha:** 15 de septiembre de 2026

---

## Resumen

El proyecto es un **boceto de sitio web para Dermakor**, distribuidora de productos Dermaclar. Es una página de aterrizaje single-page con header, hero, secciones de Nosotros, Productos, Beneficios, Testimonios, Contacto y Footer.

La calidad técnica del boceto es **sorprendentemente alta** para un prototipo: el HTML semántico, la accesibilidad básica, el responsive design y el soporte a movimiento reducido están bien ejecutados. Los hallazgos más relevantes se centran en **contenido placeholder** que afecta la experiencia real del usuario, **imágenes externas sin fallback**, y una **navegación móvil oculta sin alternativa visible** (hamburger).

---

## Hallazgos

### H-01 — Navegación principal oculta en móvil sin alternativa
| Campo | Detalle |
|---|---|
| **Prioridad** | Alta |
| **Archivo** | `styles.css` (línea 197), `index.html` (línea 33-39) |
| **Evidencia** | `.main-nav { display: none; }` se aplica por defecto y solo se muestra en `@media (min-width: 768px)`. No existe ningún botón hamburguesa, drawer o menú toggle en el HTML. |
| **Impacto** | En dispositivos móviles (≤767px), la navegación principal es **completamente invisible e inaccesible**. Los usuarios no pueden llegar a las secciones "Nosotros", "Productos", "Beneficios" ni "Contacto" excepto haciendo scroll manual. Esto afecta gravemente la navegación y la usabilidad. |
| **Recomendación** | Agregar un botón hamburguesa visible en móvil que controle un `<nav>` tipo drawer o menú colapsable. Implementar con `<button>` semántico, `aria-expanded`, `aria-controls`, y gestión de foco al abrir/cerrar. |

---

### H-02 — Imagen del hero depende exclusivamente de Unsplash
| Campo | Detalle |
|---|---|
| **Prioridad** | Alta |
| **Archivo** | `index.html` (línea 66) |
| **Evidencia** | `src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?..."` — la imagen se carga desde un servicio externo sin atributo `srcset`, sin `<picture>`, sin imagen de respaldo local ni `loading="lazy"` fallback. |
| **Impacto** | Si la CDN de Unsplash falla, se muestra un ícono de imagen rota sobre un fondo con gradientes. La experiencia visual colapsa. Además, la imagen de Unsplash **no muestra productos Dermaclar reales**, lo cual puede generar confusión de marca. |
| **Recomendación** | Almacenar la imagen localmente como recurso del proyecto. Usar `<picture>` con fallback de color plano o SVG decorativo. Agregar `loading="lazy"` si la imagen no es above-the-fold. |

---

### H-03 — Contenido placeholder / "por confirmar" en múltiples lugares
| Campo | Detalle |
|---|---|
| **Prioridad** | Media |
| **Archivo** | `index.html` (líneas 59, 61, 73, 80, 101, 105, 109, 119, 293, 297, 301, 355-357) |
| **Evidencia** | Textos como "Catálogo por confirmar", "Cobertura por confirmar", "Correo por confirmar", "Teléfono por confirmar", "Horario por confirmar", "Información por confirmar", "disponibilidad y cobertura por confirmar". |
| **Impacto** | Un usuario que llegue al sitio percebirá que el negocio **no está operativo**. Los textos "por confirmar" restan credibilidad y confianza. El hero dice "Catálogo por confirmar" justo al lado del CTA principal. |
| **Recomendación** | Si el sitio va a producción, reemplazar todos los placeholder por información real. Si es solo un boceto interno, agregar un banner visible tipo "Sitio en construcción" o usar un `data-status="draft"` visual para que nobody lo confunda con un sitio live. |

---

### H-04 — Testimonios ficticios sin identificación real
| Campo | Detalle |
|---|---|
| **Prioridad** | Media |
| **Archivo** | `index.html` (líneas 251-280) |
| **Evidencia** | Tres testimonios con nombres y empresas ficticias ("Laura Méndez / Farmacia San Rafael", "David Villanueva / Dermacenter VIP", "Carol Gutiérrez / Emprendimiento Belleza Glow"). Los blockquotes dicen explícitamente: "Aquí puede incorporarse una reseña verificada", "Añade una experiencia real", "Añade una reseña comprobable". |
| **Impacto** | Los testimonios falsos **dañan la confianza** del usuario si se publican tal cual. Si se detectan como falsos, se genera desconfianza hacia toda la marca. Google también penaliza testimonios falsos. |
| **Recomendación** | Eliminar o reemplazar con testimonios reales verificables antes de producción. Mientras tanto, dejarlos claramente marcados como `[PLACEHOLDER]` o eliminar la sección. |

---

### H-05 — Formulario de contacto con `action="#"` (no funcional)
| Campo | Detalle |
|---|---|
| **Prioridad** | Media |
| **Archivo** | `index.html` (línea 305) |
| **Evidencia** | `<form class="contact-form" action="#" method="post">` — el formulario no apunta a ningún endpoint real. |
| **Impacto** | Si el usuario envía el formulario, la página recarga sin hacer nada visible. No hay mensaje de éxito/error, ni validación más allá de `required` nativa del navegador. |
| **Recomendación** | Implementar un servicio de formularios (Formspree, Netlify Forms, etc.) o un handler JS. Agregar validación client-side con mensajes de error accesibles (`aria-live`, `aria-describedby`). |

---

### H-06 — Enlace de WhatsApp apunta a número demostrativo
| Campo | Detalle |
|---|---|
| **Prioridad** | Media |
| **Archivo** | `index.html` (línea 328) |
| **Evidencia** | `href="https://wa.me/593999999999"` — número obviamente falso. El texto dice "Escribir por WhatsApp (número demostrativo)". |
| **Impacto** | Un usuario que haga clic será redirigido a un chat inexistente. Si no se reemplaza antes de producción, genera frustración. |
| **Recomendación** | Reemplazar con el número real o eliminar el enlace en versión draft. |

---

### H-07 — El campo de "Teléfono / WhatsApp" no es requerido
| Campo | Detalle |
|---|---|
| **Prioridad** | Baja |
| **Archivo** | `index.html` (línea 313) |
| **Evidencia** | `<input type="tel" name="telefono" placeholder="+00 000 000 0000">` — no tiene `required`. |
| **Impacto** | Es una decisión UX válida (no forzar teléfono), pero los campos "Nombre", "Empresa" y "Correo" sí son requeridos. La asimetría puede confundir al usuario sobre qué datos son esenciales. |
| **Recomendación** | Considerar si el teléfono es realmente opcional para el proceso de cotización. Si lo es, agregar un texto indicativo "(opcional)" visible, no solo implícito. |

---

### H-08 — SVGs decorativos sin `role="img"` ni `aria-hidden` consistente
| Campo | Detalle |
|---|---|
| **Prioridad** | Baja |
| **Archivo** | `index.html` (líneas 72, 76) |
| **Evidencia** | Los SVGs dentro de `.float-chip` (líneas 72 y 76) **no tienen** `aria-hidden="true"`, a diferencia de todos los demás SVGs decorativos del documento que sí lo tienen. |
| **Impacto** | Un lector de pantalla podría anunciar contenido vacío o irrelevante de estos SVGs. El impacto es bajo porque están acompañados de texto visible. |
| **Recomendación** | Agregar `aria-hidden="true"` a estos SVGs para consistencia. |

---

### H-09 — El `<title>` es genérico y no refleja el contenido completo
| Campo | Detalle |
|---|---|
| **Prioridad** | Informativa |
| **Archivo** | `index.html` (línea 6) |
| **Evidencia** | `<title>Dermakor | Distribuidora de productos Dermaclar</title>` |
| **Impacto** | Es funcional pero no diferencia la página de otras del mismo dominio (en caso de que haya más páginas). Para una single-page no es un problema grave. |
| **Recomendación** | Agregar una palabra clave más descriptiva si se desea SEO local, ej: "Dermakor | Distribuidora Mayorista de Dermaclar en [País]". |

---

### H-10 — Las secciones legales en el footer son enlaces vacíos `href="#"`
| Campo | Detalle |
|---|---|
| **Prioridad** | Baja |
| **Archivo** | `index.html` (líneas 361-363) |
| **Evidencia** | `<a href="#">Términos y condiciones</a>`, `<a href="#">Política de privacidad</a>`, `<a href="#">Política de devoluciones</a>` |
| **Impacto** | Los usuarios esperan ver documentos legales reales. Enlaces rotos generan desconfianza. Además, en jurisdictions con GDPR o leyes de protección de datos, la ausencia de política de privacidad puede tener implicaciones legales. |
| **Recomendación** | Crear las páginas legales correspondientes o eliminar los enlaces en la versión draft. |

---

### H-11 — El footer-contact usa `<span>` donde un `<address>` sería más semántico
| Campo | Detalle |
|---|---|
| **Prioridad** | Informativa |
| **Archivo** | `index.html` (líneas 354-358) |
| **Evidencia** | `<span>Correo por confirmar</span>`, `<span>WhatsApp demostrativo</span>`, `<span>Horario por confirmar</span>` |
| **Impacto** | Es un problema menor de semántica. Los lectores de pantalla no受益 significativamente de `<address>`, pero mejora la estructura del documento. |
| **Recomendación** | Usar `<address>` para información de contacto, o al menos un `<ul>` con `<li>`. |

---

## Fortalezas

1. **HTML semántico de alta calidad:** El documento usa correctamente `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`, `<figure>`, `<figcaption>`, `<blockquote>`. Cada sección tiene un `id` para navegación interna.

2. **Skip link funcional:** La línea 16 (`<a class="skip-link" href="#contenido">Saltar al contenido principal</a>`) con su implementación CSS (líneas 84-99) es un estándar de accesibilidad correctamente implementado. Se muestra con `:focus-visible`.

3. **`lang="es"` correctamente declarado:** El atributo `lang` en el `<html>` permite que los lectores de pantalla utilicen la síntesis de voz en español.

4. **Jerarquía de encabezados impecable:** `h1` → `h2` → `h3` sin saltos. Un solo `h1` en el hero, `h2` para las secciones principales, `h3` para sub-contenido.

5. **Soporte a `prefers-reduced-motion`:** Las líneas 701-710 del CSS desactivan todas las animaciones y transiciones cuando el usuario ha configurado reducción de movimiento en su sistema operativo. Esto cumple WCAG 2.3.3.

6. **Soporte a `prefers-color-scheme: dark`:** Las líneas 36-64 implementan un modo oscuro completo con variables CSS redefinidas. Excelente para accesibilidad visual en ambientes de baja luminosidad.

7. **Indicador de foco visible:** Las líneas 101-106 del CSS definen un `outline: 3px solid var(--sunny)` con `outline-offset: 3px` para elementos con `:focus-visible`. Esto es fundamental para navegación por teclado.

8. **Diseño responsive completo:** Seis breakpoints (480, 481, 768, 1024, 1200px) con mobile-first. La retícula colapsa correctamente. Los botones del hero se apilan en móvil. Las tarjetas de producto cambian de horizontal a vertical.

9. **Labels de formulario correctamente asociados:** Todos los `<input>` están anidados dentro de sus `<label>` correspondientes (líneas 308-325), lo cual garantiza que el label sea clickeable y esté asociado al campo.

10. **Imágenes decorativas con `aria-hidden="true"`:** Todos los SVGs decorativos llevan `aria-hidden="true"` consistentemente (con la excepción mencionada en H-08).

11. **Texto alternativo descriptivo en la imagen principal:** `alt="Productos de cuidado facial sobre una superficie clara"` (línea 66) describe correctamente el contenido de la imagen.

12. **`<meta name="viewport">` correctamente configurado:** La línea 5 asegura que el sitio sea responsive con `width=device-width, initial-scale=1.0` sin deshabilitar el zoom.

13. **CSS custom properties bien organizadas:** La paleta de colores, sombras, radios y fuentes están centralizadas en `:root` (líneas 6-34), facilitando mantenimiento y consistencia visual.

14. **Navegación con `aria-label` descriptivo:** El `<nav>` principal tiene `aria-label="Navegación principal"` (línea 33) y el footer-nav tiene `aria-label="Mapa del sitio"` (línea 346).

15. **Contenido de texto claro y bien redactado:** Los textos del hero, "Nosotros", "Productos" y "Beneficios" comunican la propuesta de valor de forma directa y comprensible.

---

## Novedades

| Aspecto | Observación |
|---|---|
| **Dark mode nativo** | Implementación completa con `prefers-color-scheme: dark` — inusual y bienvenido en un boceto. |
| **`scroll-padding-top` y `scroll-margin-top`** | Los dos están alineados en `88px` para compensar el header sticky al hacer scroll a anclas. Detalle de calidad. |
| **Animación `bob` con `prefers-reduced-motion`** | La animación flotante del tubo en el hero (línea 303) se desactiva correctamente cuando el usuario lo solicita. |
| **`color-scheme: light dark`** | Declarado en `:root` (línea 7), permite que los formularios y scrollbars del navegador se adapten al modo oscuro del sistema. |
| **Favicon SVG inline** | Línea 11: usa un `data:image/svg+xml` como favicon, evitando un archivo externo adicional. Práctica moderna. |
| **`backdrop-filter` en header y testimonios** | Efecto de vidrio esmerilado bien implementado, con fallback transparente si el navegador no lo soporta. |

---

## Verificación pendiente

Las siguientes áreas **no pudieron verificarse** en una auditoría estática sin ejecutar el código:

| Área | Limitación |
|---|---|
| **Contraste real (WCAG 1.4.3 / 1.4.6)** | Los colores calculados (`--teal-ink: #0b2f38` sobre `--cream: #f7fbfa`) parecen tener buen contraste (~13:1), pero no se ejecutó ninguna herramienta automatizada (axe, Lighthouse, Colour Contrast Analyser). **Se requiere verificación con herramienta real.** |
| **Navegación por teclado completa** | No se puede verificar que todas las secciones sean alcanzables con Tab/Shift+Tab, que el skip link funcione correctamente, ni que el foco no quede atrapado en ningún componente. |
| **Lectores de pantalla** | No se verificó con NVDA, JAWS o VoiceOver. No se puede confirmar que el contenido se anuncie correctamente. |
| **Lighthouse / axe-core** | No se ejecutó ninguna herramienta de auditoría automatizada. Los puntajes de accesibilidad, rendimiento y SEO son desconocidos. |
| **WAVE** | No se verificó la estructura de contenido con esta herramienta. |
| **Velocidad de carga** | La imagen de Unsplash de 1000px × 1150px puede pesar varios cientos de KB. Sin métricas reales (Core Web Vitals), no se puede evaluar el impacto. |
| **Cumplimiento WCAG 2.1/2.2** | **No se declara conformidad** porque no se realizaron pruebas automatizadas ni manuales con herramientas certificadas. |

---

## Veredicto

El boceto de `.auditoria-dermakor-temporal/` demuestra una **base técnica sólida y por encima del promedio** para un prototipo. El HTML semántico, la accesibilidad de navegación por teclado (skip link, focus-visible), el responsive design, el soporte a modo oscuro y la consideración de `prefers-reduced-motion` son puntos fuertes que muchos proyectos profesionales omiten.

**Sin embargo, el sitio no está listo para producción** por las siguientes razones:

- **Crítico:** La navegación principal está completamente oculta en móvil sin alternativa.
- **Crítico:** Todos los datos de contacto, catálogo y cobertura son placeholders.
- **Importante:** Los testimonios son ficticios y podrían dañar la credibilidad.
- **Importante:** El formulario y el enlace de WhatsApp no funcionan.

**Recomendación general:** Corregir H-01 (navegación móvil) como prioridad inmediata. Completar la información real antes de cualquier despliegue público. Ejecutar Lighthouse y axe-core para obtener métricas cuantitativas de accesibilidad y rendimiento.

> **Nota de limitación:** Esta auditoría se realizó mediante inspección estática del código fuente. No se ejecutaron herramientas automatizadas (Lighthouse, axe, WAVE), ni pruebas con lectores de pantalla, ni pruebas de navegación por teclado en un navegador real. Los resultados deben complementarse con esas verificaciones antes de declarar conformidad con WCAG 2.1/2.2.
