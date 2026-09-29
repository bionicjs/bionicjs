export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <section className="w-full max-w-xl">
        <div className="mb-6 flex items-center gap-2">
          <img src="/bionicjs.svg" alt="BionicJS" height="32" width="32" />
          <span className="text-[17px] font-semibold tracking-tight">
            bionicjs
          </span>
        </div>

        <h1 className="font-pixel mb-4 text-4xl leading-tight">
          Build for the web.
        </h1>

        <p className="mb-8 text-lg leading-relaxed text-muted">
          A full-stack React meta-framework where TypeScript and Python work seamlessly together.
        </p>

        <div className="mb-8 rounded-lg border border-border bg-card p-5">
          <p className="text-[0.9375rem] text-muted">
            To get started, edit{" "}
            <code className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">
              app/page.tsx
            </code>
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href="https://bionicjs.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-foreground px-6 py-3 text-[0.9375rem] font-semibold text-background"
          >
            Documentation
          </a>

          <a
            href="https://github.com/bionicjs/bionicjs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-6 py-3 text-[0.9375rem] text-foreground"
          >
            GitHub
          </a>
        </div>
      </section>
    </main>
  );
}