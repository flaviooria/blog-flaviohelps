---
title: "ADR 0004: Prettier con comillas dobles"
description: El formato lo impone Prettier (con prettier-plugin-astro) usando sus valores por defecto, comillas dobles incluidas
---

# ADR 0004: Prettier con comillas dobles

- **Estado:** Aceptado
- **Fecha:** 2026-11-04

## Contexto

El código mezclaba comillas simples y dobles: el editor ya formateaba con los valores por defecto de Prettier y parte del código se había escrito a mano con simples.

## Decisión

- `prettier` + `prettier-plugin-astro` como devDependencies, `.prettierrc.mjs` solo con el plugin (resto, valores por defecto: comillas dobles, `printWidth` 80).
- `src/content/` está en `.prettierignore` para no reescribir los posts.
- Scripts `npm run format` y `npm run format:check`.

## Consecuencias

- La convención la impone la herramienta, no la memoria.
- El primer `format` cambió casi todos los archivos de código (solo formato).
