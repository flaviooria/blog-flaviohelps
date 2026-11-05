---
title: "ADR 0006: Buscador estático con Pagefind"
description: Búsqueda de posts con Pagefind (índice en postbuild, modal ⌘K propio) y cuándo y cómo migrar a Algolia
---

# ADR 0006: Buscador estático con Pagefind

- **Estado:** Aceptado
- **Fecha:** 2026-11-04

## Contexto

Se quiere un buscador "tipo Algolia" en el blog. Restricciones: sitio estático sin backend, pocos posts (1 al escribir esto) y sin dominio real todavía (`site` sigue en `https://example.com`).

Alternativas consideradas:

- **Algolia (API + script de indexado):** búsqueda alojada, muy rápida, con tolerancia a erratas, sinónimos y analíticas. Requiere cuenta, claves (una pública de búsqueda y otra de admin secreta), un script que reindexe en cada build y enviar las consultas a un tercero.
- **Algolia DocSearch:** Algolia rastrea el sitio gratis, pero hay que solicitarlo, el sitio tiene que estar publicado y orientado a documentación técnica, y no siempre lo aceptan para blogs personales.
- **Pagefind:** genera un índice estático troceado a partir del HTML de `dist/`. La búsqueda ocurre en el navegador sin cuenta ni claves.

## Decisión

Pagefind, con interfaz propia:

- `pagefind` como devDependency y `"postbuild": "pagefind --site dist"`. El índice queda en `dist/pagefind/`.
- Solo se indexan posts: `data-pagefind-body` en el `<article class="content">` de `PostLayout.astro`. Pagefind ignora las páginas sin esa marca.
- Metadatos: `data-pagefind-meta="title"` en el `<h1>` y `data-pagefind-meta="date"` en la fecha. Filtro `data-pagefind-filter="tag"` en los tags.
- La cabecera de los bloques de código (lenguaje + "Copiar") lleva `data-pagefind-ignore` desde el plugin hast, para que no ensucie los extractos.
- Interfaz en `src/components/Search.astro`: `<dialog>` nativo incluido una vez en `BaseLayout.astro`. Se abre con ⌘K / Ctrl+K, con `/` o con cualquier `.search-toggle`. Carga `/pagefind/pagefind.js` de forma perezosa al abrirse. Se usa la API JS (no `@pagefind/default-ui`) para mantener la estética Dracula/Alucard.

## Consecuencias

- No hay servicios externos, claves ni cuota, y las consultas no salen del navegador.
- En `astro dev` no hay índice: el modal avisa y la búsqueda se prueba con `npm run build && npm run preview`.
- La tolerancia a erratas existe pero es más simple que en Algolia, y no hay sinónimos, ranking configurable ni analíticas.
- Si se cambia un plugin hast y el HTML de los posts no se actualiza, es la caché de contenido de Astro: `npx astro build --force`.

### Cuándo migrar a Algolia

- Cuando haya muchos posts y el peso del índice o la latencia de Pagefind se noten.
- Cuando se necesite tolerancia fuerte a erratas, sinónimos, ranking por fecha o popularidad, o analíticas de búsquedas.

### Requisitos de esa migración

- Cuenta en Algolia (el plan gratuito sobra para un blog).
- Variables `PUBLIC_ALGOLIA_APP_ID` y `PUBLIC_ALGOLIA_SEARCH_KEY` (públicas, van al navegador).
- `ALGOLIA_ADMIN_KEY`: **secreta**, solo en build o CI; comprobar que no aparece en `dist/`.
- Script de indexado (`postbuild` o CI) que reutilice `getPosts` y `tagSlug` de `src/utils.ts`: un registro por post o por sección `##`, con un máximo de unos 10 KB por registro.
- Interfaz: `@docsearch/js`, o mantener `Search.astro` cambiando Pagefind por `algoliasearch`.
- Un ADR nuevo que marque este como `Reemplazado por NNNN`.
