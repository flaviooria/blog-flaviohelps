---
title: Desarrollo y verificación
description: Comandos (dev en background, build, format), cómo verificar un cambio, caché de contenido de los plugins y variables de entorno
---

# Desarrollo y verificación

## Comandos

| Comando                               | Para qué                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `pnpm astro dev --background`         | Servidor de desarrollo en segundo plano (preferido por agentes)                                          |
| `pnpm astro dev status / logs / stop` | Gestionar ese servidor                                                                                   |
| `pnpm dev`                            | Servidor en primer plano (`http://localhost:4321`)                                                       |
| `pnpm build`                          | Genera `dist/`; antes regenera el árbol de docs (`prebuild`) y después indexa con Pagefind (`postbuild`) |
| `pnpm preview`                        | Sirve `dist/`                                                                                            |
| `pnpm format` / `format:check`        | Prettier                                                                                                 |
| `pnpm docs:tree`                      | Regenera el árbol de `docs/` en `AGENTS.md`                                                              |

Requiere Node ≥ 22 (`engines` en `package.json`) y **pnpm 10**, fijado en `packageManager`: con `corepack enable` se usa esa versión exacta. No uses npm: no hay `package-lock.json` ([ADR 0008](../adr/0008-pnpm.md)).

## Antes de dar un cambio por terminado

1. `pnpm format:check`
2. `pnpm build` sin errores ni avisos nuevos.
3. Si tocaste HTML generado (plugins, layouts), inspecciona `dist/` con `grep`/`python` para confirmar la estructura.
4. Si es visual, revisa `/`, `/blog/<post>/` y `/tags/` a 1, 2 y 4 columnas en el navegador. En este entorno **no hay navegador headless** (faltan librerías del sistema), así que dilo explícitamente si no se ha podido mirar.
5. Si cambiaste una convención o tomaste una decisión de arquitectura, actualiza `docs/` ([docs y ADRs](docs-and-adrs.md)).

## Buscador

- La búsqueda solo funciona sobre `dist/`: `pnpm build && pnpm preview`. En `astro dev` el modal avisa de que no hay índice.

## Caché de contenido (plugins de markdown)

Astro guarda los posts ya renderizados en `node_modules/.astro/data-store.json` y solo los vuelve a renderizar si cambia el `.md`. Si tocas `src/plugins/dracula-markdown.mjs` (callouts, bloques de código, tablas…), ni `pnpm build` ni `astro dev` lo reflejan hasta que borres esa caché:

```bash
rm -f node_modules/.astro/data-store.json   # luego pnpm build
```

En desarrollo, además, el plugin solo se carga al arrancar: `pnpm astro dev stop`, borra la caché y vuelve a lanzar `pnpm astro dev --background`.

## Variables de entorno

| Variable       | Uso                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN` | Opcional. Más cuota para la API de GitHub en build (sin él: 60 peticiones/h; cada build usa ~5) |

## Configuración que no hay que olvidar

- `site` en `astro.config.mjs` es `https://blog.flaviohelps.dev`: de ahí salen las URLs del RSS y las canónicas. Si cambia el dominio, cámbialo ahí.
- Los datos de GitHub solo se refrescan al recompilar. Publicar con recompilación periódica es una tarea pendiente.
