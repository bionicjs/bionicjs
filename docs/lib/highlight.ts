import { createHighlighter, type HighlighterGeneric, type ThemeInput } from "shiki";
import vercelDark from "@/lib/themes/vercel-dark.json";
import vercelLight from "@/lib/themes/vercel-light.json";

export type CodeLang =
  | "tsx"
  | "ts"
  | "python"
  | "json"
  | "bash"
  | "toml"
  | "yaml"
  | "css"
  | "sql"
  | "text";

const LANGS: Record<CodeLang, string> = {
  tsx: "tsx",
  ts: "typescript",
  python: "python",
  json: "json",
  bash: "bash",
  toml: "toml",
  yaml: "yaml",
  css: "css",
  sql: "sql",
  text: "text",
};

export interface HighlightToken {
  content: string;
  style: Record<string, string>;
}

export interface HighlightLine {
  tokens: HighlightToken[];
}

export interface HighlightResult {
  lines: HighlightLine[];
  rootStyle: Record<string, string>;
}

const themes: ThemeInput[] = [
  { ...vercelLight, name: "vercel-light" } as unknown as ThemeInput,
  { ...vercelDark, name: "vercel-dark" } as unknown as ThemeInput,
];

let highlighter: HighlighterGeneric<string, string> | null = null;
let highlighterPromise: Promise<HighlighterGeneric<string, string>> | null =
  null;

async function getHighlighter(): Promise<HighlighterGeneric<string, string>> {
  if (highlighter) return highlighter;
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes,
      langs: [...new Set(Object.values(LANGS))],
    }).then((h) => {
      highlighter = h as HighlighterGeneric<string, string>;
      return highlighter;
    });
  }
  return highlighterPromise;
}

function asStyle(style: string | false | undefined): Record<string, string> {
  if (!style) return {};
  return Object.fromEntries(
    style
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const idx = part.indexOf(":");
        return [part.slice(0, idx).trim(), part.slice(idx + 1).trim()];
      }),
  );
}

export async function highlightCode(code: string, lang: CodeLang): Promise<HighlightResult> {
  const highlighter = await getHighlighter();
  const { tokens, rootStyle } = await highlighter.codeToTokens(code, {
    lang: LANGS[lang] ?? "text",
    defaultColor: false,
    themes: {
      light: "vercel-light",
      dark: "vercel-dark",
    },
  });
  return {
    lines: tokens.map((line) => ({
      tokens: line.map((token) => ({
        content: token.content,
        style: token.htmlStyle ?? {},
      })),
    })),
    rootStyle: asStyle(rootStyle),
  };
}

export function inferLang(file?: string): CodeLang {
  if (!file) return "text";
  const ext = file.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
      return "tsx";
    case "ts":
    case "bionicjs":
      return "ts";
    case "py":
      return "python";
    case "json":
      return "json";
    case "sh":
    case "bash":
      return "bash";
    case "toml":
      return "toml";
    case "yaml":
    case "yml":
      return "yaml";
    case "css":
      return "css";
    case "sql":
      return "sql";
    default:
      return "text";
  }
}