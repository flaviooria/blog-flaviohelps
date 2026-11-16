---
title: "ADR 0011: Panel de edición Sveltia CMS con flujo editorial por PR"
description: Los posts se publican desde /admin con Sveltia CMS, que escribe markdown en el repo mediante PR; autenticación con el worker oficial sobre una GitHub App
---

# ADR 0011: Panel de edición Sveltia CMS con flujo editorial por PR

- **Estado:** Aceptado
- **Fecha:** 2026-11-16

## Contexto

Hasta ahora cada post se escribe a mano en `src/content/blog/*.md`, se sube con git y se despliega a mano. Se quiere publicar sin escribir código.

El blog es estático y el cuerpo de los posts pasa por un pipeline propio (Sätteri, plugins de Dracula, Shiki, mermaid). Un CMS con API y base de datos obligaría a escribir un loader, a reimplementar ese render y a sacar las imágenes de `astro:assets`.

Alternativas consideradas:

- **Sanity / Storyblok:** contenido en su API. Hay que escribir un loader, el cuerpo deja de ser markdown y las imágenes salen de `astro:assets`.
- **Directus / Strapi / Payload:** autoalojados. Añaden base de datos y operación a un blog que hoy solo sirve estáticos.
- **Keystatic / TinaCMS:** editor propio que puede reformatear el markdown; las imágenes irían a `public/`.
- **Pages CMS:** cero infraestructura, pero dependencia de un servicio de terceros y menos control de la UX. Sigue siendo la alternativa si no se quiere montar el worker.
- **Sveltia CMS:** escribe los `.md` en el repo mediante commits y PR. Es el sucesor de Decap CMS y el único que deja intacto el contenido, el esquema de `content.config.ts` y el flujo de imágenes.

Para que el panel haga commits desde el navegador hace falta un token de GitHub, y el intercambio OAuth necesita un secreto que no puede ir en el frontend. Sveltia recomienda para varios usuarios el worker oficial `sveltia-cms-auth`, que funciona con una **GitHub App** (permisos solo sobre este repo, tokens de 8 h renovados solos) en lugar de una OAuth App.

## Decisión

- `public/admin/` carga Sveltia CMS desde unpkg, con la versión fijada.
- `public/admin/config.yml` define la colección `blog` con los campos del esquema zod y `publish_mode: editorial_workflow`: cada post se guarda en una rama `cms/<slug>` con su PR, y solo llega a `main` al hacer merge.
- La autenticación usa el worker oficial `sveltia-cms-auth` desplegado en Cloudflare Workers en `https://cms-auth.flaviohelps.dev`, con una GitHub App instalada solo en este repo. El código del worker **no se copia** a este repo: se despliega desde su proyecto upstream (MIT).
- `.github/workflows/ci.yml` valida cada PR (`format:check` y `pnpm build`). `.github/workflows/deploy.yml` construye la imagen en cada push a `main` y la publica en GHCR con dos tags: `latest` y `sha-<commit>`.
- El VPS despliega `latest` por defecto. Un rollback es volver a desplegar un `sha-<commit>` anterior con `IMAGE_TAG` ([docs/workflow/deploy.md](../workflow/deploy.md)).

## Consecuencias

- **Se gana:** publicar desde un formulario, con imágenes, sin tocar código, y con revisión por PR antes de que un post salga. El contenido sigue siendo markdown en git y el build no cambia.
- **Se pierde:** el editor no muestra callouts, mermaid ni badges tal cual se verán en el blog. Esa sintaxis sigue escribiéndose a mano.
- **Dependencias externas:** unpkg (el script del panel) y el worker de Cloudflare (login). Si el worker cae, el panel no puede publicar, pero el blog sigue sirviéndose.
- **Coste:** cada merge a `main` dispara build y despliegue (unos minutos). Los tags `sha-*` se acumulan en GHCR; borrarlos rompe los rollbacks a esas versiones.
- **Pendiente de validar:** la ruta relativa de las imágenes (`media_folder`/`public_folder` en `config.yml`) no está documentada de forma explícita por Sveltia. Si no produce `../../assets/…` en el `.md`, el plan B es guardar las imágenes junto al post, y se actualizará este ADR y `docs/conventions/content.md`.
