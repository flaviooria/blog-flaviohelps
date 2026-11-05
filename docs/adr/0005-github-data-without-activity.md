---
title: "ADR 0005: Datos de GitHub en build, sin actividad de commits"
description: Reemplaza a 0003; la portada ya no muestra "últimos movimientos" y GitHub solo aporta números y proyectos
---

# ADR 0005: Datos de GitHub en build, sin actividad de commits

- **Estado:** Aceptado
- **Fecha:** 2026-11-04

## Contexto

[ADR 0003](0003-github-data-at-build-time.md) añadió a la portada una tarjeta "últimos movimientos" con el último commit de los 3 repos más recientes y un "siguiente paso" manual (`profile.next`). Se decide quitar esa tarjeta de la portada.

## Decisión

- Se mantiene todo lo de 0003 salvo la actividad: `src/lib/github.ts` pide solo `/users/:u` y `/users/:u/repos?sort=pushed`.
- Se eliminan la petición `/repos/:u/:r/commits`, el tipo `GithubActivity`, la conversión de gitmoji y `profile.next`.
- Filtros (forks, archivados, repo de perfil, globs de `profile.github.exclude`), respaldo en `profile.ts` y `GITHUB_TOKEN` opcional siguen igual. **El build nunca falla por GitHub.**

## Consecuencias

- 2 peticiones por build en vez de ~5: sobra cuota incluso sin token (60/h).
- En la fila de la tarjeta eliminada, "temas" pasa a ocupar 2 columnas junto a "más artículos".
- Si se quiere volver a mostrar actividad, hay que recuperar la petición de commits (ver 0003).
