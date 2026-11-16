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
- `docker/nginx.conf`: assets de `/_astro/` inmutables (1 año), Pagefind y RSS 1 hora, páginas siempre revalidadas, gzip, `error_page 404 /404.html` (la 404 del blog) y `absolute_redirect off` para que `/blog` → `/blog/` no filtre el puerto interno detrás de Traefik.

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

## CI/CD (`.github/workflows/`)

- `ci.yml`: en cada PR, `pnpm format:check` y `pnpm build`. No despliega.
- `deploy.yml`: en cada push a `main` (también al mergear un post del CMS), construye la imagen y la publica en GHCR con dos tags: `latest` y `sha-<commit>`. Después entra por SSH al VPS y ejecuta `pull` + `up -d`.

Secretos en GitHub (Settings → Secrets): `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PATH` (carpeta con `compose.prod.yml` y `.env.prod`). El `GITHUB_TOKEN` del workflow basta para GHCR.

### Rollback

`.env.prod` apunta a `latest`. Para volver a una versión anterior, pisa la variable en la línea de comandos en el VPS:

```sh
cd ~/blog
IMAGE_TAG=sha-<commit-bueno> docker compose -f compose.prod.yml --env-file .env.prod pull
IMAGE_TAG=sha-<commit-bueno> docker compose -f compose.prod.yml --env-file .env.prod up -d
```

El siguiente despliegue normal vuelve a `latest`. Los tags `sha-*` se deben conservar en GHCR; si se borran, ese rollback deja de funcionar.

## Autenticación del CMS (worker de Cloudflare)

El panel `/admin/` necesita un worker que haga el login con GitHub. Se despliega desde el proyecto oficial, no desde este repo:

1. Crear una **GitHub App** (Settings → Developer settings → GitHub Apps) con la _Redirect URI_ `https://cms-auth.flaviohelps.dev/callback`, permisos de repositorio **Contents: Read and write** y **Pull requests: Read and write**, y "Only on this account". Instalarla solo en `flaviooria/blog-flaviohelps`. Guardar el Client ID y generar un Client secret.
2. Clonar `https://github.com/sveltia/sveltia-cms-auth` y desplegarlo con `npx wrangler login` y `npx wrangler deploy`.
3. En el worker, definir las variables `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (como secreto) y `ALLOWED_DOMAINS=blog.flaviohelps.dev`. `ALLOWED_DOMAINS` es obligatorio en la práctica: sin él el worker entregaría tokens a cualquier web.
4. Dominio propio: añadir a su `wrangler.toml` `routes = [{ pattern = "cms-auth.flaviohelps.dev", custom_domain = true }]` (Cloudflare crea el DNS solo, en la zona que ya gestionas) y volver a desplegar.

El TLS del worker lo pone Cloudflare. No cambia nada del TLS del blog (Full strict + Traefik con DNS-01).

## Pendiente

- Recompilar de forma periódica para refrescar los datos de GitHub.
