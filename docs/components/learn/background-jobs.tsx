import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function BackgroundJobs() {
  return (
    <>
      <H3 id="workers">Workers</H3>
      <P>
        Long-running AI tasks shouldn&apos;t block the web request. The{" "}
        <Code>jobs/</Code> directory integrates task queues like Celery or
        Dramatiq.
      </P>
      <CodeBlock title="jobs/ after selecting a system">
{`jobs/
|-- __init__.py
\`-- celery/
    |-- __init__.py
    \`-- celery_app.py          # the Celery app + broker wiring`}
      </CodeBlock>
      <CodeBlock file="jobs/celery/celery_app.py" title="The worker app">
{`import os
from celery import Celery

celery_app = Celery(
    "{{appName}}",
    broker=os.environ["CELERY_BROKER_URL"],
)

celery_app.autodiscover_tasks()`}
      </CodeBlock>
      <P>
        The system is chosen in <Code>bionicjs.config.ts</Code> under the{" "}
        <Code>jobs</Code> key. The system accepts a broker URL; RQ is Redis-only
        by design, while Celery and Dramatiq take Redis or RabbitMQ.
      </P>

      <H3 id="flow">The flow</H3>
      <P>
        When a user triggers an AI generation in the React frontend, the request
        goes to Nitro, which enqueues a job in Redis. The Python worker picks it
        up, processes it, and updates a database or sends a WebSocket message
        back to the client upon completion.
      </P>
      <CodeBlock title="The enqueue-to-complete lifecycle">
{`React button
      |  api.generateReport()          # typed RPC stub
      v
Nitro handler
      |  jobs.enqueue("generate", { ... })
      v
Redis queue
      ^
      |  picks up the task
Python worker
      |  runs the job
      |  writes result / emits WebSocket event
      v
React receives the result`}
      </CodeBlock>
      <P>
        The enqueue client becomes the <Code>jobs</Code> export on{" "}
        <Code>@bionicjs/core/server</Code>, so any Nitro handler can enqueue work:
      </P>
      <CodeBlock file="server/api/generate.ts">
{`import { jobs } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await jobs.enqueue("generate.report", { userId: body.userId });
  return { queued: true };
});`}
      </CodeBlock>

      <H3 id="why-python">Why Python workers</H3>
      <P>
        Jobs exist because of the same honest baseline as the rest of BionicJS: the
        mature workers are Python. Celery, RQ, and Dramatiq are battle-tested,
        and the AI work they run lives in the Python ecosystem.
      </P>
      <Table
        head={["System", "Broker", "Notable"]}
        rows={[
          [<Code key="1">Celery</Code>, "Redis or RabbitMQ", "Autodiscovery, task routing"],
          [<Code key="2">RQ</Code>, "Redis only", "The simplest entry point"],
          [<Code key="3">Dramatiq</Code>, "Redis or RabbitMQ", "Lightweight, actor-style"],
        ]}
      />
      <Callout>
        A job is one function in <Code>jobs/</Code> plus one enqueue call in a
        handler - a sync boundary, not a new architecture. Deploy the worker
        alongside the Python process using the generated configurations.
      </Callout>
    </>
  );
}