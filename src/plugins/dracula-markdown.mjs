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

const NOTE_MARKER = /^\s*\[!(NOTE|WARN|WARNING|TIP|INFO|CAUTION)\]\s*/i;

export const draculaMarkdown = defineHastPlugin({
  name: "dracula-markdown",
  element: [
    // > [!NOTE] ...  -> <aside class="callout note">; resto -> callout warn
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
            ? firstText.value.match(NOTE_MARKER)
            : null;
        if (m) {
          const t = m[1].toUpperCase();
          kind = t === "NOTE" || t === "TIP" || t === "INFO" ? "note" : "warn";
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

// 2ª pasada: cabecera "// nota" o "// aviso" dentro de cada aside.callout,
// con el mismo aire que la cabecera de los bloques de código.
const calloutHeader = defineHastPlugin({
  name: "dracula-callout-header",
  element: {
    filter: ["aside"],
    visit(node, ctx) {
      const kinds = cls(node);
      if (!kinds.includes("callout")) return;
      const label = kinds.includes("note") ? "nota" : "aviso";
      ctx.prependChild(
        node,
        el("p", { className: ["callout-head"], dataPagefindIgnore: "all" }, [
          el("span", { ariaHidden: "true" }, [txt("// ")]),
          txt(label),
        ]),
      );
    },
  },
});

export const draculaPlugins = [draculaMarkdown, codeHeader, calloutHeader];
