import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function PythonExecutionModel() {
  return (
    <>
      <H3 id="runtime">Runtime</H3>
      <P>
        When a BionicJS project includes Python capabilities (AI, Jobs),{" "}
        <Code>bionicjs dev</Code> spawns a Python child process. This process runs a
        FastAPI server that handles RPC calls from the Nitro server.
      </P>
      <CodeBlock title="Process topology">
{`bionicjs dev
  |-- Vite (:3000)          # the React client
  |-- Nitro (:3001)         # the API / h3 handlers
  \`-- Python (internal)     # FastAPI RPC surface (only when ai//jobs/ exist)`}
      </CodeBlock>
      <P>
        The Python process is started and managed by the dev orchestrator. It
        picks up its dependencies from <Code>pyproject.toml</Code>, and it is
        torn down cleanly when the dev server exits. The developer never starts
        it separately.
      </P>
      <P>
        The FastAPI server is the RPC surface, not a public API. It is reached
        from Nitro over an internal channel - never from the browser. There is
        no CORS, no OAuth flow, and no public route for the browser to hit.
      </P>

      <H3 id="dev-vs-prod">Dev versus production</H3>
      <P>
        Everything about the Python process is environment-dependent:
      </P>
      <Table
        head={["Concern", "Development", "Production"]}
        rows={[
          ["Process", "Spawned by bionicjs dev", "Supervised (container / systemd)"],
          ["Channel", "Internal localhost", "Same container or private network"],
          ["Dependencies", "Installed on demand", "Locked in pyproject.toml / lockfile"],
          ["Failures", "Logged to unified terminal", "Container restart policy"],
        ]}
      />
      <P>
        Key management is the same in both environments: each provider template
        writes its expected variables into <Code>.env.example</Code>, and the
        Python code reads them from the environment.
      </P>

      <H3 id="deployment">Deployment</H3>
      <P>
        In production, the deployment model can either run both Node.js and
        Python in the same container, or split them into separate microservices
        communicating over a private network. BionicJS generates the Dockerfiles and
        configurations to support either model.
      </P>
      <CodeBlock title="Two deployment shapes">
{`same unit                     split services
+--------------+              +---------+   +---------+
| nitro server |  <--Python-> | nitro   |   | fastapi |
| python proc  |              | server  |<->| worker  |
+--------------+              +---------+   +---------+
   simpler                        cloud-native scale-outs`}
      </CodeBlock>
      <Callout>
        The RPC contract is the same in both shapes. The only change between
        "same container" and "microservices" is where the Python process runs -
        the generated client points at a local socket in one case and a private
        network address in the other. Your code does not change.
      </Callout>
    </>
  );
}