import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function TheDevServer() {
  return (
    <>
      <H3 id="orchestration">Orchestration</H3>
      <P>
        When you run <Code>bionicjs dev</Code>, you are starting a master
        orchestrator. It spins up the Vite development server for the React
        frontend, the Nitro development server for the h3 backend, and (if
        Python features are enabled) the FastAPI/Uvicorn development server.
      </P>
      <CodeBlock file="packages/dev/src/index.ts" title="runDevServer">
{`const nitro = await createNitro({ rootDir: cwd, dev: true });
const nitroDevServer = createNitroDevServer(nitro);
await nitroDevServer.listen(nitroPort);

const vite = await createViteServer({
  root: cwd,
  server: {
    port: publicPort,
    strictPort: true,
    proxy: { "/api": \`http://localhost:\${nitroPort}\` },
  },
  plugins: [bionicjsRoutesPlugin(cwd), react()],
});

await vite.listen();`}
      </CodeBlock>
      <P>
        All of these processes run concurrently, sharing a single unified
        terminal output. The orchestrator handles process lifecycle - when the
        dev server exits, it tears down every child process cleanly.
      </P>

      <H3 id="ports">Ports</H3>
      <P>
        The public origin is <Code>localhost:3000</Code>. BionicJS uses{" "}
        <Code>strictPort</Code>, so port conflicts are visible immediately
        rather than silently moving the app to a different port.
      </P>
      <Table
        head={["Process", "Port", "Visibility"]}
        rows={[
          ["Vite (React client)", "3000", "Public - the app origin"],
          ["Nitro (h3 handlers)", "3001", "Internal - only via proxy"],
          ["Python (FastAPI)", "internal", "Internal - only via Nitro RPC"],
        ]}
      />
      <P>
        Because Nitro runs on an internal port, the developer never talks to it
        directly. JavaScript must be loaded by Vite to benefit from HMR and
        module resolution; Nitro handles HTTP directly and can run on any
        internal port without affecting the developer experience.
      </P>

      <H3 id="proxying">Proxying</H3>
      <P>
        To avoid CORS issues and simplify frontend requests, the Vite server is
        configured to proxy all <Code>/api</Code> requests directly to the Nitro
        server. The frontend simply fetches from <Code>/</Code>:
      </P>
      <CodeBlock file="app/page.tsx">
{`const res = await api.users.sayHello({ name: "bionicjs" });
// -> GET /api/users/sayHello (hosted on :3000)
// -> proxied to Nitro on :3001 internally`}
      </CodeBlock>
      <Callout>
        Browsers enforce same-origin for cookies and authorization headers. By
        proxying at the Vite layer, BionicJS keeps everything on one origin - no
        CORS configuration, no <Code>withCredentials</Code> hacks, and cookies
        from auth providers flow naturally.
      </Callout>
      <P>
        In production there is no Vite and no proxy. The single Nitro server
        serves both the static client assets and the API. The application code
        never needs to know which environment it is running in.
      </P>
    </>
  );
}