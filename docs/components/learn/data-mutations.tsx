import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function DataMutations() {
  return (
    <>
      <H3 id="forms">Forms</H3>
      <P>
        BionicJS recommends using standard React Server Functions (or equivalent
        mutation patterns like React Query) to send data from the client to the
        server.
      </P>
      <CodeBlock file="app/page.tsx" title="A mutation from the client">
{`const result = await api.users.updateProfile({
  id: "user_123",
  name: form.name,
});`}
      </CodeBlock>
      <P>
        Mutations are typed RPC calls, the same as any other fetch. The form
        submits to <Code>server/api/</Code> endpoints, where input is validated
        using Zod before being processed by the h3 handler and passed down to
        the database or Python layer.
      </P>

      <H3 id="validation">Validation</H3>
      <P>
        Validation happens at the server boundary, not in the component. The
        schema that validates the input is the same schema that types the call -
        so what the client sends is what the server checked:
      </P>
      <CodeBlock file="server/api/users/update-profile.ts">
{`const UpdateProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, UpdateProfileSchema.safeParse);
  const row = await db.update(users)
    .set({ name: body.name })
    .where(eq(users.id, body.id))
    .returning();
  return row;
});`}
      </CodeBlock>
      <P>
        The flow is predictable: the client sends a typed payload, the server
        validates it against the schema, and an invalid request fails fast -
        before any database write or Python roundtrip.
      </P>

      <H3 id="to-python">To Python</H3>
      <P>
        When the mutation needs intelligence - a generated embedding, a content
        rewrite, a classification - it crosses to Python through the typed RPC
        boundary:
      </P>
      <CodeBlock title="A mutation that needs Python">
{`export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, UpdateProfileSchema.safeParse);
  const summary = await generateSummary(body.bio); // -> Python RPC
  const row = await db.update(profiles)
    .set({ summary })
    .where(eq(profiles.id, body.id));
  return row;
});`}
      </CodeBlock>
      <P>
        The mutation is a single handler. The database write and the Python call
        are both typed, both contained in one file, and both executed in one
        request - no second service, no untyped JSON handshake.
      </P>
      <Callout>
        If the Python work is slow, don&apos;t hold the request open. Return
        immediately, enqueue a background job, and send the result over
        WebSocket when the worker finishes. The mutation boundary stays the same;
        only the timing changes.
      </Callout>
    </>
  );
}