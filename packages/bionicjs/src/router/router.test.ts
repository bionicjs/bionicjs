import { parseRoutes } from "./parser";
import { generateRouteModule } from "./generator";

const mockFiles = [
  "/app/layout.tsx",
  "/app/page.tsx",
  "/app/about/page.tsx",
  "/app/users/[id]/page.tsx",
  "/app/docs/[...slug]/page.tsx",
];

const manifest = parseRoutes(mockFiles);
console.log("Parsed RouteManifestNode Tree:");
console.log(JSON.stringify(manifest, null, 2));

const code = generateRouteModule(manifest);
console.log("\nGenerated Route Module JS:");
console.log(code);

// Validation assertions
if (manifest.layout !== "/app/layout.tsx") {
  throw new Error("Root layout expected at root node");
}

if (manifest.page !== "/app/page.tsx") {
  throw new Error("Root page expected at root node");
}

const aboutNode = manifest.children.find((c) => c.segment === "about");
if (!aboutNode || aboutNode.path !== "about" || aboutNode.page !== "/app/about/page.tsx") {
  throw new Error("About route parsing failed");
}

const usersNode = manifest.children.find((c) => c.segment === "users");
if (!usersNode) {
  throw new Error("Users node missing");
}
const idNode = usersNode.children.find((c) => c.segment === "[id]");
if (!idNode || idNode.path !== ":id" || idNode.page !== "/app/users/[id]/page.tsx") {
  throw new Error("User [id] route parsing failed");
}

if (!code.includes('import { BionicJSLayoutAdapter } from "@bionicjs/core/router";')) {
  throw new Error("Generated code missing BionicJSLayoutAdapter import");
}

if (!code.includes('path: "users"')) {
  throw new Error("Generated code missing users route path");
}

if (!code.includes('path: ":id"')) {
  throw new Error("Generated code missing :id route path");
}

console.log("\n✅ All router parser & generator unit assertions passed!");
