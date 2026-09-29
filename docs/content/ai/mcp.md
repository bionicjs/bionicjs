MCP (Model Context Protocol) gives your models standardized access to external tools and data sources. A thin, composable starting point under `ai/` that connects your LLM client to MCP servers.

## What MCP provides

MCP is an open protocol for connecting AI models to tools, resources, and other context. Instead of a hand-rolled integration per tool, everything speaks one protocol.

## A minimal MCP server

```python
# ai/mcp.py
from bionicjs.mcp import mcp, tool

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"Sunny in {city}"

if __name__ == "__main__":
    mcp.run()
```

The server registers tools that the model can call during a session.

## Mounting it

MCP servers run alongside your app in development and are wired into the agent loop when configured:

```ts
// server/api/weather.ts
import { ai } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const { city } = await readBody(event);
  const result = await ai.mcp.call("weather", "get_weather", { city });
  return result;
});
```

## Good to know

- MCP is the standard wiring for agentic workflows and external tool ecosystems.
- Keep servers small and focused on one capability so they compose cleanly.