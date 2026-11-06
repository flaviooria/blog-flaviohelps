---
title: Desarrollo y verificación
description: Comandos (dev en background, build, format), cómo verificar un cambio, caché de contenido de los plugins y variables de entorno
---

# Desarrollo y verificación

## Comandos

| Comando                              | Para qué                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `npx astro dev --background`         | Servidor de desarrollo en segundo plano (preferido por agentes)                                          |
| `npx astro dev status / logs / stop` | Gestionar ese servidor                                                                                   |
| `npm run dev`                        | Servidor en primer plano (`http://localhost:4321`)                                                       |
| `npm run build`                      | Genera `dist/`; antes regenera el árbol de docs (`prebuild`) y después indexa con Pagefind (`postbuild`) |
| `npm run preview`                    | Sirve `dist/`                                                                                            |
| `npm run format` / `format:check`    | Prettier                                                                                                 |
| `npm run docs:tree`                  | Regenera el árbol de `docs/` en `AGENTS.md`                                                              |

Requiere Node ≥ 22 (`engines` en `package.json`).

## Antes de dar un cambio por terminado

1. `npm run format:check`
2. `npm run build` sin errores ni avisos nuevos.
3. Si tocaste HTML generado (plugins, layouts), inspecciona `dist/` con `grep`/`python` para confirmar la estructura.
4. Si es visual, revisa `/`, `/blog/<post>/` y `/tags/` a 1, 2 y 4 columnas en el navegador. En este entorno **no hay navegador headless** (faltan librerías del sistema), así que dilo explícitamente si no se ha podido mirar.
5. Si cambiaste una convención o tomaste una decisión de arquitectura, actualiza `docs/` ([docs y ADRs](docs-and-adrs.md)).

## Buscador

- La búsqueda solo funciona sobre `dist/`: `npm run build && npm run preview`. En `astro dev` el modal avisa de que no hay índice.

## Caché de contenido (plugins de markdown)

Astro guarda los posts ya renderizados en `node_modules/.astro/data-store.json` y solo los vuelve a renderizar si cambia el `.md`. Si tocas `src/plugins/dracula-markdown.mjs` (callouts, bloques de código, tablas…), ni `npm run build` ni `astro dev` lo reflejan hasta que borres esa caché:

```bash
rm -f node_modules/.astro/data-store.json   # luego npm run build
```

En desarrollo, además, el plugin solo se carga al arrancar: `npx astro dev stop`, borra la caché y vuelve a lanzar `npx astro dev --background`.

## Variables de entorno

| Variable       | Uso                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN` | Opcional. Más cuota para la API de GitHub en build (sin él: 60 peticiones/h; cada build usa ~5) |

## Configuración que no hay que olvidar

- `site` en `astro.config.mjs` es `https://blog.flaviohelps.dev`: de ahí salen las URLs del RSS y las canónicas. Si cambia el dominio, cámbialo ahí.
- Los datos de GitHub solo se refrescan al recompilar. Publicar con recompilación periódica es una tarea pendiente.
