// Textos de la portada (/): de qué va el blog y qué temas trata.
// `icon` es el nombre de un icono de Lucide importado en src/pages/index.astro.

export const blog = {
  // Segunda frase del H1, tras "Hola, soy <nombre>, te doy la bienvenida."
  title: "Aquí construyo, despliego y te lo cuento.",
  intro:
    "Un cuaderno de bitácora sobre lo que monto, rompo y arreglo: backends en Python, agentes de IA e infraestructura propia. Guías prácticas, decisiones con sus pros y contras, y side projects que acaban (o no) en producción.",
  topics: [
    {
      icon: "bot",
      title: "IA y agentes",
      text: "Harness de agentes, SDD y cómo integrar modelos en productos reales sin perder el control.",
      stack: ["Agentes", "LLMs", "SDD", "Automatización"],
    },
    {
      icon: "server",
      title: "Backend",
      text: "APIs con Python y FastAPI, diseño y arquitectura de software, y bases de datos que aguantan.",
      stack: ["Python", "FastAPI", "PostgreSQL", "Arquitectura"],
    },
    {
      icon: "container",
      title: "Infra y self-hosting",
      text: "VPS, contenedores y CI/CD para desplegar side projects con poca infraestructura y costes bajo control.",
      stack: [
        "Docker Compose",
        "Traefik",
        "Cloudflare",
        "GitHub Actions",
        "k3s",
      ],
    },
  ],
} as const;
