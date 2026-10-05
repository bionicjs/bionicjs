import { type NavGroup } from "@/lib/sections";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, used for ordering. */
  date: string;
  tags: string[];
};

/**
 * Blog posts live as markdown in `content/blog/<slug>.md` and are rendered
 * through the same pipeline as the docs, so a post can link anywhere.
 *
 * Ordered newest first. Adding a post means adding the file *and* an entry
 * here — `dynamicParams = false` means an unregistered slug 404s.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "should-we-layer-hono-on-nitro",
    title: "Should we layer Hono on Nitro?",
    excerpt:
      "We built a Hono router, never mounted it, then found Nitro already generates a typed client from server/api. Five ways the codegen was wrong, what twelve other frameworks do, and why this ends in a deletion.",
    date: "2026-09-20",
    tags: ["Hono", "Nitro", "Architecture", "Decision"],
  },
  {
    slug: "how-bionicjs-runs",
    title: "How BionicJS runs: dev, build, and production",
    excerpt:
      "One command, two servers, and a dev-only alias. A walk through what bionicjs dev actually starts, why /api is proxied, and what still has to happen before production is at parity.",
    date: "2026-09-14",
    tags: ["Architecture", "Nitro", "Vite"],
  },
  {
    slug: "the-two-copies-of-h3",
    title: "The two copies of h3",
    excerpt:
      "How a scaffolded app ended up with two majors of h3 side by side, why every route 404'd without an error, and why the fix was to stop pinning a version at all.",
    date: "2026-09-14",
    tags: ["Nitro", "h3", "Postmortem"],
  },
  {
    slug: "hono-is-not-our-server",
    title: "Hono is not our server",
    excerpt:
      "We generated a Hono router and told the docs it was the request handler. Neither was true. What Hono is for, what actually serves requests today, and the decision we still owe you.",
    date: "2026-09-14",
    tags: ["Hono", "Architecture", "Correcting the docs"],
  },
  {
    slug: "borrowing-a-server-not-writing-one",
    title: "Borrowing a server, not writing one",
    excerpt:
      "Every full-stack framework answers the same four questions. Here is who answers them how, why Nuxt is our closest sibling, and why Redwood owns our directory layout.",
    date: "2026-09-14",
    tags: ["Architecture", "Comparison"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogAdjacent(slug: string): {
  prev?: BlogPost;
  next?: BlogPost;
} {
  const index = BLOG_POSTS.findIndex((post) => post.slug === slug);
  if (index === -1) return {};
  return {
    // `BLOG_POSTS` is newest-first, so "next" is the older post.
    next: index < BLOG_POSTS.length - 1 ? BLOG_POSTS[index + 1] : undefined,
    prev: index > 0 ? BLOG_POSTS[index - 1] : undefined,
  };
}

export const BLOG_NAV: NavGroup[] = [
  {
    title: "Blog",
    items: [
      { title: "All posts", href: "/blog" },
      ...BLOG_POSTS.map((post) => ({
        title: post.title,
        href: `/blog/${post.slug}`,
      })),
    ],
  },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
