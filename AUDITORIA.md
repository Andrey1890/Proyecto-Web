# Auditoria de la pagina web Dermakor

**Fecha:** 2026-09-24  
**Alcance:** `index.html`, `styles.css` y la copia de trabajo en `boceto/`.  
**Tipo:** revision estatica de funcionalidad, accesibilidad, responsive, rendimiento, contenido y confianza comercial.  
**Metodo:** lectura del HTML/CSS y busqueda de formularios, enlaces, scripts, reglas responsive y estados de movimiento. No sustituye una prueba con navegador, Lighthouse ni una validacion de backend.

## Resumen ejecutivo

La pagina tiene una estructura visual solida y una base semantica razonable. Se corrigieron los textos de relleno, las afirmaciones no verificadas, los testimonios ficticios y la navegacion movil. Todavia queda pendiente conectar el formulario, crear las paginas legales y sustituir el enlace de WhatsApp demostrativo, tareas excluidas de esta correccion. `boceto/` quedo sincronizado con la version principal.

Antes de publicar para clientes se debe conectar el contacto a un backend o servicio de formularios, sustituir todos los textos de demostracion por datos verificados y resolver la navegacion movil.

## Hallazgos

### A-01 - El formulario no envia solicitudes

- **Severidad:** Critica
- **Area:** Funcionalidad / conversion
- **Evidencia:** [index.html](index.html#L292)
- **Problema:** El formulario usa `action="#"` y no existe JavaScript ni endpoint. Al pulsar "Enviar solicitud", el navegador vuelve al mismo documento y los datos no llegan a la empresa.
- **Impacto:** Perdida silenciosa de prospectos y falsa sensacion de exito para el usuario.
- **Recomendacion:** Conectar el formulario a un endpoint HTTPS real, Formspree/Netlify Forms u otro servicio aprobado. Agregar estado de envio, error y confirmacion accesible, y evitar prometer proteccion de datos hasta implementar el tratamiento real.

### A-02 - La navegacion principal desaparece en movil sin alternativa

**Estado:** Corregido.

- **Severidad:** Alta
- **Area:** Responsive / usabilidad
- **Evidencia:** [styles.css](styles.css#L583-L584)
- **Problema:** En pantallas de hasta 720 px se ocultan `.main-nav` y `.header-cta`, pero no se ofrece menu, boton de navegacion ni enlace equivalente.
- **Impacto:** El usuario movil pierde el acceso directo a Nosotros, Productos, Beneficios y Contacto desde el encabezado.
- **Recomendacion:** Implementar un menu movil operable con teclado, foco visible, `aria-expanded` y `aria-controls`, o mantener una navegacion compacta visible.

### A-03 - Los datos de contacto son demostrativos

**Estado:** Parcial. Se retiraron los textos "por confirmar" de los bloques informativos, pero el enlace de WhatsApp demostrativo se mantuvo sin cambios por alcance solicitado.

- **Severidad:** Alta
- **Area:** Confianza / negocio
- **Evidencia:** [index.html](index.html#L328-L339), [index.html](index.html#L355-L357)
- **Problema:** Correo, telefono y horario aparecen como "por confirmar"; el enlace de WhatsApp usa el numero `593999999999` y se identifica como demostrativo.
- **Impacto:** El cliente no puede contactar a la empresa y puede interpretar el numero como real.
- **Recomendacion:** Sustituir los placeholders por canales verificados o eliminar temporalmente esas opciones. Validar que el enlace de WhatsApp incluya el numero comercial correcto en formato internacional.

### A-04 - El contenido comercial todavia es provisional o no verificable

**Estado:** Corregido. Se reemplazaron promesas de inventario, resultados, cobertura y entrega por descripciones informativas y condicionadas a consulta.

- **Severidad:** Alta
- **Area:** Contenido / reputacion
- **Evidencia:** [index.html](index.html#L59-L61), [index.html](index.html#L139-L163), [index.html](index.html#L292-L305)
- **Problema:** Se anuncian cobertura nacional, inventario permanente, entrega puntual, resultados visibles, precios de mayoreo y capacitacion, mientras otros textos dicen "por confirmar".
- **Impacto:** Posibles expectativas incorrectas, incumplimiento comercial o publicidad no sustentada.
- **Recomendacion:** Revisar cada promesa con el responsable del negocio. Usar lenguaje de propuesta mientras no haya confirmacion y publicar solo cobertura, inventario, precios y beneficios respaldados.

### A-05 - Testimonios con apariencia de clientes reales, pero texto de relleno

**Estado:** Corregido. La seccion fue reemplazada por informacion de compra sin nombres ni reseñas inventadas.

- **Severidad:** Alta
- **Area:** Confianza / contenido
- **Evidencia:** [index.html](index.html#L247-L275)
- **Problema:** Se muestran nombres de personas y negocios junto a frases como "Aqui puede incorporarse una resena verificada".
- **Impacto:** Puede percibirse como testimonio fabricado o uso no autorizado de identidades comerciales.
- **Recomendacion:** Retirar la seccion hasta contar con autorizaciones y reseñas verificables, o marcarla explicitamente como ejemplo visual sin nombres reales.

### A-06 - Enlaces legales inactivos

- **Severidad:** Media
- **Area:** Cumplimiento / UX
- **Evidencia:** [index.html](index.html#L355-L357)
- **Problema:** Terminos, privacidad y devoluciones apuntan a `#`, por lo que no existe informacion legal consultable.
- **Impacto:** Mala experiencia y riesgo de incumplimiento si se recopilan datos mediante el formulario.
- **Recomendacion:** Crear paginas o documentos legales reales y enlazarlos. Incluir consentimiento y aviso de privacidad junto al formulario cuando corresponda.

### A-07 - La clase visual del encabezado de testimonios no coincide con CSS

**Estado:** Corregido. La nueva seccion usa `class="eyebrow light"` y selectores propios de informacion de compra.

- **Severidad:** Baja
- **Area:** UI / mantenimiento
- **Evidencia:** [index.html](index.html#L247), [styles.css](styles.css#L280-L282)
- **Problema:** El HTML usa `eye-light`, pero la regla CSS esta definida para `.eyebrow.light`. La variante clara no se aplica.
- **Impacto:** El bloque depende de los estilos por defecto y puede perder contraste o consistencia si cambia la paleta.
- **Recomendacion:** Unificar el nombre de clase, preferiblemente usando `class="eyebrow light"`, y validar contraste en el fondo de testimonios.

### A-08 - Dependencia de una imagen externa sin estrategia de reserva

- **Severidad:** Media
- **Area:** Rendimiento / disponibilidad
- **Evidencia:** [index.html](index.html#L109)
- **Problema:** La imagen principal depende de Unsplash durante cada visita y no existe una imagen local alternativa ni manejo de error.
- **Impacto:** El hero puede quedar vacio si el proveedor externo falla, bloquea la peticion o cambia la URL; tambien se agrega una dependencia de rendimiento y privacidad.
- **Recomendacion:** Descargar y optimizar un recurso con licencia verificada dentro del proyecto, usar formatos modernos y conservar un fondo visual util aunque la imagen no cargue.

### A-09 - Los controles del formulario no tienen autocompletado ni estado de resultado

**Estado:** Parcial. Se agregaron atributos `autocomplete`; el estado de envio queda pendiente porque el formulario sigue sin endpoint real.

- **Severidad:** Media
- **Area:** Accesibilidad / conversion
- **Evidencia:** [index.html](index.html#L305-L335)
- **Problema:** Los campos no declaran atributos `autocomplete` utiles y el documento no contiene un contenedor de estado para informar envio correcto o error. Aunque los `label` envuelven los controles y son legibles para tecnologias asistivas, falta una experiencia completa para el ciclo de envio.
- **Impacto:** El llenado es mas lento en movil y una futura integracion puede dejar al usuario sin confirmacion accesible.
- **Recomendacion:** Agregar `autocomplete` (`name`, `organization`, `email`, `tel`), un mensaje con `role="status"` o `aria-live` y estados de exito/error conectados al endpoint real.

### A-10 - Recursos de terceros sin politica explicita de privacidad o carga

- **Severidad:** Media
- **Area:** Privacidad / rendimiento
- **Evidencia:** [index.html](index.html#L8-L9), [index.html](index.html#L109)
- **Problema:** La pagina solicita fuentes a Google Fonts y una imagen a Unsplash. No se declara una politica de privacidad enlazada ni una estrategia de consentimiento o autoalojamiento para esas peticiones.
- **Impacto:** Las visitas generan solicitudes a terceros antes de que el usuario interactue con el formulario; ademas, el renderizado depende de servicios externos.
- **Recomendacion:** Confirmar las obligaciones legales del sitio, enlazar una politica real y valorar autoalojar fuentes e imagen. Mantener una alternativa local para el hero.

### A-11 - La version `boceto/` duplica el problema y puede divergir

**Estado:** Corregido en esta iteracion. `boceto/index.html`, `boceto/styles.css` y `boceto/script.js` fueron sincronizados con la raiz.

- **Severidad:** Baja
- **Area:** Mantenimiento / despliegue
- **Evidencia:** [boceto/index.html](boceto/index.html#L1), [boceto/styles.css](boceto/styles.css#L1)
- **Problema:** `boceto/` contiene una copia casi identica de la pagina principal, incluyendo `action="#"`, enlaces legales a `#`, el numero demostrativo y la navegacion movil oculta.
- **Impacto:** Una correccion aplicada solo a la raiz puede no reflejarse en la version de boceto si esta se comparte o se publica por separado.
- **Recomendacion:** Definir si `boceto/` es solo referencia. Si debe mantenerse, documentar el flujo de sincronizacion o eliminar la duplicacion y usar una unica fuente.

### A-12 - Carga de fuentes externas en la primera vista

- **Severidad:** Baja
- **Area:** Rendimiento / privacidad
- **Evidencia:** [index.html](index.html#L8-L9)
- **Problema:** Google Fonts se consulta desde un tercero y puede retrasar el renderizado o no estar disponible.
- **Impacto:** Cambio de tipografia durante la carga y una peticion adicional a un proveedor externo.
- **Recomendacion:** Medir con Lighthouse. Si el rendimiento o la privacidad lo requieren, autoalojar las fuentes con licencia o definir una estrategia de carga mas controlada.

## Puntos positivos

- Usa `lang="es"`, `meta viewport`, titulo y descripcion.
- Incluye enlace para saltar al contenido y estilos `:focus-visible`.
- Las imagenes tienen `alt`, dimensiones explicitas y `loading="eager"` para el hero.
- La estructura usa `header`, `nav`, `main`, `section`, `article`, `form` y `footer`.
- Incluye `prefers-reduced-motion` para reducir animaciones.
- Los enlaces internos principales apuntan a secciones existentes.
- Los campos obligatorios usan validacion nativa (`required`) y el correo usa `type="email"`.
- La imagen principal incluye texto alternativo y dimensiones explicitas.

## Plan de prioridad

1. Conectar y probar el formulario, incluyendo confirmacion, errores y privacidad.
2. Sustituir el numero de WhatsApp demostrativo y activar las paginas legales.
3. Medir rendimiento y accesibilidad con Lighthouse, especialmente recursos externos e imagen del hero.

## Criterios de cierre

- Una solicitud de prueba llega a un buzón o sistema de tickets real.
- El usuario recibe confirmacion visible y accesible, y un error util si falla el envio.
- No quedan textos "por confirmar", numeros demostrativos ni testimonios sin verificar en produccion.
- El menu funciona en movil y con teclado.
- Los enlaces legales abren contenido real y la politica de privacidad coincide con el procesamiento implementado.
