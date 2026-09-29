import { type NavGroup } from "@/lib/sections";

export type LearnChapter = {
  slug: string;
  title: string;
  blurb: string;
};

export type LearnPart = {
  title: string;
  blurb: string;
  chapters: LearnChapter[];
};

export const LEARN_PARTS: LearnPart[] = [
  {
    title: "Foundations",
    blurb: "Why the framework exists and the trade-offs it commits to.",
    chapters: [
      {
        slug: "why-a-meta-framework",
        title: "Why a meta-framework",
        blurb: "What React leaves to you, and the layer BionicJS adds on top.",
      },
      {
        slug: "the-honest-baseline",
        title: "The honest baseline",
        blurb: "The status quo of gluing two runtimes, and the bridge that replaces it.",
      },
    ],
  },
  {
    title: "The routing engine",
    blurb: "How files become routes, components, and a typed manifest.",
    chapters: [
      {
        slug: "filesystem-routing",
        title: "Filesystem routing",
        blurb: "The folder convention and the route tree it produces.",
      },
      {
        slug: "the-parser-and-manifest",
        title: "The parser and manifest",
        blurb: "Reading the tree, transforming segments, catching conflicts.",
      },
      {
        slug: "virtual-modules",
        title: "Virtual modules",
        blurb: "Generated entry points and lazy route loading.",
      },
      {
        slug: "layout-adaptation",
        title: "Layout adaptation",
        blurb: "Mapping framework layouts onto React Router without an Outlet.",
      },
    ],
  },
  {
    title: "Build and dev",
    blurb: "The machinery behind `create-bionicjs-app`, `bionicjs dev`, and `bionicjs build`.",
    chapters: [
      {
        slug: "project-generator",
        title: "The project generator",
        blurb: "How templates compose into a project, and how their files merge.",
      },
      {
        slug: "vite-and-nitro",
        title: "Vite and Nitro",
        blurb: "Why there is no index.html, and how the two engines sit inside BionicJS.",
      },
      {
        slug: "the-dev-server",
        title: "The dev server",
        blurb: "Orchestrating engines, ports, and the API proxy.",
      },
      {
        slug: "hmr-and-watchers",
        title: "HMR and watchers",
        blurb: "Chokidar, invalidation, and what reloads when a file changes.",
      },
      {
        slug: "bionicjs-config",
        title: "bionicjs.config.ts",
        blurb: "The file, the plugins, and the runtime exports it drives.",
      },
      {
        slug: "build-pipeline",
        title: "The build pipeline",
        blurb: "One artifact, prerendering, and deployment targets.",
      },
    ],
  },
  {
    title: "The server runtime",
    blurb: "Request handling, proxying, and the edge story.",
    chapters: [
      {
        slug: "server-and-hono",
        title: "The server runtime",
        blurb: "Nitro, the h3 handler layer, and the generated Hono RPC contract.",
      },
      {
        slug: "api-proxying",
        title: "API proxying",
        blurb: "How server routes are intercepted and forwarded.",
      },
      {
        slug: "middleware-and-edge",
        title: "Middleware and edge",
        blurb: "The request lifecycle and where edge code runs.",
      },
    ],
  },
  {
    title: "The Python bridge",
    blurb: "Running Python, and the typed contract that crosses the boundary.",
    chapters: [
      {
        slug: "python-execution-model",
        title: "The Python execution model",
        blurb: "Runtime, dev versus production, and deployment.",
      },
      {
        slug: "the-rpc-boundary",
        title: "The RPC boundary",
        blurb: "Communication, generation, and the contract Python exposes.",
      },
    ],
  },
  {
    title: "Capabilities",
    blurb: "How each first-class capability is wired internally.",
    chapters: [
      {
        slug: "ai-capabilities",
        title: "AI capabilities",
        blurb: "Structure, providers, and calling Python from the web.",
      },
      {
        slug: "background-jobs",
        title: "Background jobs",
        blurb: "Workers, the job flow, and why the workers are Python.",
      },
      {
        slug: "data-mutations",
        title: "Data mutations",
        blurb: "Forms, validation, and round-tripping to Python.",
      },
      {
        slug: "auth-flow",
        title: "The auth flow",
        blurb: "Integration, server-side verification, and protecting routes.",
      },
      {
        slug: "database-access",
        title: "Database access",
        blurb: "The provider matrix, the client, and the rules.",
      },
    ],
  },
];

export const LEARN_CHAPTERS: LearnChapter[] = LEARN_PARTS.flatMap(
  (part) => part.chapters
);

export const LEARN_NAV: NavGroup[] = LEARN_PARTS.map((part) => ({
  title: part.title,
  items: part.chapters.map((chapter) => ({
    title: chapter.title,
    href: `/learn/${chapter.slug}`,
  })),
}));

export function learnPartOf(slug: string): LearnPart | undefined {
  return LEARN_PARTS.find((part) =>
    part.chapters.some((chapter) => chapter.slug === slug)
  );
}

export function getLearnChapter(slug: string): LearnChapter | undefined {
  return LEARN_CHAPTERS.find((chapter) => chapter.slug === slug);
}

export function getLearnAdjacent(slug: string): {
  prev?: LearnChapter;
  next?: LearnChapter;
} {
  const index = LEARN_CHAPTERS.findIndex((chapter) => chapter.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? LEARN_CHAPTERS[index - 1] : undefined,
    next: index < LEARN_CHAPTERS.length - 1 ? LEARN_CHAPTERS[index + 1] : undefined,
  };
}