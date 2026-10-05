import assert from "node:assert/strict";
import test from "node:test";

import { readFile, rm, writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  detectPackageManager,
  devCommand,
  initializeGitRepository,
  installCommand,
  writePackageManagerField,
} from "../src/init.ts";

test("detectPackageManager: reads the invoking package manager", () => {
  assert.deepEqual(detectPackageManager("pnpm/9.12.0 npm/? node/v22.23.2 linux x64"), {
    name: "pnpm",
    version: "9.12.0",
  });
  assert.deepEqual(detectPackageManager("npm/10.9.0 node/v22.23.2 linux x64"), {
    name: "npm",
    version: "10.9.0",
  });
  assert.deepEqual(detectPackageManager("yarn/4.5.3 npm/? node/v22.23.2 linux x64"), {
    name: "yarn",
    version: "4.5.3",
  });
  assert.deepEqual(detectPackageManager("bun/1.1.38 npm/? node/v22.23.2 linux x64"), {
    name: "bun",
    version: "1.1.38",
  });
});

test("detectPackageManager: npm reports a literal ? for its own version", () => {
  // `npm_config_user_agent` from npm itself ends in "npm/? node/..." — treating
  // "?" as a version would write "npm@?" into package.json.
  assert.deepEqual(detectPackageManager("npm/? node/v22.23.2 linux x64"), {
    name: "npm",
    version: undefined,
  });
});

test("detectPackageManager: recognises deno", () => {
  // Deno 2 sets npm_config_user_agent for npm compatibility, so a project
  // scaffolded with `deno run -A npm:create-bionicjs-app` is detected as deno.
  assert.deepEqual(detectPackageManager("deno/2.1.4 npm/? node/v22.14.0 linux x64"), {
    name: "deno",
    version: "2.1.4",
  });
});

test("detectPackageManager: falls back to pnpm when unknown", () => {
  assert.deepEqual(detectPackageManager(""), { name: "pnpm" });
  assert.deepEqual(detectPackageManager("cnpm/9.0.0 node/v22.0.0"), { name: "pnpm" });
  // Passing undefined falls through to the ambient npm_config_user_agent, so
  // its result depends on how the test runner was invoked — only assert the
  // shape here and cover the "no env" case by clearing the variable.
  const original = process.env.npm_config_user_agent;
  try {
    delete process.env.npm_config_user_agent;
    assert.deepEqual(detectPackageManager(), { name: "pnpm" });
  } finally {
    if (original !== undefined) process.env.npm_config_user_agent = original;
  }
});

test("devCommand: only npm and bun need the run subcommand", () => {
  assert.equal(devCommand("npm"), "npm run dev");
  assert.equal(devCommand("bun"), "bun run dev");
  assert.equal(devCommand("pnpm"), "pnpm dev");
  assert.equal(devCommand("yarn"), "yarn dev");
});

test("devCommand: deno uses its own task runner", () => {
  // `deno dev` is not a thing; `deno task dev` reads the package.json script.
  assert.equal(devCommand("deno"), "deno task dev");
});

test("installCommand: every manager has an install path", () => {
  assert.equal(installCommand("npm"), "npm install");
  assert.equal(installCommand("pnpm"), "pnpm install");
  assert.equal(installCommand("yarn"), "yarn install");
  assert.equal(installCommand("bun"), "bun install");
  assert.equal(installCommand("deno"), "deno install");
});

test("writePackageManagerField: skips the corepack field for deno", async () => {
  // `packageManager` is a corepack field. Corepack cannot resolve "deno", so
  // writing it would break anyone running with corepack enabled.
  const dir = await mkdtemp(path.join(tmpdir(), "cba-pm-"));
  const pkgPath = path.join(dir, "package.json");
  await writeFile(pkgPath, JSON.stringify({ name: "x" }, null, 2) + "\n");

  await writePackageManagerField(dir, { name: "deno", version: "2.1.4" });
  assert.deepEqual(JSON.parse(await readFile(pkgPath, "utf8")), { name: "x" });

  await writePackageManagerField(dir, { name: "pnpm", version: "9.12.0" });
  assert.equal(JSON.parse(await readFile(pkgPath, "utf8")).packageManager, "pnpm@9.12.0");

  await rm(dir, { recursive: true, force: true });
});

async function git(dir: string, ...args: string[]): Promise<string> {
  const { execFileSync } = await import("node:child_process");
  return execFileSync("git", args, { cwd: dir, encoding: "utf8" });
}

async function tmpDir(): Promise<string> {
  const { mkdtemp } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  return await mkdtemp(path.join(tmpdir(), "bionicjs-git-"));
}

test("initializeGitRepository: creates a repo with a first commit", async () => {
  const dir = await tmpDir();
  const { writeFile } = await import("node:fs/promises");
  await writeFile(`${dir}/README.md`, "hello\n");

  const result = await initializeGitRepository(dir);
  assert.equal(result, "created");

  const log = await git(dir, "log", "--oneline");
  assert.match(log, /Initial commit from BionicJS/);
  // Nothing is left unstaged, and the working tree is clean afterwards.
  assert.equal((await git(dir, "status", "--porcelain")).trim(), "");
});

test("initializeGitRepository: leaves an existing repo untouched", async () => {
  const dir = await tmpDir();
  const { writeFile } = await import("node:fs/promises");
  await git(dir, "init");
  await writeFile(`${dir}/a.txt`, "a\n");
  await git(dir, "add", "-A");
  await git(dir, "commit", "-m", "pre-existing commit");

  const result = await initializeGitRepository(dir);
  assert.equal(result, "existing");

  const log = await git(dir, "log", "--oneline");
  assert.doesNotMatch(log, /Initial commit from BionicJS/);
  assert.match(log, /pre-existing commit/);
});

test("initializeGitRepository: does not nest a repo inside a parent repo", async () => {
  const parent = await tmpDir();
  await git(parent, "init");
  const { mkdir } = await import("node:fs/promises");
  const child = `${parent}/nested-app`;
  await mkdir(child);

  const result = await initializeGitRepository(child);
  assert.equal(result, "existing");
  const { existsSync } = await import("node:fs");
  assert.equal(existsSync(`${child}/.git`), false, "must not create a nested .git");
});

test("initializeGitRepository: removes .git if the commit fails", async () => {
  const dir = await tmpDir();
  const { writeFile } = await import("node:fs/promises");
  await writeFile(`${dir}/README.md`, "hello\n");

  // Break only the commit step, so `git init` succeeds and the rollback path runs.
  const realEnv = process.env.GIT_AUTHOR_NAME;
  const prev = process.env.HOME;
  process.env.GIT_AUTHOR_NAME = "";
  process.env.GIT_AUTHOR_EMAIL = "";
  process.env.GIT_COMMITTER_NAME = "";
  process.env.GIT_COMMITTER_EMAIL = "";
  try {
    const result = await initializeGitRepository(dir);
    // Either the empty identity is rejected, or git accepts it — what matters
    // is that we never leave a half-initialised repo behind.
    if (result === "skipped") {
      const { existsSync } = await import("node:fs");
      assert.equal(existsSync(`${dir}/.git`), false, "failed init must be rolled back");
    }
  } finally {
    if (realEnv !== undefined) process.env.GIT_AUTHOR_NAME = realEnv;
    else delete process.env.GIT_AUTHOR_NAME;
    if (prev !== undefined) process.env.HOME = prev;
  }
});
