import { DOCS_NAV } from "@/lib/sections";

export async function GET() {
  const lines = [
    "# bionicjs docs",
    "",
    "> bionicjs is a fullstack framework. One command builds a project where TypeScript owns the web (a React client and a Nitro server) and Python owns AI and background jobs. Everything is composed from small, independent template packages instead of baked-in boilerplate.",
    "",
    ...DOCS_NAV.flatMap((group) => [
      `### ${group.title}`,
      "",
      ...group.items.map(
        (item) => `- [${item.title}](${baseUrl(item.href)})`
      ),
      "",
    ]),
  ];

  return new Response(lines.join("\n").trimEnd() + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function baseUrl(path: string): string {
  return `https://bionicjs.dev${path}`;
}
