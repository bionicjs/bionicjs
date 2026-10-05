import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs-shell";
import { MarkdownContent } from "@/components/markdown-content";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import {
  BLOG_NAV,
  BLOG_POSTS,
  formatDate,
  getBlogAdjacent,
  getBlogPost,
  type BlogPost,
} from "@/lib/blog";
import { markdownToHtml, extractHeadings } from "@/lib/markdown";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: `${post.title} · BionicJS`, description: post.excerpt };
}

function BlogPager({ prev, next }: { prev?: BlogPost; next?: BlogPost }) {
  return (
    <div className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group rounded-xl border border-border p-4 transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-1.5 text-label-12 text-muted-foreground">
            <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Newer
          </span>
          <span className="mt-1.5 block text-label-14 text-foreground">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group rounded-xl border border-border p-4 text-right transition-colors hover:bg-muted"
        >
          <span className="flex items-center justify-end gap-1.5 text-label-12 text-muted-foreground">
            Older
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-1.5 block text-label-14 text-foreground">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const { prev, next } = getBlogAdjacent(slug);
  const html = markdownToHtml(`blog/${slug}`);
  const toc = extractHeadings(`blog/${slug}`);

  return (
    <DocsShell nav={BLOG_NAV} toc={toc.length > 0 ? toc : undefined}>
      <article className="py-8 sm:py-12">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label-12 text-muted-foreground">
          <Link
            href="/blog"
            className="transition-colors hover:text-foreground"
          >
            Blog
          </Link>
          <span aria-hidden className="opacity-40">
            /
          </span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>

        <h1 className="text-heading-40 mt-3">{post.title}</h1>
        <p className="text-copy-16 mt-5 text-muted-foreground">
          {post.excerpt}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-border px-2 py-0.5 text-label-13 text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <MarkdownContent html={html} />
        </div>

        <BlogPager prev={prev} next={next} />
      </article>
    </DocsShell>
  );
}
