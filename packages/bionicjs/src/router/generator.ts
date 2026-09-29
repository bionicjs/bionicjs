import { RouteManifestNode } from "./types";

function generateNodeCode(node: RouteManifestNode, isRoot: boolean): string {
  const parts: string[] = [];

  // Handle Layout wrapper if node has a layout file
  if (node.layout) {
    const layoutLazy = `lazy: async () => {
      const mod = await import("${node.layout}");
      return {
        Component: () => React.createElement(BionicJSLayoutAdapter, { Layout: mod.default })
      };
    }`;

    const childrenCode: string[] = [];

    // Add page as index route under layout if page exists
    if (node.page) {
      childrenCode.push(`{
        index: true,
        lazy: async () => {
          const mod = await import("${node.page}");
          return { Component: mod.default };
        }
      }`);
    }

    // Process child subdirectories
    for (const child of node.children) {
      childrenCode.push(generateNodeCode(child, false));
    }

    if (isRoot) {
      return `{
        ${layoutLazy},
        children: [
          ${childrenCode.join(",\n")}
        ]
      }`;
    } else {
      return `{
        ${node.path ? `path: "${node.path}",` : ""}
        ${layoutLazy},
        children: [
          ${childrenCode.join(",\n")}
        ]
      }`;
    }
  }

  // Node does NOT have a layout file
  if (isRoot) {
    const rootChildren: string[] = [];
    if (node.page) {
      rootChildren.push(`{
        index: true,
        lazy: async () => {
          const mod = await import("${node.page}");
          return { Component: mod.default };
        }
      }`);
    }
    for (const child of node.children) {
      rootChildren.push(generateNodeCode(child, false));
    }
    return rootChildren.join(",\n");
  }

  // Non-root node without layout
  const childCodes = node.children.map((c) => generateNodeCode(c, false));

  if (node.page) {
    const pageLazy = `lazy: async () => {
      const mod = await import("${node.page}");
      return { Component: mod.default };
    }`;

    if (childCodes.length > 0) {
      return `{
        path: "${node.path}",
        ${pageLazy},
        children: [
          ${childCodes.join(",\n")}
        ]
      }`;
    } else {
      return `{
        path: "${node.path}",
        ${pageLazy}
      }`;
    }
  } else {
    // Transparent directory segment without layout or page
    return `{
      path: "${node.path}",
      children: [
        ${childCodes.join(",\n")}
      ]
    }`;
  }
}

export function generateRouteModule(manifest: RouteManifestNode): string {
  const routesCode = generateNodeCode(manifest, true);

  return `import React from "react";
import { BionicJSLayoutAdapter } from "@bionicjs/core/router";

export const routes = [
  ${routesCode}
];
`;
}
