// Plugin hast para Sätteri (procesador de markdown por defecto en Astro 7).
// Replica la estructura del HTML original: callouts, bloques de código con
// cabecera y botón de copiar, tablas con scroll, referencias y task lists.
import { defineHastPlugin } from "satteri";

const el = (tagName, properties = {}, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});
const txt = (value) => ({ type: "text", value });
const cls = (node) => [].concat(node.properties?.className ?? []);

const CALLOUT_MARKER =
  /^\s*\[!(NOTE|TIP|INFO|IMPORTANT|WARN|WARNING|CAUTION|ERROR|DANGER)\]\s*/i;

// Marca de GitHub -> tipo de callout. Sin marca, el callout es un aviso.
const CALLOUT_KIND = {
  NOTE: "note",
  TIP: "note",
  INFO: "info",
  IMPORTANT: "info",
  WARN: "warn",
  WARNING: "warn",
  CAUTION: "caution",
  ERROR: "error",
  DANGER: "error",
};

// Rótulo e icono (trazos de Lucide, 24×24) de cada tipo. Se copian aquí
// porque el plugin corre en build y no puede usar los componentes de Astro.
const CALLOUTS = {
  note: {
    label: "nota",
    icon: [
      ["path", { d: "M13 21h8" }],
      ["path", { d: "m15 5 4 4" }],
      [
        "path",
        {
          d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
        },
      ],
    ], // pencil-line
  },
  info: {
    label: "info",
    icon: [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M12 16v-4" }],
      ["path", { d: "M12 8h.01" }],
    ], // info
  },
  warn: {
    label: "aviso",
    icon: [
      [
        "path",
        {
          d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
        },
      ],
      ["path", { d: "M12 9v4" }],
      ["path", { d: "M12 17h.01" }],
    ], // triangle-exclamation-point
  },
  caution: {
    label: "precaución",
    icon: [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M12 8v4" }],
      ["path", { d: "M12 16h.01" }],
    ], // circle-exclamation-point
  },
  error: {
    label: "error",
    icon: [
      ["path", { d: "m15 9-6 6" }],
      [
        "path",
        {
          d: "M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z",
        },
      ],
      ["path", { d: "m9 9 6 6" }],
    ], // octagon-x
  },
};

const svgIcon = (nodes) =>
  el(
    "svg",
    {
      className: ["callout-icon"],
      xmlns: "http://www.w3.org/2000/svg",
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ariaHidden: "true",
      focusable: "false",
    },
    nodes.map(([tag, attrs]) => el(tag, attrs)),
  );

export const draculaMarkdown = defineHastPlugin({
  name: "dracula-markdown",
  element: [
    // > [!NOTE] ... -> <aside class="callout note"> (ver CALLOUT_KIND); sin marca -> warn
    {
      filter: ["blockquote"],
      visit(node, ctx) {
        let kind = "warn";
        const firstP = node.children.find(
          (c) => c.type === "element" && c.tagName === "p",
        );
        const firstText = firstP?.children?.[0];
        const m =
          firstText?.type === "text"
            ? firstText.value.match(CALLOUT_MARKER)
            : null;
        if (m) {
          kind = CALLOUT_KIND[m[1].toUpperCase()];
          const rest = firstText.value.slice(m[0].length);
          if (rest) ctx.replaceNode(firstText, txt(rest));
          else ctx.removeNode(firstText);
        }
        // <blockquote> -> <aside class="callout ..."> (se envuelve y se marca)
        ctx.setProperty(node, "className", ["callout-body"]);
        ctx.wrapNode(node, el("aside", { className: ["callout", kind] }));
      },
    },
    // <pre> de Shiki -> <div class="code"><pre/></div> (la cabecera se añade en la 2ª pasada)
    {
      filter: ["pre"],
      visit(node, ctx) {
        const lang =
          node.properties?.dataLanguage ||
          node.properties?.["data-language"] ||
          "text";
        ctx.wrapNode(
          node,
          el("div", { className: ["code"], dataLang: String(lang) }),
        );
      },
    },
    // Tablas con scroll horizontal
    {
      filter: ["table"],
      visit(node, ctx) {
        ctx.wrapNode(node, el("div", { className: ["table-wrap"] }));
      },
    },
    // **Referencia:** ... -> <p class="ref">
    {
      filter: ["p"],
      visit(node, ctx) {
        const first = node.children?.[0];
        if (
          first?.type === "element" &&
          first.tagName === "strong" &&
          ctx.textContent(first).trim().startsWith("Referencia")
        ) {
          ctx.setProperty(node, "className", [...cls(node), "ref"]);
        }
      },
    },
    // Task lists interactivas (como en el original)
    {
      filter: ["input"],
      visit(node, ctx) {
        if (node.properties?.type === "checkbox")
          ctx.setProperty(node, "disabled", false);
      },
    },
    // Enlaces externos en pestaña nueva
    {
      filter: ["a"],
      visit(node, ctx) {
        const href = String(node.properties?.href ?? "");
        if (/^https?:\/\//.test(href)) {
          ctx.setProperty(node, "target", "_blank");
          ctx.setProperty(node, "rel", ["noopener"]);
        }
      },
    },
  ],
});

// 2ª pasada: cabecera con lenguaje + botón Copiar dentro de cada div.code
const codeHeader = defineHastPlugin({
  name: "dracula-code-header",
  element: {
    filter: ["div"],
    visit(node, ctx) {
      if (!cls(node).includes("code")) return;
      const lang = String(node.properties?.dataLang ?? "text");
      ctx.prependChild(
        node,
        // data-pagefind-ignore: que "bash Copiar" no salga en los extractos del buscador
        el("div", { className: ["code-head"], dataPagefindIgnore: "all" }, [
          el("span", { className: ["lang"] }, [txt(lang)]),
          el("button", { className: ["copy"], type: "button" }, [
            txt("Copiar"),
          ]),
        ]),
      );
    },
  },
});

// 2ª pasada: cabecera con icono y "// nota", "// aviso"… dentro de cada
// aside.callout, con el mismo aire que la cabecera de los bloques de código.
const calloutHeader = defineHastPlugin({
  name: "dracula-callout-header",
  element: {
    filter: ["aside"],
    visit(node, ctx) {
      const kinds = cls(node);
      if (!kinds.includes("callout")) return;
      const kind = Object.keys(CALLOUTS).find((k) => kinds.includes(k));
      const { label, icon } = CALLOUTS[kind ?? "warn"];
      ctx.prependChild(
        node,
        el("p", { className: ["callout-head"], dataPagefindIgnore: "all" }, [
          svgIcon(icon),
          el("span", { className: ["callout-label"] }, [
            el("span", { ariaHidden: "true" }, [txt("// ")]),
            txt(label),
          ]),
        ]),
      );
    },
  },
});

export const draculaPlugins = [draculaMarkdown, codeHeader, calloutHeader];
