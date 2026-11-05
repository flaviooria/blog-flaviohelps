# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos públicos con el mismo peso:

- **Desarrolladores hispanohablantes** que llegan a un post buscando cómo montar algo concreto (un VPS, una API con FastAPI, un harness de agentes) y quieren una guía que puedan replicar o adaptar a su caso.
- **Reclutadores y posibles clientes** que evalúan a Flavio como profesional. Para ellos, los posts sirven como prueba de criterio y experiencia, y el "Sobre mí" como carta de presentación.

De momento, el público objetivo es hispanohablante.

## Product Purpose

Un cuaderno de bitácora público de Flavio Oria, backend engineer, sobre lo que monta, rompe y arregla: backends en Python, agentes de IA e infraestructura propia.

El éxito, por orden de importancia:

1. Documentar el proceso de sus labs para que la comunidad tenga una guía con la que replicarlos o adaptarlos.
2. Servirle a él mismo como cuaderno personal.
3. Llamar la atención, de paso, de reclutadores y futuros clientes.

## Positioning

Labs reales documentados de principio a fin por quien los ha hecho, con decisiones y sus pros y contras, infraestructura simple y costes bajo control. Es un enfoque práctico: "la herramienta adecuada para cada problema, no la que está de moda". No es un agregador de tutoriales ni un portfolio de agencia.

## Operating Context

- Lectura de posts largos y técnicos con bloques de código, tablas, callouts y un índice lateral. El lector suele tener una terminal abierta al lado para seguir los pasos.
- Navegación por etiquetas, búsqueda (Pagefind, ⌘K / `/`) y RSS.
- El "Sobre mí" se consulta como perfil profesional: titular y resumen de LinkedIn, stack y proyectos públicos de GitHub.

## Capabilities and Constraints

- Sitio estático (Astro 7) que se genera en build. No tiene servidor ni JS de framework en el cliente, solo pequeños scripts.
- Rutas: portada `/`, `/about-me/`, `/blog/`, `/blog/<post>/`, `/tags/`, `/rss.xml`.
- Los datos de GitHub se leen en build y, si la API falla, se usa el respaldo de `src/data/profile.ts`.
- Tema claro/oscuro: sigue el sistema y se puede cambiar a mano.
- Todo el contenido está en español; no hay versión en inglés por ahora.

## Brand Commitments

- Nombre del sitio: "flaviooria · blog". Autor: Flavio Oria (`@flaviooria`).
- Voz: primera persona, cercana y práctica, con algo de humor ("lo que monto, rompo y arreglo", "sin morir en el intento").
- Identidad visual que el autor quiere conservar: sobre todo el **toque de terminal Linux**, y también la paleta Dracula (oscuro) / Alucard (claro), que le gusta mucho.

## Evidence on Hand

- Posts: por ahora solo uno, `src/content/blog/infraestructura-vps.md`.
- Perfil y textos: `src/data/profile.ts` (copiado de LinkedIn) y `src/data/blog.ts`.
- Proyectos y cifras: repos públicos de GitHub `flaviooria`, que se leen en build.
- Avatar: el de GitHub.
- No hay testimonios, clientes, métricas de audiencia ni menciones en prensa. No deben inventarse.

## Product Principles

1. **Replicable antes que vistoso:** cada post tiene que poder seguirse paso a paso; el código, los comandos y las decisiones son el contenido principal.
2. **Proceso honesto:** se cuentan los fallos, los pros y contras y el porqué, no solo el resultado final.
3. **El trabajo habla por el autor:** los reclutadores tienen que ver criterio en los posts y en los proyectos reales, sin promesas ni frases de marketing.
4. **Simple y barato de mantener:** el sitio aplica la misma filosofía de infraestructura simple que defiende.
