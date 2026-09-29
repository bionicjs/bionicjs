import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function ApiProxying() {
  return (
    <>
      <H3 id="interception">Interception</H3>
      <P>
        In development, <Code>bionicjs dev</Code> exposes one public origin:{" "}
        <Code>localhost:3000</Code>. Any request starting with <Code>/api</Code>{" "}
        is intercepted by the Vite dev server and forwarded to the internal
        Nitro server running on port 3001:
      </P>
      <CodeBlock file="packages/dev/src/index.ts" title="The proxy rule">
{`server: {
  port: publicPort,
  strictPort: true,
  proxy: {
    "/api": \`http://localhost:\${nitroPort}\`,
  },
},`}
      </CodeBlock>
      <P>
        The developer sees only one origin, and the browser sees only one
        origin. Requests to <Code>/api/...</Code> never trigger CORS, never
        carry a different host header, and never need the frontend to know
        where the backend actually lives.
      </P>
      <CodeBlock title="Request flow in development">
{`browser --fetch("/api/auth/login")--
      Vite (:3000)
      --proxy--> Nitro (:3001)
      --handler--> h3 handler
      --rpc--> Python (optional)`}
      </CodeBlock>

      <H3 id="dev-vs-prod">Dev vs production</H3>
      <P>
        The application code never needs to know whether it is running in dev
        or prod - it simply fetches <Code>/api</Code>. The difference is only
        in the routing layer:
      </P>
      <Table
        head={["Concern", "Development", "Production"]}
        rows={[
          ["API serving", "Vite proxy to Nitro", "Nitro serves /api directly"],
          ["Static assets", "Served by Vite with HMR", "Served by Nitro from public/"],
          ["Unknown routes", "Vite SPA fallback", "Nitro SPA fallback"],
          ["Origins", "One public origin (:3000)", "One origin (your domain)"],
        ]}
      />
      <P>
        In production, the Nitro server itself handles the <Code>/api</Code>{" "}
        routes natively, while serving static files and the React application
        fallback for everything else. There is no proxy, no second process, and
        no extra hop - the same artifact that serves your HTML also serves your
        API.
      </P>
      <Callout>
        Because the client never hardcodes a backend host, you can move where
        the API runs - local dev, a VPS, an edge worker - without touching
        frontend code. The proxy layer is configuration, not application logic.
      </Callout>
    </>
  );
}