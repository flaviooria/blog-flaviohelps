// Datos de "Sobre mí" (/about-me/) y de la línea de autor de la portada.
// Titular y "Acerca de" vienen de LinkedIn (no se puede leer sin sesión, así
// que se copian a mano). El resto sale de tu perfil público de GitHub.

export const profile = {
  name: "Flavio Oria",
  fullName: "Flavio César Oria Pinto",
  handle: "flaviooria",
  // Titular de LinkedIn: se parte por "|" (el primer trozo es el rol).
  headline:
    "Backend Engineer | Python, FastAPI, Docker y PostgreSQL | Automatización, Arquitectura y Side Projects",
  // Resumen del "Acerca de" de LinkedIn: un párrafo por elemento.
  about: [
    "Soy Flavio, backend engineer. Me dedico al desarrollo de software, pero lo que de verdad me gusta es construir productos: diseñar la idea, programar el backend, automatizar y desplegar hasta verlo funcionando en producción.",
    "En el trabajo desarrollo en Python: APIs, integraciones con sistemas de terceros y despliegues orientados a producción. Fuera de él, los side projects son mi laboratorio para probar tecnologías y arquitecturas con la infraestructura simple y los costes bajo control.",
    "Enfoque práctico: la herramienta adecuada para cada problema, no la que está de moda.",
  ],
  // Temas que me interesan (LinkedIn). Tarjeta "// me interesa".
  interests: [
    "Backend con Python",
    "Diseño y arquitectura de software",
    "FastAPI y APIs",
    "Docker y Kubernetes",
    "Automatización",
    "PostgreSQL",
    "CI/CD",
    "Infraestructura propia y self-hosting",
    "Productos SaaS",
  ],
  // Rol actual y ubicación (deja '' para ocultarlos)
  location: "",
  currentRole: "",
  avatar: "https://avatars.githubusercontent.com/u/60148695?v=4",
  links: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/flaviooria/",
      handle: "in/flaviooria",
    },
    {
      label: "GitHub",
      href: "https://github.com/flaviooria",
      handle: "@flaviooria",
    },
    { label: "X", href: "https://x.com/flavio_oria", handle: "@flavio_oria" },
    { label: "RSS", href: "/rss.xml", handle: "rss.xml" },
  ],
  // Stack agrupado (según tus repos y posts)
  stack: [
    {
      area: "backend",
      items: ["Python", "FastAPI", "PostgreSQL", "Java", "PHP"],
    },
    {
      area: "frontend",
      items: ["TypeScript", "Vue / Nuxt", "Svelte", "Astro"],
    },
    {
      area: "infra",
      items: ["Docker", "Traefik", "Cloudflare", "GitHub Actions", "Terraform"],
    },
    { area: "mobile", items: ["Dart / Flutter"] },
  ],
  // GitHub: los proyectos y los números se rellenan solos en cada build
  // con tus repos públicos ordenados por push más reciente.
  github: {
    user: "flaviooria",
    // Repos que no quieres enseñar en la portada (pruebas, prácticas…).
    // Admite comodines: `*` = cualquier texto, `?` = un carácter (sin distinguir mayúsculas).
    // Ej.: '*test*' oculta another_test, gabi_test_front y test; 'CI_*' ocultaría CI_CP4…
    exclude: ["*test*"],
  },
  // ── Respaldo: solo se usa si GitHub no responde al compilar ──
  stats: { repos: 85, since: 2020 },
  projects: [
    {
      name: "el_contable",
      description:
        "App web para gestionar tus cuentas sin morir en el intento.",
      lang: "Python",
      href: "https://github.com/flaviooria/el_contable",
    },
    {
      name: "infra_traefik",
      description:
        "Plantilla de Traefik con socket proxy para exponer servicios.",
      lang: "Docker",
      href: "https://github.com/flaviooria/infra_traefik",
    },
    {
      name: "harness_agent_ia_tutorial",
      description: "Guía paso a paso para crear un harness de agentes IA.",
      lang: "IA · SDD",
      href: "https://flaviooria.github.io/harness_agent_ia_tutorial/",
    },
    {
      name: "home_iot",
      description: "Domótica casera: backend en Python y frontend en Svelte.",
      lang: "Python · Svelte",
      href: "https://github.com/flaviooria/home_iot",
    },
  ],
};
