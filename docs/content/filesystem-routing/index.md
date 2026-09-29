## The convention {#the-convention}

Routes are files. Every `page.tsx` becomes a URL. Every `layout.tsx` wraps
the routes below it. The file system is the router — no manual
registration needed.

```
app/
├── page.tsx              → /
├── layout.tsx            → wraps all pages
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── layout.tsx        → wraps /blog/* routes
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/:slug
```

## Build-time discovery {#discovery}

When you run `bionicjs dev` or `bionicjs build`, the framework scans `app/` for
page and layout files and builds a route tree — a pure data structure
that maps file paths to URL patterns.

Each node records its path segment and the files that back it, so
dynamic segments like `[slug]` and route groups are resolved before any
browser code runs. The browser never scans the filesystem.

## virtual:bionicjs-routes & React Router {#react-router}

The route tree compiles to a virtual module (`virtual:bionicjs-routes`) that
React Router consumes. Each route becomes a lazy-loaded component:

```ts
// Generated (simplified)
export const routes = [
  {
    path: "/",
    lazy: async () => import("/app/page.tsx"),
    children: [
      { path: "about", lazy: async () => import("/app/about/page.tsx") },
      { path: "blog/:slug", lazy: async () => import("/app/blog/[slug]/page.tsx") },
    ],
  },
];
```

Navigation is client-side. Segments load on demand. No full-page reloads.
