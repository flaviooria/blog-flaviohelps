---
title: "ADR 0003: Datos de GitHub en tiempo de build"
description: Portada con actividad y proyectos de la API pública de GitHub en build, exclusión por glob y respaldo en profile.ts
---

# ADR 0003: Datos de GitHub en tiempo de build

- **Estado:** Reemplazado por [0005](0005-github-data-without-activity.md)
- **Fecha:** 2026-11-04

## Contexto

La portada mostraba "ahora mismo" y proyectos escritos a mano, que se quedaban desfasados. LinkedIn no se puede leer sin sesión; GitHub tiene API pública. Los `PushEvent` del API de eventos ya no incluyen los mensajes de commit (comprobado el 2026-11-04).

## Decisión

- `src/lib/github.ts` pide en build `/users/:u`, `/users/:u/repos?sort=pushed` y el último commit de los 3 repos más recientes (`/repos/:u/:r/commits?per_page=1`).
- Se filtran forks, archivados, el repo de perfil y los patrones de `profile.github.exclude` (glob: `*`, `?`, sin distinguir mayúsculas).
- Si algo falla: `console.warn` y `null`. La portada usa entonces `profile.stats` y `profile.projects`. **El build nunca falla por GitHub.**
- `GITHUB_TOKEN` opcional para más cuota.
- Lo que GitHub no sabe (siguiente paso) es manual: `profile.next`.

## Consecuencias

- La portada se actualiza sola en cada build, pero **solo** en cada build: hace falta recompilar de forma periódica (pendiente, según dónde se publique).
- ~5 peticiones por build; sin token hay 60/h.
- Los datos de respaldo en `profile.ts` hay que mantenerlos razonables.
