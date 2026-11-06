---
title: Documentación del blog
description: Qué hay en docs/ y cómo añadir un doc o un ADR
---

# Documentación del blog

Esta carpeta es la fuente de verdad sobre **cómo** está hecho el blog y **por qué**. Está pensada para personas y para agentes: el árbol de `AGENTS.md` lista cada doc con una línea de descripción, así se abre solo el que hace falta.

| Carpeta           | Qué contiene                                                  |
| ----------------- | ------------------------------------------------------------- |
| `architecture.md` | Mapa del código: dónde vive cada cosa y cómo fluyen los datos |
| `conventions/`    | Reglas de código, estilos y contenido                         |
| `workflow/`       | Cómo desarrollar, verificar y mantener los docs               |
| `adr/`            | Decisiones de arquitectura (una por archivo, numeradas)       |

## Añadir un doc

1. Crea el `.md` en la carpeta que toque.
2. Ponle frontmatter con `title` y `description`. La `description` es lo que aparece en el árbol de `AGENTS.md`: una línea, concreta.
3. El árbol se regenera solo (hook de Claude Code, `pnpm dev`/`build`). A mano: `pnpm docs:tree`.

## Añadir un ADR

Copia [`adr/0000-template.md`](adr/0000-template.md) con el siguiente número libre. Detalles en [`workflow/docs-and-adrs.md`](workflow/docs-and-adrs.md).
