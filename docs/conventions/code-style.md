---
title: Estilo de código
description: TypeScript strict, estructura de componentes Astro, nombres, Prettier (comillas dobles) y comentarios
---

# Estilo de código

## Formato

- **Prettier** con `prettier-plugin-astro` y la configuración por defecto: comillas **dobles**, punto y coma, `printWidth` 80. Ver [ADR 0004](../adr/0004-prettier-double-quotes.md).
- `pnpm format` antes de dar un cambio por terminado; `pnpm format:check` lo verifica.
- `src/content/` está excluido de Prettier: los posts se escriben a mano.

## TypeScript

- `tsconfig` extiende `astro/tsconfigs/strict`. Nada de `any` salvo respuestas de APIs externas sin tipar, y en ese caso se mapean enseguida a una interfaz propia (ejemplo: `GithubRepo` en `src/lib/github.ts`).
- Props de componentes con `interface Props`.
- Tipos de contenido desde `astro:content` (`CollectionEntry<"blog">`), nunca duplicados a mano.

## Componentes Astro

- Frontmatter en este orden: imports → `interface Props` → lectura de props → datos derivados.
- La lógica de datos va en `src/utils.ts` o `src/lib/`, no dentro de las páginas.
- Scripts de cliente en `<script>` (los procesa Astro); `is:inline` solo para lo que debe ejecutarse antes de pintar (tema).
- Sin frameworks de UI: HTML + CSS + scripts pequeños.

## Dónde poner cada cosa

| Necesito…                               | Va en…                                              |
| --------------------------------------- | --------------------------------------------------- |
| Un helper puro (fechas, slugs, conteos) | `src/utils.ts`                                      |
| Acceso a un servicio externo            | `src/lib/<servicio>.ts`                             |
| Texto o datos editables de la portada   | `src/data/profile.ts`                               |
| Cambiar cómo se renderiza el markdown   | `src/plugins/dracula-markdown.mjs`                  |
| Estilos                                 | `src/styles/global.css` (ver [styling](styling.md)) |

## Nombres e idioma

- Archivos de componentes y layouts en `PascalCase.astro`; el resto en `kebab-case` o `camelCase.ts`.
- Clases CSS en `kebab-case` (`tile-project`, `code-head`).
- **Textos de la interfaz y comentarios en español.** Identificadores en inglés.
- Comentarios para explicar el _porqué_, no el _qué_.

## Servicios externos

- Siempre con respaldo: si fallan, `console.warn` y datos por defecto. El build nunca debe romperse por la red (patrón de `getGithubData`).
- Tokens solo por variable de entorno (`GITHUB_TOKEN`), nunca en el código.
