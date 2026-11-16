// Plugin hast para Sätteri: convierte los bloques ```mermaid en contenedores
// <div class="mermaid"> que mermaid.js dibuja en el cliente.
//
// Va antes que el plugin de Dracula en la lista de plugins: así el <pre> de
// Shiki se sustituye por completo y no recibe la cabecera con el botón
// "Copiar", que no tiene sentido para un diagrama.
//
// El código fuente se saca con textContent(): Shiki ya lo ha tokenizado en
// <span>, pero el texto concatenado es el original.
import { defineHastPlugin } from "satteri";

const el = (tagName, properties = {}, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});
const txt = (value) => ({ type: "text", value });

// Sätteri escapa el texto en el HTML, pero textContent() lo devuelve tal cual
// (sin &amp; ni &lt;). Mermaid necesita el texto plano para que los nodos
// como A["a & b"] se dibujen bien.
export const mermaidMarkdown = defineHastPlugin({
  name: "mermaid-markdown",
  element: {
    filter: ["pre"],
    visit(node, ctx) {
      const lang = String(
        node.properties?.dataLanguage ||
          node.properties?.["data-language"] ||
          "",
      )
        .toLowerCase()
        .trim();
      if (lang !== "mermaid") return;

      const source = ctx.textContent(node).replace(/\n+$/, "");

      // <pre> -> <div class="mermaid"> con el código dentro. El texto va en un
      // <pre class="mermaid-source"> para que, si mermaid.js no carga, se vea
      // el código en lugar de un hueco en blanco.
      ctx.replaceNode(
        node,
        el("div", { className: ["mermaid"] }, [
          el("pre", { className: ["mermaid-source"] }, [txt(source)]),
        ]),
      );
    },
  },
});
