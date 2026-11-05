---
title: Arquitectura
description: Mapa del código (qué hay en cada carpeta de src/) y flujo de datos de posts y GitHub
---

# Arquitectura

Sitio **estático** con Astro 7. Todo se resuelve en `npm run build`; no hay servidor ni JS de framework en el cliente (solo pequeños `<script>`).

## Mapa de `src/`

| Ruta                           | Responsabilidad                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `pages/index.astro`            | Portada del blog: presentación, bitácora de posts (`PostLog`) y temas (`data/blog.ts`)                               |
| `pages/about-me.astro`         | Sobre mí (bento): perfil de LinkedIn, último post, intereses, stack, números y proyectos de GitHub                   |
| `pages/blog/index.astro`       | Archivo: todos los posts en la bitácora (`PostLog byYear`), agrupados por año                                        |
| `pages/blog/[...id].astro`     | Página de cada post (usa `PostLayout`)                                                                               |
| `pages/tags/`                  | Índice de etiquetas y página por etiqueta                                                                            |
| `pages/rss.xml.ts`             | Feed RSS                                                                                                             |
| `layouts/BaseLayout.astro`     | `<head>`, fuentes, tema claro/oscuro (botón `.theme-toggle` + `localStorage`)                                        |
| `layouts/PostLayout.astro`     | Post: barra del sitio, índice (cajón con hover y fijado), hero, contenido; scripts de copiar, fijar y sección activa |
| `components/`                  | `SiteBar`, `SiteFoot`, `PostLog`, `Toc`, `Search` (modal Pagefind), `SearchToggle`, `ThemeToggle`                    |
| `content/blog/*.md`            | Posts (colección `blog`, esquema en `content.config.ts`)                                                             |
| `content.config.ts`            | Esquema zod del frontmatter de los posts                                                                             |
| `data/profile.ts`              | Datos de "Sobre mí" (titular y resumen de LinkedIn, intereses, stack, enlaces, exclusiones de GitHub, respaldo)      |
| `data/blog.ts`                 | Textos de la portada: título, intro y temas del blog                                                                 |
| `assets/avatar.jpg`            | Avatar (copia local del de GitHub), optimizado por `astro:assets` en build                                           |
| `lib/github.ts`                | Datos públicos de GitHub en build, con caché y respaldo                                                              |
| `plugins/dracula-markdown.mjs` | Plugins hast de Sätteri: callouts, cabecera de código, tablas, referencias…                                          |
| `styles/global.css`            | Paleta Dracula/Alucard, estilos del post, la portada y el bento                                                      |
| `utils.ts`                     | `getPosts`, `formatDate`, `tagSlug`, `readingTime`, `postStats`                                                      |
| `consts.ts`                    | Título, descripción y autor del sitio                                                                                |

Fuera de `src/`: `astro.config.mjs` (Shiki + Sätteri), `scripts/docs-tree.mjs` (árbol de docs en `AGENTS.md`), `.claude/settings.json` (hook). Tras `astro build`, `postbuild` ejecuta Pagefind, que indexa los posts (`data-pagefind-body`) en `dist/pagefind/` ([ADR 0006](adr/0006-search-pagefind.md)).

## Flujo de un post

```text
content/blog/x.md ──glob loader──► colección "blog" (zod) ──render()──► Sätteri
   Sätteri: Shiki (tema css-variables) → plugins/dracula-markdown.mjs → ids de títulos
   ──► PostLayout (Toc con headings depth 1-2) ──► /blog/x/
```

## Flujo de datos de GitHub (portada)

```text
about-me.astro ──getGithubData(user, exclude)──► lib/github.ts
   /users/:u + /users/:u/repos?sort=pushed
   ok  ──► stats, proyectos (4 últimos con push)
   error ─► null ──► respaldo de data/profile.ts (el build no falla)
```

Decisiones relacionadas: [ADR 0001](adr/0001-astro-7-satteri-hast-plugins.md), [ADR 0002](adr/0002-shiki-css-variables-theme.md), [ADR 0003](adr/0003-github-data-at-build-time.md) (reemplazado por [ADR 0005](adr/0005-github-data-without-activity.md)), [ADR 0006](adr/0006-search-pagefind.md), [ADR 0007](adr/0007-lucide-icons.md).
