---
title: Estilos
description: Paleta Dracula/Alucard como tokens CSS, tema claro/oscuro, tipografía, bento y responsive
---

# Estilos

Todo vive en `src/styles/global.css`. No hay Tailwind ni CSS por componente.

## Tokens de color

Solo se usan variables; **nunca un hex fuera de `:root`**.

| Token                                | Oscuro (Dracula) | Claro (Alucard) | Uso típico                         |
| ------------------------------------ | ---------------- | --------------- | ---------------------------------- |
| `--bg` / `--bg-deep` / `--bg-deeper` | `#282a36` …      | `#fffbeb` …     | Fondos, de más claro a más hundido |
| `--line`                             | `#44475a`        | `#cfcfde`       | Bordes                             |
| `--fg` / `--muted` / `--comment`     | `#f8f8f2` …      | `#1f1f1f` …     | Texto principal, secundario, meta  |
| `--purple`                           | `#bd93f9`        | `#644ac9`       | Títulos, acento principal          |
| `--pink`                             | `#ff79c6`        | `#a3144d`       | Hover, foco, marcadores            |
| `--cyan`                             | `#8be9fd`        | `#036a96`       | Enlaces, cabeceras de tabla        |
| `--green`                            | `#50fa7b`        | `#14710a`       | Código inline, estados OK, cifras  |
| `--orange`                           | `#ffb86c`        | `#a34d14`       | `strong`, avisos                   |
| `--yellow` / `--red`                 |                  |                 | `em`, cadenas / errores            |

Para fondos tintados: `color-mix(in srgb, var(--purple) 9%, var(--bg))`.

## Tema claro/oscuro

- Por defecto sigue `prefers-color-scheme`. El botón `.theme-toggle` fija `data-theme="light|dark"` en `<html>` y lo guarda en `localStorage`.
- Si añades tokens, defínelos en **los tres sitios**: `:root`, el `@media (prefers-color-scheme: light)` y `:root[data-theme="light"]`.
- El resaltado de código usa variables `--shiki-token-*` mapeadas a la paleta ([ADR 0002](../adr/0002-shiki-css-variables-theme.md)).

## Tipografía

- Texto: `var(--sans)` (IBM Plex Sans). Código, rutas y "kickers": `var(--mono)` (Fira Code).
- Estética de terminal: prompts `~/blog $ …`, kickers `// sección`, títulos con `#`/`##` en `::before`.

## Portada

- `/` es una columna de 50rem como `/blog/`: `header.hero.home-hero` con prompt, H1 con el nombre ("Hola, soy `.who`, te doy la bienvenida." + `blog.title`; el nombre en `--purple`), entradilla, línea de autor (`.home-author`: avatar de 44px, rol en negrita y debajo GitHub · LinkedIn · sobre mí) y un único CTA. Después vienen las secciones `.home-section` con kicker `// …`.
- El pie (`SiteFoot`) muestra `// © año nombre` y los enlaces de `profile.links` (perfiles y RSS). Es el único sitio visible del RSS, que también se anuncia en el `<head>`.
- Orden: primero `// últimos posts` y luego `// de qué va`. La portada es una bitácora con entradas fechadas.
- Bitácora (`PostLog`, `.post-log`): una fila por post (los 6 últimos), con la fecha `AAAA-MM-DD` en mono `--comment` en una columna de 6.5rem y, al lado, el título `h3` en `--purple`, la descripción y una línea de metadatos en mono (`min de lectura · capítulos · etiquetas`, con las etiquetas en `--cyan`). Por debajo de 600px la fecha pasa encima. `ls ~/blog →` solo aparece si hay más posts que los mostrados.
- Temas en `.home-topics`: filas compactas sin tiles (icono Lucide de 18px en `--purple` delante del título, en una columna de 10rem y, al lado, texto y chips), que pasan a 1 columna por debajo de 600px. Los chips enlazan al tag solo si ya existe.
- Chips (`.chips`): los enlazados van en `--cyan` con borde sólido tintado de cian; los que no enlazan (`.chips li` sin `a`) van en `--muted` con borde discontinuo, para que no parezcan clicables.
- Etiquetas de un post (`.post-tags`, en `PostLog`): una línea de enlaces en mono 0.8rem y `--cyan`, no una columna.

## Post

- Arriba va la `SiteBar` (buscar y tema a la derecha, como en el resto del sitio); la línea `.meta` del hero solo lleva la fecha.
- Índice (`Toc` → `.toc-dock`): por defecto es el cajón móvil con el botón flotante `.toc-toggle`. Solo en `@media (min-width: 901px) and (hover: hover)` pasa a pestaña `.toc-handle` en el borde que abre `nav.toc` con `:hover`/`:focus-within` (cierre con 0.3s de retardo) y muestra el botón `.toc-pin`.
- Fijado: `html[data-toc="pinned"]` (clave `toc` en `localStorage`, aplicada con un script inline antes de pintar) deja el índice visible y pone `.layout` con `padding-left: 300px`.

## Archivo (/blog/ y /tags/<tag>/)

- Ambas páginas van en `<main>` y usan la misma bitácora que la portada (`PostLog` con `byYear`): un `h2.kicker.log-year` `// 2026 · N posts` por año y debajo su `ol.post-log`, dentro de `.log-archive` (50rem). Los títulos de post son siempre `h3`.
- Vocabulario visible: **posts** y **tags** (barra, H1, recuentos y kickers). "Bitácora" queda como metáfora en la prosa, no como rótulo.
- `/blog/` lleva como H1 "Todo lo que he montado, roto y arreglado" y debajo una línea `.meta` con `N posts · M tags · busca con <kbd>/</kbd>` (las tags enlazan a `/tags/`). Cada página tiene su propia meta description.
- Cada `/tags/<tag>/` lleva bajo el H1 una línea `.meta` con `N posts · ← todas las tags`.
- `/tags/` lista todas las tags como chips enlazados (`.chips.tag-cloud`, en cian) con su nº de posts en `small`, fuera del hero y en `<main>`.
- No hay otro componente de listado: si cambias una entrada, cambia en la portada y en los archivos a la vez.

## Sobre mí (bento)

- Rejilla de 4 columnas (`.bento`) → 2 columnas por debajo de 960px (`grid-auto-flow: dense`) → 1 por debajo de 600px.
- Cada fila debe sumar 4 columnas. Spans actuales: hero y destacado `2×2`; stack, "más artículos" y "temas" `2`; "me interesa" y contacto toda la fila; el resto `1`.
- Las tarjetas son `.tile` (con `a.tile` para las que enlazan, con hover que eleva 2px).

## Iconos

- Lucide vía `@lucide/astro`, importando cada icono por separado: `import Sun from "@lucide/astro/icons/sun"` ([ADR 0007](../adr/0007-lucide-icons.md)).
- `size={14}` junto a texto mono pequeño; el color sale de `currentColor` (no pongas `color`).
- Si el icono acompaña a un texto o a un `aria-label`, lleva `aria-hidden="true"`.
- Botones de la barra y de los posts: `ThemeToggle` (luna en oscuro y sol en claro; lo decide el CSS según `data-theme` y `prefers-color-scheme`) y `SearchToggle` (lupa + "buscar", con `shortcut` para el `⌘K`).

## Buscador

- Modal `.search-dialog` (`<dialog>` nativo) en `src/components/Search.astro`, con estilos en la sección `/* Buscador */` de `global.css`.
- Estética de terminal: prompt `~/blog $ grep`, `var(--mono)`, fondo `--bg-deep`, borde `--line` y radio 14px como `.tile`.
- Resultado seleccionado: borde izquierdo `--pink` y fondo tintado `--purple` al 9%. Las coincidencias (`mark`) van con `--pink` al 25%.
- `.search-toggle` comparte el aspecto con `.theme-toggle`. Atajos: ⌘K / Ctrl+K y `/`.

## Accesibilidad

- `:focus-visible` con contorno rosa; no lo quites.
- Animaciones y transiciones desactivadas con `prefers-reduced-motion`.
- Sin scroll horizontal a ancho de móvil.
