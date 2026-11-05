---
title: "ADR 0007: Iconos con Lucide (@lucide/astro)"
description: Los iconos son componentes de @lucide/astro, renderizados como SVG en línea en build e importados de uno en uno
---

# ADR 0007: Iconos con Lucide (@lucide/astro)

- **Estado:** Aceptado
- **Fecha:** 2026-11-04

## Contexto

Se quieren iconos en la interfaz (tema, buscador, RSS…) que encajen con la estética de terminal y con el tema claro/oscuro. Alternativas: SVG copiados a mano, una fuente de iconos o una librería de componentes.

## Decisión

- `@lucide/astro` (paquete oficial de Lucide para Astro) como dependencia.
- Cada icono se importa de uno en uno (`import Sun from "@lucide/astro/icons/sun"`), no desde el índice del paquete.
- Se renderizan en build como `<svg>` en línea con `stroke="currentColor"`: heredan el color del texto, así que siguen los tokens y el tema sin CSS extra.
- Tamaño 14px junto a texto mono pequeño y trazo por defecto (2). Si el icono acompaña a un texto o a un `aria-label`, lleva `aria-hidden="true"`.

## Consecuencias

- No se envía JS al navegador ni se pide nada a un CDN; solo el SVG de cada icono usado.
- Lucide no incluye logos de marca (LinkedIn, GitHub, X): para eso habría que añadir SVG propios.
- Nombres de iconos en [lucide.dev/icons](https://lucide.dev/icons).
