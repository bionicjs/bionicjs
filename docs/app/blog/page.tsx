import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { BLOG_NAV, BLOG_POSTS, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog · BionicJS",
  description:
    "Notes on the internals: how the dev server starts, what the two copies of h3 cost us, and why Hono is not our server.",
};

export default function BlogIndexPage() {
  return (
    <DocsShell nav={BLOG_NAV}>
      <div className="py-8 sm:py-12">
        <p className="font-mono text-label-12-mono uppercase tracking-[0.12em] text-muted-foreground">
          Blog
        </p>
        <h1 className="text-heading-40 mt-3">Notes on the internals</h1>
        <p className="text-copy-16 mt-5 max-w-2xl text-muted-foreground">
          How bionicjs actually works: the two servers behind one command,
          the failures that shaped the design, and the decisions we have not
          made yet.
        </p>

        <ul className="mt-10 flex flex-col gap-3">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-border p-5 transition-colors hover:bg-muted"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label-12 text-muted-foreground">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden className="opacity-40">
                    /
                  </span>
                  <span>{post.tags.join(", ")}</span>
                </div>
                <h2 className="text-heading-20 mt-2 text-foreground">
                  {post.title}
                </h2>
                <p className="text-copy-16 mt-2 text-muted-foreground">
                  {post.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-label-14 text-muted-foreground">
            For the reference version of the architecture, start at{" "}
            <Link
              href="/docs/stack"
              className="font-medium text-foreground underline underline-offset-4"
            >
              The stack
            </Link>{" "}
            or read{" "}
            <Link
              href="/learn/why-a-meta-framework"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Learn
            </Link>
            .
          </p>
        </div>
      </div>
    </DocsShell>
  );
}
