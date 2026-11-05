#!/usr/bin/env node
// Regenera el árbol de docs/ dentro de AGENTS.md (entre los marcadores docs-tree).
//
//   node scripts/docs-tree.mjs           regenera si hay cambios
//   node scripts/docs-tree.mjs --check   sale con 1 si el árbol está desactualizado
//   node scripts/docs-tree.mjs --hook    modo hook de Claude Code: lee el JSON del
//                                        evento por stdin y solo actúa si el archivo
//                                        tocado está dentro de docs/
//
// Ver docs/workflow/docs-and-adrs.md.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const AGENTS = join(ROOT, "AGENTS.md");
const START = "<!-- docs-tree:start -->";
const END = "<!-- docs-tree:end -->";

const args = new Set(process.argv.slice(2));

if (args.has("--hook")) {
  const input = await readStdin();
  let file = "";
  try {
    const event = JSON.parse(input || "{}");
    file = event?.tool_input?.file_path ?? event?.tool_input?.path ?? "";
  } catch {
    process.exit(0); // nunca bloquear al agente por un JSON raro
  }
  const abs = resolve(file);
  if (!file || !(abs === DOCS || abs.startsWith(DOCS + sep))) process.exit(0);
}

const tree = render(DOCS);
// Líneas en blanco alrededor del árbol: así lo deja Prettier y el resultado es estable.
const block = `${START}\n\n${tree}\n\n${END}`;
const agents = readFileSync(AGENTS, "utf8");
const i = agents.indexOf(START);
const j = agents.indexOf(END);
if (i === -1 || j === -1 || j < i) {
  console.error(
    `[docs-tree] No encuentro los marcadores ${START} / ${END} en AGENTS.md`,
  );
  process.exit(args.has("--hook") ? 0 : 1);
}
const next = agents.slice(0, i) + block + agents.slice(j + END.length);

if (next === agents) {
  if (!args.has("--hook")) console.log("[docs-tree] AGENTS.md ya está al día");
  process.exit(0);
}
if (args.has("--check")) {
  console.error(
    "[docs-tree] AGENTS.md está desactualizado: ejecuta npm run docs:tree",
  );
  process.exit(1);
}
writeFileSync(AGENTS, next);
console.log("[docs-tree] Árbol de docs/ actualizado en AGENTS.md");

// ───────────────────────── helpers ─────────────────────────

function render(dir) {
  const rows = [];
  walk(dir, "", rows);
  const width = Math.max(...rows.map((r) => r.left.length));
  const body = rows.map((r) =>
    r.desc ? `${r.left.padEnd(width)}  # ${r.desc}` : r.left,
  );
  return ["```text", "docs/", ...body, "```"].join("\n");
}

/** Filas del árbol: { left: "├── nombre", desc }. */
function walk(dir, prefix, rows) {
  const entries = sortEntries(
    readdirSync(dir).filter((name) => !name.startsWith(".")),
    dir,
  );
  entries.forEach((name, idx) => {
    const full = join(dir, name);
    const last = idx === entries.length - 1;
    const branch = last ? "└── " : "├── ";
    if (statSync(full).isDirectory()) {
      rows.push({ left: `${prefix}${branch}${name}/`, desc: "" });
      walk(full, prefix + (last ? "    " : "│   "), rows);
    } else if (name.endsWith(".md")) {
      rows.push({ left: `${prefix}${branch}${name}`, desc: describe(full) });
    }
  });
}

/** README primero, luego archivos, luego carpetas; alfabético dentro de cada grupo. */
function sortEntries(names, dir) {
  const rank = (n) =>
    n.toLowerCase() === "readme.md"
      ? 0
      : statSync(join(dir, n)).isDirectory()
        ? 2
        : 1;
  return names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/** description del frontmatter → primer "# título" → vacío (con aviso). */
function describe(file) {
  const text = readFileSync(file, "utf8");
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const m = fm[1].match(/^description:\s*(.+)$/m);
    if (m) return unquote(m[1].trim());
  }
  const h1 = text.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  console.warn(
    `[docs-tree] ${relative(ROOT, file)} no tiene description ni título`,
  );
  return "";
}

function unquote(s) {
  return /^(["']).*\1$/.test(s) ? s.slice(1, -1) : s;
}

function readStdin() {
  return new Promise((res) => {
    if (process.stdin.isTTY) return res("");
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => res(data));
  });
}
