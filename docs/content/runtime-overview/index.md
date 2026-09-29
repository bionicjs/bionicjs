## The runtime layer

The runtime layer sits between your code and the platform: cache,
observability, cron, and deployment output. It is thin by design — the
framework owns the boundary, but the platform owns the actual services.

## Cache

Caching lives where the ecosystem puts it. HTTP caching is Nitro's
through `Cache-Control` headers on API routes; client caching is React
Query's concern. bionicjs does not invent a third layer between them.

## Observability

Logs, tracing, and metrics pass through your chosen provider. The server
runtime forwards standard signals so you can plug in your existing
observability stack without exporting new surfaces.

## Cron

Scheduled work is declared next to your application code and executed by
the platform's scheduler on deployment — Vercel Cron, GitHub Actions
schedule events, or a container's own scheduling.

## Deployment output

Every project builds to the standard `.output/` directory via Nitro.
One build, deploy anywhere: Node.js, Cloudflare Workers, Vercel, Deno,
or Bun.