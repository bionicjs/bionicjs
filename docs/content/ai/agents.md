Agents are the composable Python starting point for autonomous workflows. A bionicjs agent wraps your LLM client with a loop over tool calls, so building an agent means defining the tools and letting the model drive.

## Structure

Agents live under the `ai/` folder at the top of your project. The folder only exists when AI is selected.

## A minimal agent

```python
# ai/agents.py
from bionicjs.agents import Agent

agent = Agent(
    instructions="You are a coding assistant.",
    tools=[read_file, write_file],
)
```

```ts
// server/api/agent.ts
import { ai } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event);
  const result = await ai.agents.run(agent, message);
  return result;
});
```

## Good to know

- Agents build on the model client from the provider plugin — the model is foundational, capabilities are opt-in.
- Keep agents thin and composable rather than baking every combination into the scaffold.
- Enable what the feature needs, in Python, next to the route that uses it.