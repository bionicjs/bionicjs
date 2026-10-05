#!/usr/bin/env node
// Guards the workspace package graph against circular dependencies.
//
// `@bionicjs/core` is the root of the graph and must depend on no other
// workspace package; tooling and plugins depend on it, never the reverse.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const packagesDir = join(import.meta.dirname, "..", "packages");

// Edges that affect what consumers actually resolve at install/runtime.
const STRICT_FIELDS = ["dependencies", "optionalDependencies", "peerDependencies"];
// Edges that only matter while developing inside the monorepo.
const DEV_FIELDS = ["devDependencies"];

const manifests = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(packagesDir, entry.name, "package.json"))
  .filter((path) => {
    try {
      readFileSync(path);
      return true;
    } catch {
      return false;
    }
  })
  .map((path) => JSON.parse(readFileSync(path, "utf8")));

const names = new Set(manifests.map((manifest) => manifest.name));

function edgesFor(manifest, fields) {
  const edges = [];
  for (const field of fields) {
    for (const dependency of Object.keys(manifest[field] ?? {})) {
      if (names.has(dependency)) edges.push(dependency);
    }
  }
  return edges;
}

const strictGraph = new Map(
  manifests.map((manifest) => [manifest.name, edgesFor(manifest, STRICT_FIELDS)])
);
const fullGraph = new Map(
  manifests.map((manifest) => [
    manifest.name,
    [...edgesFor(manifest, STRICT_FIELDS), ...edgesFor(manifest, DEV_FIELDS)],
  ])
);

// Iterative DFS with a path stack, so a deep graph can't blow the call stack.
function findCycles(graph) {
  const cycles = [];
  const state = new Map();

  for (const root of graph.keys()) {
    if (state.get(root)) continue;
    const stack = [{ node: root, path: [root] }];
    while (stack.length) {
      const { node, path } = stack.pop();
      if (state.get(node) === "done") continue;
      if (state.get(node) === "open") {
        cycles.push(path.slice(path.indexOf(node)));
        continue;
      }
      state.set(node, "open");
      for (const next of graph.get(node) ?? []) {
        if (path.includes(next)) {
          cycles.push([...path.slice(path.indexOf(next)), next]);
        } else {
          stack.push({ node: next, path: [...path, next] });
        }
      }
      state.set(node, "done");
    }
  }
  return cycles;
}

const strictCycles = findCycles(strictGraph);
if (strictCycles.length) {
  console.error("Circular workspace dependencies found:\n");
  for (const cycle of strictCycles) {
    console.error(`  ${cycle.join(" -> ")}`);
  }
  console.error(
    "\nPackage dependencies must form a directed acyclic graph. Fix by moving the\n" +
      "shared code down into the depended-upon package (e.g. dev tooling belongs in\n" +
      "@bionicjs/dev, which may depend on @bionicjs/core, not the reverse).",
  );
  process.exit(1);
}

const devCycles = findCycles(fullGraph).filter((cycle) => !strictCycles.includes(cycle));
if (devCycles.length) {
  console.warn("Circular devDependencies (not fatal, kept out of published deps):");
  for (const cycle of devCycles) {
    console.warn(`  ${cycle.join(" -> ")}`);
  }
  console.warn("");
}

const core = [...strictGraph.get("@bionicjs/core") ?? []];
if (core.length) {
  console.error(`@bionicjs/core must not depend on workspace packages, found: ${core.join(", ")}`);
  process.exit(1);
}

console.log(
  `No circular workspace dependencies across ${manifests.length} packages. ` +
    "@bionicjs/core is a leaf with no workspace dependencies.",
);
