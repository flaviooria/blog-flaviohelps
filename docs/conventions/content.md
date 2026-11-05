---
title: Contenido de los posts
description: Frontmatter de un post, títulos #/## para el índice, callouts [!NOTE], referencias, badges y task lists
---

# Contenido de los posts

Los posts son `src/content/blog/<slug>.md`. El `<slug>` es la URL: `/blog/<slug>/`.

## Frontmatter

Esquema en `src/content.config.ts`:

```md
---
title: "Título"
description: "Resumen de una o dos frases (portada, listados, RSS y meta description)"
pubDate: 2026-11-03
updatedDate: 2026-11-10 # opcional
tags: ["Docker", "Traefik"]
draft: false # true = solo visible en npm run dev
---
```

- No pongas un `# Título` al principio: el título sale del frontmatter.
- Las etiquetas generan `/tags/<slug>/`. Reutiliza las que ya existen (`/tags/`).

## Títulos e índice lateral

- `# Capítulo` agrupa las `## Sección` que le siguen en el índice.
- Un `##` antes del primer `#` sale suelto en el índice (útil para una introducción).
- `###` y más profundos no aparecen en el índice.

## Bloques especiales

Los genera `src/plugins/dracula-markdown.mjs`:

| Escribes                                              | Sale                                           |
| ----------------------------------------------------- | ---------------------------------------------- |
| `> texto`                                             | Callout de **aviso** (naranja, `// aviso`)     |
| `> [!NOTE] texto` (también `TIP`, `INFO`)             | Callout de **nota** (morado, `// nota`)        |
| `**Referencia:** [enlace](https://…)`                 | Párrafo de referencia, separado y gris         |
| ` ```bash `                                           | Bloque con cabecera de lenguaje y botón Copiar |
| Una tabla                                             | Tabla con scroll horizontal                    |
| `- [ ] tarea`                                         | Casilla marcable                               |
| `<span class="badge ok\|partial\|check">Texto</span>` | Badge de estado (verde / naranja / amarillo)   |

- Indica siempre el lenguaje del bloque de código; sin él, la cabecera dice `text`.
- Los enlaces `http(s)` se abren en una pestaña nueva automáticamente.
- La puntuación tipográfica está activa (`'` → `’`), salvo dentro del código.
