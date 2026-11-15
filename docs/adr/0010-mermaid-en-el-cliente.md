---
title: "ADR 0010: Diagramas Mermaid con mermaid.js en el cliente"
description: Los bloques de código mermaid se convierten en SVG en el navegador con mermaid.js, repintados al cambiar de tema, y solo se carga en los posts que los tienen
---

# ADR 0010: Diagramas Mermaid con mermaid.js en el cliente

- **Estado:** Aceptado
- **Fecha:** 2026-11-12

## Contexto

Un post usa tres diagramas Mermaid (`graph TD`, `graph LR` y `sequenceDiagram`). Con el pipeline actual salían como **bloques de código resaltados por Shiki**: se veía el código fuente del diagrama, no el diagrama. Hacía falta una librería, pero el markdown se procesa con Sätteri (ADR 0001) y no con el remark de Astro, así que el preprocessing estándar de imágenes de Markdown no aplica. Alternativas: renderizar a SVG en build con `mermaid-cli` (sin JS en el cliente, pero sin zoom/pan y con el tema fijo en el SVG) o dibujarlos en el navegador con `mermaid.js`.

## Decisión

- `mermaid` como dependencia, dibujado **en el cliente**.
- Un plugin de Sätteri (`src/plugins/mermaid.mjs`) sustituye el `<pre>` de Shiki por `<div class="mermaid">` con el código dentro. Va **antes** que el plugin de Dracula en la lista, para que el bloque no reciba la cabecera con el botón "Copiar".
- `src/scripts/mermaid.ts` inicializa `mermaid` con `theme: "base"` y unas `themeVariables` sacadas de la paleta Dracula/Alucard del blog, así que el SVG usa los mismos colores que el resto de la web.
- Al cambiar de tema se **vuelve a pintar**: el SVG lleva los colores incrustados, no basta con cambiar las variables CSS.
- El script solo se incluye en los posts que tienen diagramas (`post.rendered.html` incluye `class="mermaid"`): el bundle pesa ~146 kB y no tiene sentido cargarlo siempre.
- El código fuente se guarda aparte al inicio, porque al pintar el `<pre>` desaparece y haría falta para repintar.

## Consecuencias

- Los diagramas se ven, con zoom y pan, y siguen el tema claro/oscuro.
- Los posts sin diagramas no cargan mermaid.js: no hay coste en la portada, en `/blog/` ni en las páginas de tags.
- Hay un coste de JS (146 kB) en los posts con diagramas, y el diagrama aparece tras cargar el bundle.
- El SVG no se puede imprimir ni indexar: no hay texto del diagrama en el HTML (Pagefind solo indexa 2 de las 18 páginas ya por el `data-pagefind-body`).
- **Los bloques no deben llevar `style ... fill:#...`**: esos colores van incrustados con `!important` y rompen el cambio de tema. Si hay que destacar un nodo, se hace con `classDef` y variables del tema.
- El código fuente queda a la vista si mermaid.js no carga o si el diagrama no es válido, en vez de un hueco en blanco.
