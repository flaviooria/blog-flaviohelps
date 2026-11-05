---
title: "ADR 0001: Astro 7 con Sätteri y plugins hast nativos"
description: El markdown se procesa con Sätteri (por defecto en Astro 7) y plugins hast propios, no con unified/rehype
---

# ADR 0001: Astro 7 con Sätteri y plugins hast nativos

- **Estado:** Aceptado
- **Fecha:** 2026-11-03

## Contexto

El blog nace del HTML `infraestructura_vps.html`, que tenía callouts, bloques de código con cabecera y botón Copiar, tablas con scroll y párrafos de referencia. Astro 7 usa por defecto **Sätteri** (parser en Rust). `markdown.rehypePlugins` solo funciona instalando además `@astrojs/markdown-remark` (unified), ya en desuso.

## Decisión

- Usar `satteri({ hastPlugins })` en `astro.config.mjs` con los plugins de `src/plugins/dracula-markdown.mjs`.
- Los nodos de Sätteri son proxies: **no se clonan** (`structuredClone` falla). Se modifican con `ctx.wrapNode`, `ctx.prependChild`, `ctx.setProperty`, etc.
- Cuando una transformación depende de otra (cabecera de código dentro del `div.code`), va en un **segundo plugin**, que se ejecuta después.
- El prefijo `#`/`##` de los títulos va en CSS (`::before`), no en el HTML, para que no contamine los ids que genera Astro.
- La sintaxis `> [!NOTE]` se implementa en nuestro plugin, porque Sätteri no trae alertas de GitHub.

## Consecuencias

- Compilación rápida y sin la cadena unified.
- Los plugins del ecosistema remark/rehype no sirven directamente; cualquier transformación nueva se escribe como plugin Sätteri (API en `node_modules/satteri/dist/hast/hast-visitor.d.ts`).
- `unist-util-visit` está en `dependencies` pero no se usa; se puede quitar.
