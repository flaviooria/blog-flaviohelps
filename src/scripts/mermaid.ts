// Renderiza los diagramas Mermaid del post en el cliente.
//
// El plugin src/plugins/mermaid.mjs convierte cada bloque ```mermaid en un
// <div class="mermaid"> con el código dentro. Este script carga mermaid.js
// solo si la página tiene diagramas, y los vuelve a pintar cuando cambia el
// tema claro/oscuro: los colores salen de las mismas variables CSS del blog.

import mermaid from "mermaid";

// Paleta Dracula (oscuro) y Alucard (claro), la misma del blog.
const themes = {
  dark: {
    bg: "#282a36",
    deep: "#21222c",
    line: "#44475a",
    fg: "#f8f8f2",
    muted: "#a4a9c5",
    cyan: "#8be9fd",
    green: "#50fa7b",
    orange: "#ffb86c",
    pink: "#ff79c6",
    purple: "#bd93f9",
    red: "#ff5555",
    yellow: "#f1fa8c",
  },
  light: {
    bg: "#fffbeb",
    deep: "#f5f0dc",
    line: "#cfcfde",
    fg: "#1f1f1f",
    muted: "#4f4b3c",
    cyan: "#036a96",
    green: "#14710a",
    orange: "#a34d14",
    pink: "#a3144d",
    purple: "#644ac9",
    red: "#cb3a2a",
    yellow: "#846e15",
  },
};

type Palette = (typeof themes)["dark"];

const currentMode = () =>
  document.documentElement.dataset.theme ??
  (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

const themeVariables = (p: Palette) => ({
  background: p.bg,
  primaryColor: p.deep,
  primaryTextColor: p.fg,
  primaryBorderColor: p.purple,
  secondaryColor: p.bg,
  secondaryTextColor: p.fg,
  secondaryBorderColor: p.pink,
  tertiaryColor: p.bg,
  tertiaryTextColor: p.fg,
  tertiaryBorderColor: p.cyan,
  lineColor: p.line,
  textColor: p.fg,
  mainBkg: p.deep,
  nodeBorder: p.purple,
  clusterBkg: p.bg,
  clusterBorder: p.line,
  edgeLabelBackground: p.bg,
  titleColor: p.purple,
  actorBkg: p.deep,
  actorBorder: p.purple,
  actorTextColor: p.fg,
  actorLineColor: p.line,
  signalColor: p.fg,
  signalTextColor: p.fg,
  labelBoxBkgColor: p.deep,
  labelBoxBorderColor: p.line,
  labelTextColor: p.fg,
  noteBkgColor: p.deep,
  noteTextColor: p.fg,
  noteBorderColor: p.yellow,
  loopTextColor: p.fg,
  activationBkgColor: p.deep,
  activationBorderColor: p.line,
  sequenceNumberColor: p.muted,
  pie1: p.purple,
  pie2: p.cyan,
  pie3: p.green,
  pie4: p.orange,
  pie5: p.pink,
});

const diagrams = Array.from(document.querySelectorAll<HTMLElement>(".mermaid"));

if (diagrams.length > 0) {
  let lastMode: string | null = null;

  // El código fuente se guarda aparte: al pintar, el <pre> se sustituye por
  // el SVG y el original ya no estaría en el DOM para repintar.
  const sources = diagrams.map(
    (el) => el.querySelector("pre")?.textContent ?? "",
  );

  // mermaid.js es un singleton: dos render a la vez se pisan, así que se
  // dibuja de uno en uno.
  const draw = async () => {
    const mode = currentMode();
    lastMode = mode;
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      securityLevel: "loose",
      fontFamily: "var(--mono)",
      themeVariables: themeVariables(themes[mode as keyof typeof themes]),
    });
    for (const [index, el] of diagrams.entries()) {
      try {
        const { svg } = await mermaid.render(
          `mermaid-${index}`,
          sources[index],
        );
        el.innerHTML = svg;
        el.dataset.rendered = "true";
      } catch (err) {
        // Si el diagrama no es válido se deja el código fuente a la vista.
        el.dataset.rendered = "error";
        console.error("Mermaid:", err);
      }
    }
  };

  draw();

  // El SVG lleva los colores incrustados, así que al cambiar de tema hay que
  // volver a pintarlo: no basta con cambiar las variables CSS.
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if (currentMode() !== lastMode) draw();
  });

  new MutationObserver(() => {
    if (currentMode() !== lastMode) draw();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
