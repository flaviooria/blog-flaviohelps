---
title: Docs y ADRs
description: Cuándo escribir o actualizar un doc o un ADR, numeración, estados y cómo se regenera el árbol de AGENTS.md
---

# Docs y ADRs

## Cuándo tocar `docs/`

- **Cambias una convención** (formato, estructura, estilos, contenido) → actualiza su doc en `conventions/` en el mismo cambio.
- **Cambias dónde vive algo o cómo fluyen los datos** → actualiza `architecture.md`.
- **Tomas una decisión difícil de revertir o con alternativas razonables** (dependencia nueva, procesador de markdown, fuente de datos, despliegue…) → escribe un ADR.

## ADRs

- Archivo `docs/adr/NNNN-titulo-en-kebab.md`, con el siguiente número libre (4 dígitos).
- Parte de [`0000-template.md`](../adr/0000-template.md).
- Estados: `Propuesto` → `Aceptado` → (`Reemplazado por NNNN` | `Obsoleto`).
- Un ADR aceptado **no se reescribe**: si la decisión cambia, se crea uno nuevo y el viejo se marca `Reemplazado por NNNN`.

## Árbol de `AGENTS.md`

`AGENTS.md` contiene, entre `<!-- docs-tree:start -->` y `<!-- docs-tree:end -->`, un árbol de `docs/` con la `description` de cada archivo. **No se edita a mano.** Lo regenera `scripts/docs-tree.mjs`:

| Disparador                                    | Cuándo                                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Hook `PostToolUse` en `.claude/settings.json` | Un agente crea o edita un archivo dentro de `docs/` (sesión de Claude Code abierta en `blog/`) |
| `predev` / `prebuild`                         | `pnpm dev` y `pnpm build`                                                                      |
| `pnpm docs:tree`                              | A mano (por ejemplo, tras borrar un doc con `rm`)                                              |

`node scripts/docs-tree.mjs --check` sale con código 1 si el árbol está desactualizado (útil en CI).

Por eso cada doc **necesita** `description` en el frontmatter: una línea concreta que permita decidir si abrirlo sin leerlo.
