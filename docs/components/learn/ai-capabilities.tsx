import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function AiCapabilities() {
  return (
    <>
      <H3 id="structure">Structure</H3>
      <P>
        The <Code>ai/</Code> directory houses all Python-based intelligence code.
        It is designed to be composable and independent. You can write LangChain
        agents, LlamaIndex RAG pipelines, or direct OpenAI API calls.
      </P>
      <CodeBlock title="ai/ after selecting capabilities">
{`ai/
|-- __init__.py
|-- llm/                      # one folder per provider
|   \`-- anthropic.py          # get_client() -> Anthropic
|-- agents/                   # agent orchestration (when selected)
|-- rag/                      # RAG pipelines (when selected)
|-- tools/                    # custom tools (when selected)
|-- prompts/                  # prompt templates (when selected)
\`-- mcp/                     # MCP servers (when selected)`}
      </CodeBlock>
      <P>
        Each capability is a thin, composable starting point. The LLM provider
        template hands you the official SDK client; capabilities build on it
        without baking combinations into the scaffold:
      </P>
      <CodeBlock file="ai/llm/anthropic.py" title="The provider client">
{`from anthropic import Anthropic

def get_client() -> Anthropic:
    return Anthropic()`}
      </CodeBlock>

      <H3 id="providers">Providers</H3>
      <P>
        The provider is chosen in <Code>bionicjs.config.ts</Code> under the{" "}
        <Code>ai</Code> key, and becomes the <Code>ai</Code> export on{" "}
        <Code>@bionicjs/core/server</Code>:
      </P>
      <Table
        head={["Package", "Provider", "Client"]}
        rows={[
          [<Code key="1">@bionicjs/anthropic</Code>, <Code key="2">Anthropic</Code>, <Code key="3">Anthropic SDK</Code>],
          [<Code key="4">@bionicjs/openai</Code>, <Code key="5">OpenAI</Code>, <Code key="6">OpenAI SDK</Code>],
          [<Code key="7">@bionicjs/google</Code>, <Code key="8">Google / Gemini</Code>, <Code key="9">Google Gemini SDK</Code>],
          [<Code key="10">@bionicjs/ollama</Code>, <Code key="11">Ollama</Code>, <Code key="12">Ollama / local models</Code>],
        ]}
      />
      <P>
        Capabilities live in <Code>ai/</Code>, independent of the provider. The
        same <Code>agents/</Code> or <Code>rag/</Code> code works whether you
        wired Anthropic, OpenAI, Google, or Ollama - the provider client is
        injected, not imported.
      </P>

      <H3 id="calling">Calling from the web</H3>
      <P>
        BionicJS does not reinvent AI abstractions; it provides a structured home for
        them within the full-stack repository. The path from a React button to a
        Python agent:
      </P>
      <Ol
        items={[
          <>The component calls a generated RPC stub by name.</>,
          <>Nitro forwards the call to the Python RPC surface.</>,
          <>The Python function uses the provider client and capabilities in <Code>ai/</Code>.</>,
          <>The result returns through the boundary with its type intact.</>,
        ]}
      />
      <Callout>
        For long-running generation, don&apos;t block the web request. Enqueue a
        background job instead - the same capability, the same boundary, but
        processed by a worker with a WebSocket completion signal. See background
        jobs.
      </Callout>
    </>
  );
}