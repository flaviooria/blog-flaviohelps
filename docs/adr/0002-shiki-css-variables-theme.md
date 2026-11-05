---
title: "ADR 0002: Resaltado con tema Shiki de variables CSS"
description: Shiki usa un tema css-variables mapeado a la paleta, así el código cambia con el tema claro/oscuro
---

# ADR 0002: Resaltado con tema Shiki de variables CSS

- **Estado:** Aceptado
- **Fecha:** 2026-11-03

## Contexto

El sitio tiene modo oscuro (Dracula) y claro (Alucard). Shiki trae el tema `dracula`, pero no Alucard, y los temas dobles de Shiki obligan a mantener dos temas y CSS extra para seguir el botón de tema propio.

## Decisión

Tema creado con `createCssVariablesTheme` (de `shiki`) en `astro.config.mjs`. En `global.css`, las variables `--shiki-token-*` apuntan a los tokens de la paleta (`--pink` para keywords, `--yellow` para cadenas…).

## Consecuencias

- Un solo juego de estilos: el resaltado cambia con el tema sin JS extra.
- El resaltado es algo menos fino que un tema TextMate completo (menos categorías de token).
- Si cambia la paleta, el código se adapta solo.
