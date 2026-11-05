---
title: Skills de diseño (impeccable) y hooks
description: Qué skill de Claude Code se usa para el diseño (impeccable), qué ficheros mantiene, cómo se usa cada comando y qué hooks corren al editar
---

# Skills de diseño (impeccable) y hooks

El diseño del blog se trabaja con la skill **impeccable** de Claude Code (plugin). No hace falta para compilar ni para escribir posts: solo para revisar, refinar o documentar la interfaz.

## Qué ficheros mantiene

| Fichero                                   | Qué es                                                                                                          | ¿Se versiona? |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------- |
| `PRODUCT.md`                              | Para quién es el blog, propósito, voz y límites. Lo lee impeccable antes de cualquier trabajo de diseño.        | Sí            |
| `DESIGN.md`                               | El sistema de diseño: tokens en el frontmatter y reglas, componentes y do's/don'ts en el cuerpo.                | Sí            |
| `.impeccable/design.json`                 | "Sidecar" de `DESIGN.md`: lo que el frontmatter no admite (componentes en HTML/CSS, breakpoints, narrativa).    | Sí            |
| `.impeccable/critique/<fecha>__<slug>.md` | Instantánea de cada crítica (puntuación, problemas priorizados). Las lee `polish` para heredar las prioridades. | No            |
| `.impeccable/critique/ignore.md`          | Hallazgos que la crítica debe ignorar siempre (falsos positivos conocidos).                                     | Sí            |
| `.impeccable/*.cache.json`                | Caché del hook detector.                                                                                        | No            |

## Comandos que usamos

Se invocan como `/impeccable <comando> [objetivo]`:

| Comando             | Para qué lo hemos usado                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `critique <página>` | Revisión con dos agentes aislados (diseño + detector), puntuación de Nielsen y problemas P0–P3. Se hizo de `/` y de `/blog/`. |
| `document`          | Regenerar `DESIGN.md` y su sidecar desde el código. Para refrescar solo el sidecar: "solo `.impeccable/design.json`".         |
| `polish`, `layout`… | Arreglos dirigidos; cada problema de una crítica sugiere su comando (`distill`, `harden`, `layout`, `clarify`, `polish`…).    |
| `audit`             | Comprobación técnica (accesibilidad, rendimiento, responsive).                                                                |

Sin argumento, `/impeccable` muestra un menú según el estado del proyecto.

## Reglas al trabajar con la skill

- **`DESIGN.md` manda.** Si cambias algo visual, actualiza `DESIGN.md` en el mismo cambio (y `docs/conventions/styling.md` si es una convención). El sidecar se puede regenerar después con `document`.
- **Las excepciones se escriben.** Si el autor acepta romper una regla (p. ej. la Ambient Glow Exception y su coste de contraste), queda en `DESIGN.md` con su porqué.
- **Falsos positivos del detector:** el aviso `cream-palette` en el tema claro es el fondo oficial de Alucard (`#fffbeb`), no un crema por reflejo. Si molesta, añádelo a `.impeccable/critique/ignore.md`.
- **Sin navegador en este entorno.** Chromium no arranca (faltan `libnss3` y otras librerías), así que las críticas y comprobaciones se hacen sobre el código y el HTML de `dist/`. Dilo explícitamente cuando algo visual no se haya podido mirar.

## Hooks que corren al editar

| Hook                   | Dónde se configura                 | Qué hace                                                                                                       |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Árbol de `docs/`       | `.claude/settings.json` (proyecto) | Tras cada `Write`/`Edit`, `scripts/docs-tree.mjs --hook` regenera el árbol de `AGENTS.md`.                     |
| Detector de impeccable | Plugin impeccable                  | Tras editar un fichero de UI, escanea patrones de diseño problemáticos y avisa en la conversación. No bloquea. |

El detector se gestiona con `/impeccable hooks <on|off|status|ignore-rule|ignore-file|…>`.
