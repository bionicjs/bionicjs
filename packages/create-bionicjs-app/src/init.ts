import { spawn } from "node:child_process";
import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";

export type PackageManagerName = "npm" | "pnpm" | "yarn" | "bun" | "deno";

export interface PackageManager {
  name: PackageManagerName;
  version?: string;
}

/**
 * `npm_config_user_agent` is set by every package manager when it runs a
 * script or binary, so it reflects how the user invoked create-bionicjs-app.
 * Unknown or absent means we guess pnpm, which is what the BionicJS monorepo uses.
 */
export function detectPackageManager(
  userAgent: string | undefined = process.env.npm_config_user_agent,
): PackageManager {
  const match = userAgent?.match(/^(npm|pnpm|yarn|bun|deno)\/(\S+)/);
  if (!match) return { name: "pnpm" };

  const [, name, rawVersion] = match;
  // npm reports a literal "?" for the version of the running npm process.
  return {
    name: name as PackageManagerName,
    version: rawVersion === "?" ? undefined : rawVersion,
  };
}

/** npm/bun need `run`; pnpm/yarn run the script directly; deno has its own runner. */
export function devCommand(packageManager: PackageManagerName): string {
  if (packageManager === "deno") return "deno task dev";
  return packageManager === "npm" || packageManager === "bun"
    ? `${packageManager} run dev`
    : `${packageManager} dev`;
}

/** How to install dependencies with each manager. `deno install` reads package.json. */
export function installCommand(packageManager: PackageManagerName): string {
  return packageManager === "deno" ? "deno install" : `${packageManager} install`;
}

function runCommand(
  command: string,
  args: string[],
  cwd: string,
  { quiet = false }: { quiet?: boolean } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Node refuses to spawn .cmd/.bat without a shell since the fix for
    // CVE-2024-27980 (EINVAL). Safe here: the command is one of
    // npm|pnpm|yarn|bun|deno|hg|git and the args are literals.
    const isWindows = process.platform === "win32";
    const binary = isWindows ? `${command}.cmd` : command;

    const child = spawn(binary, args, {
      cwd,
      env: process.env,
      stdio: quiet ? ["ignore", "ignore", "ignore"] : "inherit",
      shell: isWindows,
    });

    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      const reason = signal ? `signal ${signal}` : `exit code ${code ?? "unknown"}`;
      reject(new Error(`${command} ${args[0]} failed with ${reason}.`));
    });
  });
}

export async function installDependencies(
  projectDir: string,
  packageManager: PackageManager,
): Promise<void> {
  await runCommand(packageManager.name, ["install"], projectDir);
}

/**
 * Record the package manager in package.json so the project pins the one the
 * user chose rather than whatever happens to be on PATH later.
 */
export async function writePackageManagerField(
  projectDir: string,
  packageManager: PackageManager,
): Promise<void> {
  // `packageManager` is a corepack field. Deno does not read it, and corepack
  // cannot resolve a name it does not know — writing "deno@2.x" would break
  // anyone with corepack enabled. Deno pins its own version elsewhere.
  if (packageManager.name === "deno") return;

  const pkgPath = path.join(projectDir, "package.json");
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  } catch {
    return;
  }
  if (pkg.packageManager !== undefined) return;

  pkg.packageManager = packageManager.version
    ? `${packageManager.name}@${packageManager.version}`
    : packageManager.name;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

/** True when `dir` sits inside an existing Git work tree. */
async function isInGitRepository(dir: string): Promise<boolean> {
  try {
    await runCommand("git", ["rev-parse", "--is-inside-work-tree"], dir, { quiet: true });
    return true;
  } catch {
    return false;
  }
}

/** A project scaffolded inside a Mercurial checkout must not get a nested repo. */
async function isInMercurialRepository(dir: string): Promise<boolean> {
  try {
    await runCommand("hg", ["--cwd", ".", "root"], dir, { quiet: true });
    return true;
  } catch {
    return false;
  }
}

/** Git may be configured to create `master` instead of `main`. */
async function isDefaultBranchSet(dir: string): Promise<boolean> {
  try {
    await runCommand("git", ["config", "init.defaultBranch"], dir, { quiet: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * `git init` plus a first commit, so a fresh project starts with history.
 *
 * Modelled on create-next-app's `tryGitInit`, which behaves the same way: it
 * initialises by default, commits as "Initial commit from Create Next App",
 * and skips when you pass --disable-git. Matching it keeps the muscle memory.
 *
 * The detail we were missing: if we created the repo and then failed partway,
 * we delete the `.git` directory again. A half-initialised repo is worse than
 * none, because the user's next `git commit` would produce a confusing root
 * commit on top of it.
 */
export async function initializeGitRepository(
  projectDir: string,
): Promise<"created" | "existing" | "skipped"> {
  let didInit = false;

  try {
    await runCommand("git", ["--version"], projectDir, { quiet: true });

    // Never write into a repository the user did not ask us to touch.
    if (await isInGitRepository(projectDir)) return "existing";
    if (await isInMercurialRepository(projectDir)) return "existing";

    await runCommand("git", ["init"], projectDir, { quiet: true });
    didInit = true;

    if (!(await isDefaultBranchSet(projectDir))) {
      await runCommand("git", ["checkout", "-b", "main"], projectDir, { quiet: true });
    }

    await runCommand("git", ["add", "-A"], projectDir, { quiet: true });
    await runCommand("git", ["commit", "-m", "Initial commit from BionicJS"], projectDir, {
      quiet: true,
    });
    return "created";
  } catch {
    // A missing git binary, or no committer identity configured, must not fail
    // the scaffold: the files are already on disk. Undo the repo we created so
    // the user starts from a clean directory.
    if (didInit) {
      try {
        await rm(path.join(projectDir, ".git"), { recursive: true, force: true });
      } catch {
        // Nothing more we can do; the scaffold itself already succeeded.
      }
    }
    return "skipped";
  }
}
