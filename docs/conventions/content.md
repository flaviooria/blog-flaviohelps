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
draft: false # true = solo visible en pnpm dev
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

| Escribes                                              | Sale                                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| `> texto` o `> [!WARNING]` (también `WARN`)           | Callout de **aviso** (naranja, triángulo, `// aviso`)                |
| `> [!NOTE] texto` (también `TIP`)                     | Callout de **nota** (morado, lápiz, `// nota`)                       |
| `> [!INFO] texto` (también `IMPORTANT`)               | Callout de **info** (cian, círculo con i, `// info`)                 |
| `> [!CAUTION] texto`                                  | Callout de **precaución** (amarillo, círculo con !, `// precaución`) |
| `> [!ERROR] texto` (también `DANGER`)                 | Callout de **error** (rojo, octógono con aspa, `// error`)           |
| `**Referencia:** [enlace](https://…)`                 | Párrafo de referencia, separado y gris                               |
| ` ```bash `                                           | Bloque con cabecera de lenguaje y botón Copiar                       |
| ` ```mermaid `                                        | Diagrama, dibujado en el cliente con mermaid.js                      |
| Una tabla                                             | Tabla con scroll horizontal                                          |
| `- [ ] tarea`                                         | Casilla marcable                                                     |
| `<span class="badge ok\|partial\|check">Texto</span>` | Badge de estado (verde / naranja / amarillo)                         |

- Indica siempre el lenguaje del bloque de código; sin él, la cabecera dice `text`.
- Los enlaces `http(s)` se abren en una pestaña nueva automáticamente.
- La puntuación tipográfica está activa (`'` → `’`), salvo dentro del código.

## Diagramas Mermaid

Los bloques ` ```mermaid ` se dibujan en el cliente con mermaid.js ([ADR 0010](../adr/0010-mermaid-en-el-cliente.md)).

- **No pongas `style Nodo fill:#...`**: esos colores van incrustados en el SVG con `!important` y no cambian con el tema, así que rompen el claro/oscuro. Deja que los colores salgan del tema.
- Para destacar un nodo usa `classDef` con variables del tema, no colores literales.
- El script solo se carga en los posts que tienen al menos un diagrama.
- Si el diagrama no es válido, se ve el código fuente en lugar de un hueco.

## Imágenes

Las imágenes del post van en `src/assets/` y se referencian con una ruta **relativa al `.md`**:

```md
![Flujo MCP](../../assets/workflow_mcp.png)
```

Astro las optimiza en build (WebP con hash en `/_astro/`) y las ajusta a la columna del post.
Una ruta absoluta (`/assets/...`) no funciona: `public/` no tiene carpeta `assets/` y Astro no la genera.
