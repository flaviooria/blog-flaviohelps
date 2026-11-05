import { getCollection, type CollectionEntry } from "astro:content";

export async function getPosts(): Promise<CollectionEntry<"blog">[]> {
  const posts = await getCollection(
    "blog",
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Minutos de lectura aproximados (~220 palabras/min, sin contar bloques de código). */
export function readingTime(body = ""): number {
  const prose = body.replace(/```[\s\S]*?```/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Nº de capítulos (# ) y de bloques de código de un post. */
export function postStats(body = "") {
  const noCode = body.replace(/```[\s\S]*?```/g, "");
  return {
    chapters: (noCode.match(/^# /gm) ?? []).length,
    codeBlocks: Math.floor((body.match(/^[ \t]*```/gm) ?? []).length / 2),
  };
}
