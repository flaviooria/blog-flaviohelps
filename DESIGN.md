---
name: flaviooria · blog
description: Una bitácora técnica escrita dentro de una sesión de terminal, en Dracula (oscuro) y Alucard (claro).
colors:
  night-canvas: "#282a36"
  night-well: "#21222c"
  night-abyss: "#191a21"
  night-rule: "#44475a"
  moon-ink: "#f8f8f2"
  dusk-ink: "#a4a9c5"
  comment-slate: "#8390c0"
  dracula-violet: "#bd93f9"
  cursor-pink: "#ff79c6"
  link-cyan: "#8be9fd"
  signal-green: "#50fa7b"
  ember-orange: "#ffb86c"
  lamp-yellow: "#f1fa8c"
  alarm-red: "#ff5555"
  paper-canvas: "#fffbeb"
  paper-well: "#f5f0dc"
  paper-abyss: "#ece6cc"
  paper-rule: "#cfcfde"
  paper-ink: "#1f1f1f"
  paper-dusk-ink: "#4f4b3c"
  paper-comment: "#6c664b"
  alucard-violet: "#644ac9"
  alucard-pink: "#a3144d"
  alucard-cyan: "#036a96"
  alucard-green: "#14710a"
  alucard-orange: "#a34d14"
  alucard-yellow: "#846e15"
  alucard-red: "#cb3a2a"
typography:
  display:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2rem, 5.5vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label-xs:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.4
  label-sm:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.4
  label-md:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "calt"
rounded:
  focus: "3px"
  inline: "4px"
  control: "5px"
  block: "8px"
  tile: "14px"
  pill: "999px"
spacing:
  chip-gap: "0.4rem"
  grid-gap: "1rem"
  tile-pad: "1.35rem 1.4rem"
  tile-pad-hero: "2rem"
  section: "3rem"
  gutter: "clamp(1.25rem, 5vw, 4rem)"
  column: "50rem"
  column-wide: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.dracula-violet}"
    textColor: "{colors.night-canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.block}"
    padding: "0.55rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.cursor-pink}"
    textColor: "{colors.night-canvas}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.moon-ink}"
    rounded: "{rounded.block}"
    padding: "0.55rem 1rem"
  tool-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.dusk-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.25rem 0.6rem"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.link-cyan}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.65rem"
  chip-hover:
    textColor: "{colors.cursor-pink}"
  tile:
    backgroundColor: "{colors.night-well}"
    textColor: "{colors.moon-ink}"
    rounded: "{rounded.tile}"
    padding: "{spacing.tile-pad}"
  code-block:
    backgroundColor: "{colors.night-abyss}"
    textColor: "{colors.moon-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.block}"
    padding: "1rem 1.1rem"
  inline-code:
    backgroundColor: "{colors.night-well}"
    textColor: "{colors.signal-green}"
    rounded: "{rounded.inline}"
    padding: "0.12em 0.4em"
  search-dialog:
    backgroundColor: "{colors.night-well}"
    textColor: "{colors.moon-ink}"
    rounded: "{rounded.tile}"
    width: "min(40rem, 100% - 2rem)"
---

# Design System: flaviooria · blog

## Overview

**Creative North Star: "La bitácora en la shell"**

El sitio es un cuaderno de lab escrito dentro de una sesión de terminal. La bitácora pone el contenido: pasos, decisiones, avisos, checklists y el resultado final. La shell pone el marco: la ruta `~/blog $` como cabecera, los comentarios `// sección` como rótulos y `#` / `##` delante de cada título. Quien lee un post sigue una sesión ajena, paso a paso, con su propia terminal abierta al lado.

El carácter es **nocturno, preciso y cercano**. Nocturno porque Dracula es el tema por defecto y Alucard su versión de día, no un modo secundario. Preciso porque todo vive en una columna de lectura de 50rem, con bordes de 1px y fondos escalonados en vez de sombras. Cercano porque la voz es de primera persona y la estética de terminal es un guiño de oficio, no un disfraz: nada de efectos CRT ni de texto fosforito, y legibilidad ante todo en los dos temas.

La densidad es baja en los posts (Read) y media en "Sobre mí", donde una rejilla bento reúne perfil, stack, números y proyectos. Nada de esto debe parecer una plantilla SaaS.

**Key Characteristics:**

- Dos temas de primera clase: Dracula (oscuro, por defecto) y Alucard (claro). Siguen al sistema y se pueden cambiar a mano.
- Dos familias: IBM Plex Sans para leer y Fira Code para todo lo que la shell "dice" (rutas, kickers, fechas, chips, código).
- Profundidad por fondos escalonados (canvas → well → abyss) y bordes de 1px, no por sombras.
- Los acentos de Dracula tienen cada uno un papel fijo; ninguno se usa como decoración.
- Controles discretos, como los de una herramienta: el color aparece al pasar el ratón o al enfocar.

## Colors

Una paleta Dracula disciplinada: un lienzo nocturno casi neutro y siete acentos, cada uno con un único papel semántico. Alucard replica los mismos papeles con tintas oscuras sobre papel crema.

### Primary

- **Dracula Violet** (oscuro `dracula-violet` / claro `alucard-violet`): la voz de la marca. Títulos `#` de los posts, títulos de las tarjetas de post, el único botón relleno de la pantalla, el borde de hover de tarjetas y controles, los iconos de los temas y el acento de los callouts de nota.

### Secondary

- **Cursor Pink** (`cursor-pink` / `alucard-pink`): el color de "estás aquí". Contorno de foco, hover de enlaces y títulos, sección activa del índice, resultado seleccionado del buscador, viñetas de lista y el cursor del input de búsqueda.
- **Link Cyan** (`link-cyan` / `alucard-cyan`): enlaces en reposo, cabeceras de tabla, chips enlazados, etiquetas de los posts y las etiquetas `dt` del stack.

### Tertiary

- **Signal Green** (`signal-green` / `alucard-green`): la salida de la shell. Código inline, la parte "~/blog" de los prompts, la marca de la barra, cifras de "Sobre mí" y estados OK (botón "copiado", badges `ok`).
- **Ember Orange** (`ember-orange` / `alucard-orange`): énfasis `strong` en los posts, callouts de aviso, badges `partial` y la segunda cifra destacada.
- **Lamp Yellow** (`lamp-yellow` / `alucard-yellow`): `em`, cadenas en el código y la etiqueta de lenguaje de los proyectos.
- **Alarm Red** (`alarm-red` / `alucard-red`): solo líneas borradas en diffs y errores.

### Neutral

- **Night Canvas / Paper Canvas** (`night-canvas` / `paper-canvas`): el fondo de la página.
- **Night Well / Paper Well** (`night-well` / `paper-well`): superficies un nivel por debajo: tiles, código inline, cabeceras de bloque de código y de tabla, el buscador.
- **Night Abyss / Paper Abyss** (`night-abyss` / `paper-abyss`): el nivel más hundido: cuerpo de los bloques de código, índice lateral, tile de presentación, pie del buscador.
- **Night Rule / Paper Rule** (`night-rule` / `paper-rule`): todos los bordes y separadores (sólidos o discontinuos) y la selección de texto.
- **Moon Ink / Paper Ink** (`moon-ink` / `paper-ink`): texto principal.
- **Dusk Ink** (`dusk-ink` / `paper-dusk-ink`): texto secundario: entradillas, resúmenes, enlaces de navegación en reposo.
- **Comment Slate** (`comment-slate` / `paper-comment`): la voz de los comentarios: kickers `// …`, fechas, rutas, prefijos `#`, pie de página.

### Named Rules

**The One Role Rule.** Cada acento significa una sola cosa (violeta = marca, rosa = foco/estado activo, cian = enlace, verde = salida de la shell, naranja = énfasis/aviso, amarillo = cadena, rojo = error). Si un elemento nuevo no encaja en uno de esos papeles, va en tinta neutra.

**The Tokens-Only Rule.** Ningún hex fuera de `:root`. Los fondos tintados se mezclan desde los tokens (`color-mix(in srgb, var(--purple) 9%, var(--bg))`). Un token nuevo se define en los tres sitios: `:root`, `@media (prefers-color-scheme: light)` y `:root[data-theme="light"]`.

**The Readable Both Ways Rule.** El texto se tiene que leer bien en Dracula y en Alucard por igual: al menos 4.5:1 para texto normal. Por eso Comment Slate es más claro que el comentario original de Dracula (#6272a4, que daba 3.0:1): da 4.55:1 sobre Night Canvas, 5.05:1 sobre Night Well y 5.55:1 sobre Night Abyss, y sigue un escalón por debajo de Dusk Ink. Cualquier tinta o fondo nuevo se comprueba contra los tres fondos de cada tema.

## Typography

**Display Font:** IBM Plex Sans (con system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Body Font:** IBM Plex Sans
**Label/Mono Font:** Fira Code (con ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)

**Character:** Plex Sans es una grotesca de ingeniería, sobria y legible en párrafos largos. Fira Code pone la voz de la máquina: todo lo que la shell imprimiría va en mono, y todo lo que escribe la persona va en sans. Se cargan desde Google Fonts (Plex 400–700 con cursiva en 400; Fira 400–600).

### Hierarchy

- **Display** (700, clamp(2rem, 5.5vw, 3.25rem), 1.08, -0.02em): el título del hero de cada página y post, en Moon Ink. En "Sobre mí" baja a clamp(1.8rem, 4vw, 2.6rem).
- **Headline** (700, 1.75rem, 1.2): los `#` de un post, en Dracula Violet y precedidos de `#` en mono Comment Slate.
- **Title** (600, 1.3rem, 1.3): los `##` de un post, en tinta principal y precedidos de `##`. Los títulos de tarjeta de post usan 1.4rem/700 en violeta.
- **Body** (400, 1rem, 1.65): párrafos limitados a 72ch en los posts y a 60–68ch en entradillas y resúmenes.
- **Label** (Fira Code 400–500, sin tracking añadido y siempre en minúsculas), en cuatro pasos:
  - `label-xs` (0.72rem): rutas de resultados del buscador, lenguaje de los proyectos.
  - `label-sm` (0.75rem): kickers de tile, chips, cabeceras de bloque de código y de callout, controles de la barra.
  - `label` (0.8rem): fechas, kickers de sección, línea de autor.
  - `label-md` (0.85rem): prompts del hero, barra del sitio.
  - Los valores intermedios que quedan en el CSS (0.7, 0.78 y 0.82rem) son deriva y deben converger al paso más cercano.
- **Code** (Fira Code 400, 0.84rem, 1.6, ligaduras contextuales): bloques de código. El código inline va al 0.86em del texto que lo rodea.

### Named Rules

**The Machine Speaks Mono Rule.** Rutas, comandos, fechas, rótulos `//`, contadores y nombres de repo van en Fira Code. Prosa, títulos y botones de acción van en Plex Sans. No se mezclan dentro de un mismo elemento salvo `code` inline.

**The Comment Prefix Rule.** Los rótulos de sección se escriben como comentarios (`// me interesa`) y los títulos de post llevan `#` / `##` generados en `::before`. Es la firma del sistema: no la sustituyas por eyebrows en mayúsculas ni por numeración.

## Layout

Una columna de lectura de **50rem** centrada, con margen lateral fluido de clamp(1.25rem, 5vw, 4rem). La usan la portada, `/blog/`, las etiquetas y el cuerpo de los posts, y la barra superior y el pie se alinean a ella. "Sobre mí" se abre a **72rem** con una rejilla bento de 4 columnas y 1rem de separación.

- **Post:** índice lateral pegajoso de 240–300px a la izquierda y contenido a la derecha. Por debajo de 900px, el índice pasa a ser un cajón que se abre desde un botón flotante abajo a la derecha (en la zona del pulgar).
- **Archivo (`/blog/` y cada tag):** la misma bitácora que la portada, con todos los posts agrupados por año bajo un kicker `// 2026 · N posts` (h2), separados 3rem. Cada tag añade bajo su H1 `N posts · ← todas las tags`, y `/tags/` muestra todas las tags como chips enlazados con su recuento.
- **Portada:** hero con el nombre en el H1 ("Hola, soy Flavio Oria, te doy la bienvenida.", el nombre en Dracula Violet) y una línea de autor que no lo repite (avatar, rol y GitHub · LinkedIn · sobre mí); luego secciones separadas por 3rem, cada una con su kicker `// …`. Primero la bitácora: entradas fechadas con la fecha `AAAA-MM-DD` en una columna de 6.5rem a la izquierda y título, descripción y metadatos (lectura, capítulos, etiquetas) a la derecha, separadas por líneas discontinuas. Después, los temas en filas compactas sin tiles: icono Lucide de 18px en Dracula Violet y título en una columna de 10rem, y al lado el texto y los chips. Las dos listas pasan a 1 columna por debajo de 600px.
- **Bento:** cada fila suma 4 columnas. Hero y destacado ocupan 2×2; stack, últimos artículos y temas, 2; intereses y contacto, la fila entera; el resto, 1. Por debajo de 960px pasa a 2 columnas (`dense`) y por debajo de 600px a 1.
- **Ritmo vertical de los posts:** 4.5rem antes de cada `#`, 2.75rem antes de cada `##` y 1.25rem alrededor de bloques de código, tablas y callouts. Los separadores son discontinuos (`1px dashed`), como en un cuaderno.
- Sin scroll horizontal a ancho de móvil; tablas y bloques de código hacen scroll dentro de su caja.

## Elevation & Depth

El sistema es plano y se apila por tonos. La profundidad viene de tres niveles de fondo (canvas → well → abyss) separados por bordes de 1px en Night/Paper Rule. Hundirse significa más oscuro en Dracula y más tostado en Alucard.

### Shadow Vocabulary

- **Dialog lift** (`box-shadow: 0 24px 60px -20px color-mix(in srgb, var(--bg-deeper) 80%, transparent)`): solo en el modal del buscador, junto con un fondo velado con `blur(4px)`.
- **Drawer scrim** (`box-shadow: 0 0 0 100vmax rgb(0 0 0 / 0.45)`): oscurece la página cuando el índice móvil está abierto.

### Named Rules

**The Flat-By-Default Rule.** Las superficies son planas en reposo. Lo único que "sube" es una tile enlazada al pasar el ratón (translateY(-2px) y borde violeta) y las capas modales (buscador y cajón del índice).

**The Featured Glow Exception.** El degradado radial (violeta al 22% arriba a la derecha y rosa al 14% abajo a la izquierda sobre Night Well) está permitido **solo** en la tile de artículo destacado y en las tiles de proyecto, como marca de "esto es lo especial". En ningún otro sitio hay degradados.

## Shapes

Esquinas suaves y escalonadas por tamaño: cuanto más grande la superficie, más radio. 3px para el contorno de foco, 4px para el código inline, 5px para los controles de herramienta (copiar, tema, buscar, cerrar), 8px para bloques de código, tablas, botones y callouts, y 14px para tiles y el modal del buscador. Los chips, badges y el botón flotante del índice son píldoras (999px), y los avatares, círculos.

Los callouts son cajas cerradas de 8px con borde de 1px y cabecera, como los bloques de código. Nada de franjas laterales gruesas en tarjetas o avisos. El índice activo y el resultado de búsqueda seleccionado usan un borde izquierdo de 2px en rosa: el "cursor" de la sesión.

## Components

Discretos y de herramienta: bordes finos, rótulos en mono y color solo en respuesta al usuario.

### Buttons

- **Shape:** curva suave (8px).
- **Primary:** relleno en Dracula Violet con texto en Night Canvas, Plex Sans 500 a 0.875rem, padding 0.55rem 1rem. **Uno por pantalla como máximo** (por ejemplo "leer el blog" en la portada).
- **Hover / Focus:** el relleno pasa a Cursor Pink. El foco es el contorno rosa global de 2px con 2px de separación.
- **Ghost:** transparente, borde de 1px en Night Rule y texto principal. Al pasar el ratón, el borde se vuelve violeta.

### Tool controls (copiar, tema, buscar, cerrar)

- **Style:** transparente, borde de 1px y radio de 5px, Fira Code 500 a 0.7–0.75rem y texto en Dusk Ink. Los iconos de Lucide van a 14px y heredan `currentColor`.
- **States:** al pasar el ratón, el texto pasa a tinta principal y el borde a violeta. "Copiado" se confirma con texto y borde en Signal Green.
- **Search toggle:** lupa + "buscar" + `⌘K` en Comment Slate. El `kbd` se oculta por debajo de 600px.

### Chips

- **Style:** píldora, Fira Code a 0.75rem y padding 0.25rem 0.65rem.
- **Enlazado** (a una etiqueta existente): texto en Link Cyan y borde de 1px sólido en cian al 45% sobre Night Rule. Al pasar el ratón, borde y texto pasan a Cursor Pink.
- **Estático** (intereses, stack de los temas): texto en Dusk Ink y borde de 1px discontinuo en Night Rule. No reacciona al ratón: así no parece clicable.
- **Etiquetas de un post** (bitácora, `/blog/`, etiquetas): no son chips, sino una línea de enlaces en mono 0.8rem y Link Cyan, que pasan a Cursor Pink.

### Cards / Containers (tiles)

- **Corner Style:** 14px.
- **Background:** Night Well. La tile de presentación baja a Night Abyss, y la de destacado y las de proyecto llevan el Featured Glow.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Border:** 1px en Night Rule; violeta al pasar el ratón si la tile es un enlace.
- **Internal Padding:** 1.35rem 1.4rem (2rem en las tiles grandes; 1.5rem en móvil). Cada tile se encabeza con un kicker `// …` en mono.

### Inputs / Fields

- **Search input:** sin caja propia. Vive en la cabecera del modal, detrás del prompt `~/blog $ grep`, en Fira Code a 0.95rem, con cursor rosa y placeholder en Comment Slate. Al enfocarlo no se dibuja contorno: el modal entero ya es el foco.
- **Task list checkboxes:** nativos con `accent-color` Signal Green. Al marcar uno, el texto pasa a Comment Slate tachado.

### Navigation

- **Site bar:** alineada a la columna, en Fira Code a 0.85rem. La marca `~/flaviooria` va en Signal Green y lleva a la portada; solo hay tres secciones (Posts, Tags, Sobre mí) más buscar y tema. Los enlaces van en Dusk Ink y pasan a tinta principal al pasar el ratón. La sección actual (`aria-current="page"`) va en tinta principal con subrayado rosa de 2px. Por debajo de 600px la nav baja a una segunda línea, y en táctil cada control tiene 44px de alto. El RSS no va en la barra: vive en el pie y en el `<head>`.
- **Pie:** en Fira Code a 0.78rem y Comment Slate. A la izquierda `// © año Flavio Oria` y a la derecha los perfiles (LinkedIn, GitHub, X) y el RSS como enlaces cian. Por debajo del ancho de la columna, los enlaces bajan a una segunda línea.
- **Índice del post:** sobre Night Abyss, con enlaces en Dusk Ink, capítulos en tinta principal 500 y subsecciones sangradas a 0.82rem. La sección activa va en rosa con borde izquierdo y fondo Night Well. En móvil se convierte en un cajón lateral.

### Code block (signature)

Una ventana de terminal en miniatura: cabecera en Night Well con el lenguaje en mono Comment Slate a la izquierda y el botón "copiar" a la derecha, y cuerpo en Night Abyss con Shiki en un tema `css-variables` mapeado a la paleta (keyword rosa, función verde, cadena amarilla, constante violeta, parámetro naranja, comentario Comment Slate). Así el resaltado cambia con el tema claro/oscuro.

### Callouts

Primos de los bloques de código: una caja con cabecera, no una franja lateral. El plugin de markdown les añade la cabecera en la segunda pasada.

- **Nota:** borde de 1px (violeta al 45% sobre Night Rule), radio de 8px y fondo violeta al 7% sobre el canvas. La cabecera `// nota` va en Fira Code a 0.75rem y en violeta (el `//` en Comment Slate y oculto al lector de pantalla), separada del cuerpo por una línea discontinua. El `strong` va en violeta.
- **Aviso:** lo mismo en Ember Orange, con cabecera `// aviso`. El color del tipo vive en la variable `--tone` del callout.
- **Referencias:** párrafo a 0.85rem en Dusk Ink bajo una línea discontinua.

### Search dialog (signature)

Un `<dialog>` nativo de hasta 40rem sobre Night Well, con radio de 14px y el Dialog lift. Arriba, el prompt `~/blog $ grep`; abajo, la lista de resultados (título en violeta, ruta en mono y extracto a 2 líneas con las coincidencias marcadas en rosa al 25%). El resultado seleccionado lleva borde izquierdo rosa y fondo tintado de violeta. En el pie, los atajos de teclado en `kbd`. Entra con un desplazamiento de 6px en 140ms, que se desactiva con reduced-motion.

## Do's and Don'ts

### Do:

- **Do** encabezar secciones y tiles con un kicker en comentario (`// stack`) y los títulos de post con `#` / `##` en `::before`.
- **Do** usar Fira Code para todo lo que imprimiría la shell (rutas, fechas, chips, comandos) y Plex Sans para la prosa y los títulos.
- **Do** dar profundidad con los tres niveles de fondo y bordes de 1px. Los separadores de lista y de bitácora van discontinuos.
- **Do** asignar a cada acento su único papel (The One Role Rule) y comprobar cualquier color nuevo en Dracula y en Alucard antes de darlo por bueno.
- **Do** mantener un contraste de al menos 4.5:1 en todo texto que haya que leer, en los dos temas.
- **Do** respetar `prefers-reduced-motion`: el hover de las tiles, la entrada del buscador y el scroll suave se apagan.
- **Do** mantener el contorno de foco rosa de 2px en todo lo interactivo.

### Don't:

- **Don't** hacer que parezca una plantilla SaaS genérica: nada de heros de marketing, degradados fuera de la Featured Glow Exception, iconos dentro de círculos de color ni rejillas de tarjetas idénticas sin kicker ni jerarquía.
- **Don't** usar los acentos de Dracula sin control: nunca más de tres acentos con peso en una misma vista, y nunca un acento solo como decoración.
- **Don't** introducir colores o contrastes que desentonen con Dracula/Alucard: nada de hex sueltos, neones ajenos a la paleta ni grises fríos fuera de los tokens.
- **Don't** convertir la terminal en disfraz: sin texto verde fosforito en párrafos, sin efectos CRT, scanlines ni cursores parpadeando. Signal Green solo va en fragmentos cortos (código inline, prompt, cifras).
- **Don't** oscurecer Comment Slate hacia el #6272a4 original de Dracula: bajaría de 4.5:1 (ver The Readable Both Ways Rule).
- **Don't** usar sombras para separar superficies en reposo.
- **Don't** poner más de un botón relleno por pantalla.
