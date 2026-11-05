# Blog (Astro + Dracula)

Blog estático con Astro 7, estilo Dracula (oscuro) / Alucard (claro), creado a partir de `infraestructura_vps.html`.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # genera ./dist
npm run preview
```

## Documentación

Convenciones, workflow y decisiones de arquitectura (ADRs) en [`docs/`](docs/README.md):

- Escribir un post: [`docs/conventions/content.md`](docs/conventions/content.md)
- Mapa del código: [`docs/architecture.md`](docs/architecture.md)
- Comandos y verificación: [`docs/workflow/development.md`](docs/workflow/development.md)

Los agentes empiezan por [`AGENTS.md`](AGENTS.md).
