// @ts-check
/** Convención: ver docs/conventions/code-style.md y docs/adr/0004-prettier-double-quotes.md */
/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};
