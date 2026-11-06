---
title: Despliegue con Docker y Traefik
description: Dockerfile multi-stage (pnpm → build → nginx sin root), compose local y compose.prod.yml con labels de Traefik y variables
---

# Despliegue con Docker y Traefik

El blog es estático: la imagen compila con pnpm y sirve `dist/` con nginx. En el VPS, Traefik (red externa `proxy`) pone el TLS y enruta `blog.${DOMAIN}` al contenedor. Decisión en [ADR 0009](../adr/0009-docker-nginx-traefik.md).

## Imagen (`Dockerfile`)

| Etapa     | Base                                        | Qué hace                                                                                           |
| --------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `deps`    | `node:24-slim`                              | `corepack enable` (usa el pnpm de `packageManager`) y `pnpm install --frozen-lockfile` con caché   |
| `build`   | `deps`                                      | `pnpm build`: árbol de docs, Astro y Pagefind                                                      |
| `runtime` | `nginxinc/nginx-unprivileged:stable-alpine` | Solo `dist/` y `docker/nginx.conf`; escucha en el **8080** sin root, con healthcheck en `/healthz` |

- Se compila en `slim` (glibc) y no en alpine: sharp y Pagefind traen binarios para glibc.
- `GITHUB_TOKEN` es opcional y va como **secreto de build**, así que no queda en la imagen:
  ```sh
  docker build --secret id=github_token,env=GITHUB_TOKEN -t blog-flaviohelps .
  ```
- `docker/nginx.conf`: assets de `/_astro/` inmutables (1 año), Pagefind y RSS 1 hora, páginas siempre revalidadas, gzip y `absolute_redirect off` para que `/blog` → `/blog/` no filtre el puerto interno detrás de Traefik.

## Local (`compose.yml`)

```sh
docker compose up --build    # http://localhost:8080
```

## Producción (`compose.prod.yml`)

1. En el VPS, copia `.env.example` a `.env.prod` y ajusta `DOMAIN`, `GHCR_OWNER` e `IMAGE_TAG`. Los `.env.*` no se versionan (salvo `.env.example`).
2. Despliega:
   ```sh
   docker compose -f compose.prod.yml --env-file .env.prod pull
   docker compose -f compose.prod.yml --env-file .env.prod up -d
   ```

Labels de Traefik (router y servicio `blog-flaviohelps`): ``Host(`blog.${DOMAIN}`)``, entrypoint `websecure`, TLS con el certresolver `cf` y puerto 8080 del contenedor. La red `proxy` debe existir (la crea el stack de Traefik).

## Pendiente

- Publicar la imagen en GHCR desde CI (`latest` + `sha-<commit>`) y desplegar siempre el SHA.
- Recompilar de forma periódica para refrescar los datos de GitHub.
- Página 404 propia: hoy nginx devuelve la suya por defecto.
