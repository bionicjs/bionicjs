import React from "react";
import { createMemoryRouter, useParams } from "react-router";
import { parseRoutes } from "./parser";
import { BionicJSLayoutAdapter } from "./adapter";

// Mock page components for integration testing
function RootLayout({ children }: { children?: React.ReactNode }) {
  return React.createElement("div", { id: "root-layout" }, children);
}

function HomePage() {
  return React.createElement("h1", null, "Home Page");
}

function AboutPage() {
  return React.createElement("h1", null, "About Page");
}

function UserPage() {
  const params = useParams();
  return React.createElement("h1", null, `User ${params.id}`);
}

function DocsPage() {
  const params = useParams();
  return React.createElement("h1", null, `Docs ${params["*"]}`);
}

// 1. Integration test: React Router matching with generated route objects
const mockRoutes = [
  {
    lazy: async () => ({
      Component: () => React.createElement(BionicJSLayoutAdapter, { Layout: RootLayout }),
    }),
    children: [
      {
        index: true,
        lazy: async () => ({ Component: HomePage }),
      },
      {
        path: "about",
        lazy: async () => ({ Component: AboutPage }),
      },
      {
        path: "users",
        children: [
          {
            path: ":id",
            lazy: async () => ({ Component: UserPage }),
          },
        ],
      },
      {
        path: "docs",
        children: [
          {
            path: "*",
            lazy: async () => ({ Component: DocsPage }),
          },
        ],
      },
    ],
  },
];

async function testRouteMatching() {
  console.log("🧪 Testing React Router URL matching integration...");

  // Test 1: Navigation to /users/123
  const router1 = createMemoryRouter(mockRoutes, { initialEntries: ["/users/123"] });
  // Wait for lazy route loaders to resolve
  await router1.navigate("/users/123");
  const matches1 = router1.state.matches;
  const lastMatch1 = matches1[matches1.length - 1];

  console.log("Matched route path for /users/123:", lastMatch1.pathname);
  console.log("Captured params:", lastMatch1.params);

  if (lastMatch1.params.id !== "123") {
    throw new Error(`Expected params.id to be "123", got ${lastMatch1.params.id}`);
  }

  // Test 2: Navigation to /docs/foo/bar
  const router2 = createMemoryRouter(mockRoutes, { initialEntries: ["/docs/foo/bar"] });
  await router2.navigate("/docs/foo/bar");
  const matches2 = router2.state.matches;
  const lastMatch2 = matches2[matches2.length - 1];

  console.log("Matched route path for /docs/foo/bar:", lastMatch2.pathname);
  console.log("Captured catch-all params:", lastMatch2.params);

  if (lastMatch2.params["*"] !== "foo/bar") {
    throw new Error(`Expected params["*"] to be "foo/bar", got ${lastMatch2.params["*"]}`);
  }

  console.log("✅ React Router URL matching integration tests passed!");
}

function testConflictDetection() {
  console.log("🧪 Testing route conflict detection...");
  try {
    parseRoutes(["app/users/[id]/page.tsx", "app/users/[userId]/page.tsx"]);
    throw new Error("Expected parseRoutes to fail on conflicting dynamic parameters!");
  } catch (err: any) {
    if (err.message.includes("BionicJS Route Conflict")) {
      console.log("✅ Successfully caught route conflict error:", err.message);
    } else {
      throw err;
    }
  }
}

async function main() {
  testConflictDetection();
  await testRouteMatching();
}

main().catch((err) => {
  console.error("❌ Integration test failed:", err);
  process.exit(1);
});
