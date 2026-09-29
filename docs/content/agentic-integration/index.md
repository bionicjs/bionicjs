## Agents that act

Agentic integration builds AI agents that act autonomously: they decide
what to call, in what order, and whether to hand back to a human. bionicjs
provides thin starting points on top of the LLM provider you chose.

## Tool calling

Tools are typed functions your agent can invoke. Declare them next to
your model configuration, and the framework generates the callable
surface your agent uses to act on your app's data.

## MCP

Model Context Protocol servers connect your app's tools and data to
agent clients. Enabling MCP gives you a deterministic server exposing
the same capabilities your tools define.

## Multi-step workflows

Agents can run several steps and re-plan between them. Each step is an
ordinary tool call, so the whole workflow is inspectable, resumable, and
testable like any other code path.

## Human-in-the-loop

Long-running or risky actions hand control back to a person before they
complete. The agent pauses on a defined boundary and resumes only when
the human approves.