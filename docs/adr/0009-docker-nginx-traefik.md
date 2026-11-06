---
title: "ADR 0009: Imagen Docker con nginx detrás de Traefik"
description: El blog se publica como imagen multi-stage (pnpm build → nginx-unprivileged) en GHCR y se despliega con compose en el VPS detrás de Traefik
---

# ADR 0009: Imagen Docker con nginx detrás de Traefik

- **Estado:** Aceptado
- **Fecha:** 2026-11-06

## Contexto

El blog va al mismo VPS que el resto de side projects, donde Traefik (red externa `proxy`, certresolver `cf` de Cloudflare) enruta por dominio y pone el TLS. Los demás servicios se despliegan como imágenes de GHCR con un `compose` y labels de Traefik; el blog debe seguir el mismo patrón.

Alternativas: un hosting estático (Cloudflare Pages, Netlify), que saca el blog del VPS y de su patrón de despliegue, o servir `dist/` desde un volumen con un nginx compartido, que acopla el blog a otro contenedor.

## Decisión

- Imagen multi-stage: `node:24-slim` con pnpm para compilar y `nginxinc/nginx-unprivileged:stable-alpine` para servir solo `dist/` en el puerto 8080, sin root y con healthcheck.
- `GITHUB_TOKEN` entra como secreto de build, nunca como `ARG` ni `ENV`.
- `compose.yml` para probar en local y `compose.prod.yml` para el VPS, con la imagen `ghcr.io/${GHCR_OWNER}/blog-flaviohelps:${IMAGE_TAG}` y los labels de Traefik en `blog.${DOMAIN}`.

## Consecuencias

- El blog se despliega igual que el resto de servicios del VPS y la imagen final pesa poco (nginx y HTML).
- Los datos de GitHub se congelan en cada imagen: hay que recompilar para refrescarlos.
- Queda pendiente el CI que publique la imagen en GHCR (`latest` + `sha-<commit>`).
- Las cabeceras de seguridad más allá de `nosniff` y `Referrer-Policy` (HSTS, CSP) se dejan a Traefik.
