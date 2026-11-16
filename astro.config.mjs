// @ts-check
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { createCssVariablesTheme } from "shiki";
import { draculaPlugins } from "./src/plugins/dracula-markdown.mjs";
import { mermaidMarkdown } from "./src/plugins/mermaid.mjs";

// Tema de Shiki basado en variables CSS: los colores salen de la paleta
// Dracula/Alucard definida en src/styles/global.css, así el resaltado
// cambia solo entre modo oscuro y claro.
const draculaVars = createCssVariablesTheme({
  name: "dracula-vars",
  variablePrefix: "--shiki-",
  fontStyle: true,
});

// https://astro.build/config
export default defineConfig({
  // Dominio público: lo usan el RSS y las URLs canónicas
  site: "https://blog.flaviohelps.dev",
  markdown: {
    shikiConfig: { theme: draculaVars },
    // El plugin de Mermaid va primero: sustituye el <pre> de Shiki por un
    // <div class="mermaid"> antes de que Dracula lo envuelva en div.code.
    processor: satteri({
      hastPlugins: [mermaidMarkdown, ...draculaPlugins],
    }),
  },
});
