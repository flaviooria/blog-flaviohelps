// Datos públicos de GitHub, pedidos en tiempo de build (la web sigue siendo estática).
// Si algo falla (sin red, cuota agotada) devuelve null y la portada usa los datos
// manuales de src/data/profile.ts. Con GITHUB_TOKEN en el entorno hay más cuota.

const API = "https://api.github.com";

export interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  url: string;
  pushedAt: Date;
}

export interface GithubData {
  publicRepos: number;
  since: number;
  repos: GithubRepo[];
}

async function gh<T>(path: string): Promise<T> {
  const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "astro-blog-build",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} en ${path}`);
  return res.json() as Promise<T>;
}

const cache = new Map<string, Promise<GithubData | null>>();

export function getGithubData(
  user: string,
  exclude: string[] = [],
): Promise<GithubData | null> {
  const key = `${user}|${exclude.join(",")}`;
  if (!cache.has(key)) cache.set(key, load(user, exclude));
  return cache.get(key)!;
}

async function load(
  user: string,
  exclude: string[],
): Promise<GithubData | null> {
  try {
    const [profile, rawRepos] = await Promise.all([
      gh<{ public_repos: number; created_at: string }>(`/users/${user}`),
      gh<any[]>(`/users/${user}/repos?sort=pushed&per_page=30&type=owner`),
    ]);

    const skip = [user, ...exclude].map(globToRegExp);
    const repos: GithubRepo[] = rawRepos
      .filter(
        (r) =>
          !r.fork &&
          !r.archived &&
          !r.private &&
          !skip.some((re) => re.test(String(r.name))),
      )
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        url: r.homepage || r.html_url,
        pushedAt: new Date(r.pushed_at),
      }))
      .sort((a, b) => b.pushedAt.valueOf() - a.pushedAt.valueOf());

    return {
      publicRepos: profile.public_repos,
      since: new Date(profile.created_at).getFullYear(),
      repos,
    };
  } catch (err) {
    console.warn(
      `[github] No se pudieron obtener los datos de GitHub, uso los de profile.ts: ${(err as Error).message}`,
    );
    return null;
  }
}

/** Patrón tipo glob → RegExp: `*` = cualquier cosa, `?` = un carácter. Sin distinguir mayúsculas. */
function globToRegExp(pattern: string): RegExp {
  const body = pattern
    .split("")
    .map((ch) =>
      ch === "*"
        ? ".*"
        : ch === "?"
          ? "."
          : ch.replace(/[.+^${}()|[\]\\]/g, "\\$&"),
    )
    .join("");
  return new RegExp(`^${body}$`, "i");
}
