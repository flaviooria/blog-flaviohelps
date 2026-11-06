# syntax=docker/dockerfile:1

# Blog estático (Astro + Pagefind) servido con nginx sin root.
#
#   docker build -t blog-flaviohelps .
#   docker build --secret id=github_token,env=GITHUB_TOKEN -t blog-flaviohelps .
#
# El token es opcional: da más cuota a la API de GitHub durante el build y,
# al ir como secreto, no queda en ninguna capa de la imagen.

# ── 1. deps: dependencias con pnpm (capa cacheada mientras no cambie el lock) ──
# node:24-slim (glibc): sharp y Pagefind traen binarios para glibc, no para musl.
FROM node:24-slim AS deps
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# corepack usa el pnpm fijado en "packageManager" de package.json
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

# ── 2. build: genera dist/ (prebuild: árbol de docs · postbuild: Pagefind) ──
FROM deps AS build
COPY . .
RUN --mount=type=secret,id=github_token,env=GITHUB_TOKEN \
    pnpm build

# ── 3. runtime: solo nginx y el HTML estático ──
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:8080/healthz || exit 1
