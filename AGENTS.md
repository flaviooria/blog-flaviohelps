# AGENTS.md

Blog estático con Astro 7 y estilo Dracula/Alucard. Este archivo es el punto de entrada para agentes.

## Cómo orientarte

1. **Lee primero el árbol de `docs/` de abajo.** Cada línea dice qué contiene ese doc.
2. Abre **solo** el doc que corresponda a tu tarea. Para saber dónde está algo en el código, usa `docs/architecture.md` antes de recorrer `src/`.
3. Lee código únicamente para los archivos que vayas a tocar.

## Reglas

- Si cambias una convención, actualiza su doc en `docs/conventions/` en el mismo cambio.
- Si tomas una decisión de arquitectura, crea un ADR desde `docs/adr/0000-template.md`.
- Todo doc nuevo lleva frontmatter con `title` y `description` (una línea; es lo que sale en el árbol).
- Antes de terminar: `npm run format:check` y `npm run build` (ver `docs/workflow/development.md`).

## Docs

El bloque siguiente se genera con `scripts/docs-tree.mjs`; **no lo edites a mano**. Se regenera solo al crear o editar docs (hook de Claude Code) y en `npm run dev`/`build`.

<!-- docs-tree:start -->

```text
docs/
├── README.md                                 # Qué hay en docs/ y cómo añadir un doc o un ADR
├── architecture.md                           # Mapa del código (qué hay en cada carpeta de src/) y flujo de datos de posts y GitHub
├── adr/
│   ├── 0000-template.md                      # Plantilla para nuevos ADRs (copiar con el siguiente número)
│   ├── 0001-astro-7-satteri-hast-plugins.md  # El markdown se procesa con Sätteri (por defecto en Astro 7) y plugins hast propios, no con unified/rehype
│   ├── 0002-shiki-css-variables-theme.md     # Shiki usa un tema css-variables mapeado a la paleta, así el código cambia con el tema claro/oscuro
│   ├── 0003-github-data-at-build-time.md     # Portada con actividad y proyectos de la API pública de GitHub en build, exclusión por glob y respaldo en profile.ts
│   ├── 0004-prettier-double-quotes.md        # El formato lo impone Prettier (con prettier-plugin-astro) usando sus valores por defecto, comillas dobles incluidas
│   ├── 0005-github-data-without-activity.md  # Reemplaza a 0003; la portada ya no muestra "últimos movimientos" y GitHub solo aporta números y proyectos
│   ├── 0006-search-pagefind.md               # Búsqueda de posts con Pagefind (índice en postbuild, modal ⌘K propio) y cuándo y cómo migrar a Algolia
│   └── 0007-lucide-icons.md                  # Los iconos son componentes de @lucide/astro, renderizados como SVG en línea en build e importados de uno en uno
├── conventions/
│   ├── code-style.md                         # TypeScript strict, estructura de componentes Astro, nombres, Prettier (comillas dobles) y comentarios
│   ├── content.md                            # Frontmatter de un post, títulos #/## para el índice, callouts [!NOTE], referencias, badges y task lists
│   └── styling.md                            # Paleta Dracula/Alucard como tokens CSS, tema claro/oscuro, tipografía, bento y responsive
└── workflow/
    ├── development.md                        # Comandos (dev en background, build, format), cómo verificar un cambio y variables de entorno
    └── docs-and-adrs.md                      # Cuándo escribir o actualizar un doc o un ADR, numeración, estados y cómo se regenera el árbol de AGENTS.md
```

<!-- docs-tree:end -->

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Astro documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles](https://docs.astro.build/en/guides/styling/)
