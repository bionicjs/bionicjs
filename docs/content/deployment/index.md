## Build output {#build-output}
bionicjs projects build to a standard `.output/` directory via Nitro. One build, deploy anywhere — the client is static assets and the server is a runnable bundle, with Nitro presets carrying over unchanged.

## Nitro presets {#nitro-presets}
Each platform maps to a Nitro preset:

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "node_server" }, // or vercel, netlify, cloudflare_module, deno_deploy, aws_lambda
});
```

## Vercel {#platform-vercel}
Static assets on the Vercel edge network, API routes as serverless functions, preview deploys per branch.

## Netlify {#platform-netlify}
Static client + Netlify Functions for server routes, branch-based previews.

## Cloudflare Workers {#platform-cloudflare}
The server runs at the edge in 100+ locations via `wrangler deploy`.

## Deno Deploy {#platform-deno}
The web client served statically and the API running on Deno at the edge.

## Fly.io {#platform-flyio}
A long-lived Node.js process in containers — persistent volumes, regional placement, no cold starts.

## Railway {#platform-railway}
Managed container platform with dashboard secrets, metrics, and scale controls.

## Render {#platform-render}
Web service out of a Git connection with auto-deploys, managed SSL, and managed Postgres.

## AWS Lambda {#platform-aws}
Serverless function behind API Gateway, static assets from S3 + CloudFront.

## Node.js / Docker {#platform-node}
The default `node_server` output runs anywhere Docker does — your own VPS, Kubernetes, or a container platform.