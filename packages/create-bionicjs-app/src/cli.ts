import { stderr, stdin, stdout } from "node:process";
import { basename } from "node:path";

import { generateProject } from "./generate.ts";
import {
  aiTemplates,
  authTemplates,
  brokerTemplates,
  databaseTemplates,
  isUnsafeDirName,
  jobsTemplates,
  toolkitTemplates,
  resolveTemplatePaths,
  type Selection,
  type TemplateChoice,
} from "./prompts.ts";

/** Lazily loaded so flag-driven (non-TTY) runs need no node_modules. */
type ClackPrompts = typeof import("@clack/prompts");

const NONE = "none";

const BANNER = String.raw` _
| |_ ___ _ __  _   _
| __/ __| '_ \| | | |
| |_\__ \ |_) | |_| |
 \__|___/ .__/ \__, |
        |_|    |___/`;

const USAGE = `Usage:
  create-bionicjs-app <project-name> [options]
  create-bionicjs-app . [options]              create in the current directory

Creates a BionicJS application at ./<project-name> by composing templates.

Options:
  --auth <provider>     better-auth, clerk, firebase, supabase, workos
  --database <db>       sqlite, postgresql, none (default: none)
  --toolkit <toolkit>   prisma, drizzle, kysely, sql (default: sql)
  --ai <capability,...> llm/openai, llm/anthropic, llm/google, llm/ollama,
                        agents, rag, tools, prompts, mcp
  --jobs <system>       celery, rq, dramatiq
  --broker <broker>     redis, rabbitmq (default: redis when --jobs is used)
  --force               allow an existing, non-empty target directory
`;

function parseArgs(argv: string[]): { name?: string; selection: Selection; force: boolean } {
  const selection: Selection = {};
  let force = false;
  let name: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--auth":
        selection.auth = argv[++i];
        break;
      case "--database":
        selection.database = argv[++i];
        break;
      case "--toolkit":
        selection.toolkit = argv[++i];
        break;
      case "--ai":
        selection.ai = argv[++i]?.split(",").map((s) => s.trim()).filter(Boolean);
        break;
      case "--jobs":
        selection.jobs = argv[++i];
        break;
      case "--broker":
        selection.broker = argv[++i];
        break;
      case "--force":
        force = true;
        break;
      case "-h":
      case "--help":
        stdout.write(USAGE);
        process.exit(0);
        break;
      default:
        if (!arg.startsWith("-") && !name) name = arg;
        else {
          stderr.write(`Unknown argument "${arg}"\n\n${USAGE}`);
          process.exit(1);
        }
    }
  }

  return { name, selection, force };
}

function selectOptions(choices: TemplateChoice[], withNone = false) {
  return [
    ...(withNone ? [{ value: NONE, label: "None" }] : []),
    ...choices.map((choice) => ({ value: choice.id, label: choice.label })),
  ];
}

function abort(close: ClackPrompts["cancel"]): never {
  close("Operation cancelled.");
  process.exit(0);
}

function isCancelled(p: ClackPrompts, value: unknown): value is symbol {
  return p.isCancel(value);
}

async function promptAppName(p: ClackPrompts, name?: string): Promise<string> {
  const answer = name ?? (await p.text({
    message: "Project name",
    initialValue: "my-app",
    validate: (value) =>
      value !== undefined && isUnsafeDirName(value)
        ? "Enter a valid directory name"
        : undefined,
  }));
  if (isCancelled(p, answer)) abort(p.cancel);
  if (isUnsafeDirName(answer)) {
    stderr.write(`Invalid project name "${answer}". Use a plain directory name.\n`);
    process.exit(1);
  }
  return answer;
}

async function promptSelections(p: ClackPrompts, selection: Selection): Promise<Selection> {
  const out = { ...selection };

  if (!out.auth) {
    const answer = await p.select({
      message: "Auth provider",
      options: selectOptions(authTemplates, true),
      initialValue: NONE,
    });
    if (isCancelled(p, answer)) abort(p.cancel);
    if (answer !== NONE) out.auth = answer;
  }

  if (!out.database) {
    const answer = await p.select({
      message: "Database",
      options: selectOptions(databaseTemplates, true),
      initialValue: NONE,
    });
    if (isCancelled(p, answer)) abort(p.cancel);
    if (answer !== NONE) {
      out.database = answer;
      const toolkit = await p.select({
        message: `Database toolkit for ${answer}`,
        options: selectOptions(toolkitTemplates),
        initialValue: "sql",
      });
      if (isCancelled(p, toolkit)) abort(p.cancel);
      out.toolkit = toolkit;
    }
  }

  if (!out.ai) {
    const { ChecklistPrompt } = await import("./checkbox.ts");
    const checklist = new ChecklistPrompt({
      message: "AI capabilities",
      options: selectOptions(aiTemplates),
    });
    const answer = await checklist.prompt();
    if (typeof answer === "symbol") abort(p.cancel);
    out.ai = answer;
  }

  if (!out.jobs) {
    const answer = await p.select({
      message: "Jobs system",
      options: selectOptions(jobsTemplates, true),
      initialValue: NONE,
    });
    if (isCancelled(p, answer)) abort(p.cancel);
    if (answer !== NONE) {
      out.jobs = answer;
      const broker = await p.select({
        message: `Broker for ${answer}`,
        options: selectOptions(brokerTemplates),
        initialValue: "redis",
      });
      if (isCancelled(p, broker)) abort(p.cancel);
      out.broker = broker;
    }
  }

  return out;
}

async function generateAndReport(
  destDir: string,
  appName: string,
  selection: Selection,
  force: boolean,
): Promise<void> {
  if (destDir !== "." && isUnsafeDirName(destDir)) {
    stderr.write(`Invalid project name "${destDir}". Use a plain directory name.\n`);
    process.exit(1);
  }

  if (selection.jobs && selection.jobs !== NONE && !selection.broker) {
    selection.broker = "redis";
  }

  const templates = resolveTemplatePaths(selection);
  const report = await generateProject(destDir, {
    appName,
    templates,
    selection,
    force,
  });

  stdout.write(`${BANNER}\n`);
  stdout.write(`  Success! Created ${destDir === "." ? "." : appName}\n\n`);

  if (stdin.isTTY) {
    const p = await import("@clack/prompts");
    const summary = templates
      .map((t) => `    · ${t}`)
      .join("\n");
    p.note(
      `base\n${summary}`,
      "Templates applied",
    );
    p.log.success(` ${report.written.length} files written, ${report.merged.length} files merged.`);
    p.note(
      destDir === "."
        ? `  npm install\n  npm run dev`
        : `  cd ${destDir}\n  npm install\n  npm run dev`,
      "Next steps",
    );
  } else {
    const dirLabel = destDir === "." ? "." : `${destDir}/`;
    stdout.write(
      `  ${report.written.length} files written, ${report.merged.length} files merged.\n`,
    );
    stdout.write(
      `  Applied ${templates.length} template(s): base${templates.map((t) => ` + ${t}`).join("")}.\n`,
    );
    stdout.write(`\n  Next steps:\n`);
    if (destDir === ".") {
      stdout.write(`    npm install\n    npm run dev\n`);
    } else {
      stdout.write(`    cd ${destDir}\n    npm install\n    npm run dev\n`);
    }
  }
}

export async function run(argv: string[]): Promise<void> {
  try {
    const { name, selection, force } = parseArgs(argv);

    const resolve = (rawName: string) =>
      rawName === "."
        ? { destDir: ".", appName: basename(process.cwd()) }
        : { destDir: rawName, appName: rawName };

    if (!stdin.isTTY) {
      const { destDir, appName } = resolve(name ?? "my-app");
      await generateAndReport(destDir, appName, selection, force);
      return;
    }

    const p = await import("@clack/prompts");
    const inputName = await promptAppName(p, name);
    const selected = await promptSelections(p, selection);
    const { destDir, appName } = resolve(inputName);
    await generateAndReport(destDir, appName, selected, force);
  } catch (error) {
    stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}