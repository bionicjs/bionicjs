import { RouteManifestNode } from "./types";
import {
  formatSegmentToRoutePath,
  isPageFile,
  isLayoutFile,
  isDynamicSegment,
  isCatchAllSegment,
} from "./conventions";

export function parseRoutes(files: string[]): RouteManifestNode {
  const root: RouteManifestNode = {
    segment: "",
    children: [],
  };

  const getOrCreateNode = (segments: string[]): RouteManifestNode => {
    let current = root;
    for (const segment of segments) {
      const formattedPath = formatSegmentToRoutePath(segment);

      // Check for route conflicts:
      // 1. Multiple dynamic parameter segments at the same level (e.g. [id] vs [userId])
      // 2. Multiple catch-all segments at the same level
      const existingConflict = current.children.find((c) => {
        if (c.segment === segment) return false;
        if (isDynamicSegment(segment) && isDynamicSegment(c.segment)) return true;
        if (isCatchAllSegment(segment) && isCatchAllSegment(c.segment)) return true;
        return c.path === formattedPath;
      });

      if (existingConflict) {
        throw new Error(
          `BionicJS Route Conflict: Conflicting segments "${segment}" and "${existingConflict.segment}" at the same directory level.`
        );
      }

      let child = current.children.find((c) => c.segment === segment);
      if (!child) {
        child = {
          segment,
          path: formattedPath,
          children: [],
        };
        current.children.push(child);
      }
      current = child;
    }
    return current;
  };

  for (const rawFile of files) {
    // Normalize path to remove leading dot/slash and /app prefix
    let normalized = rawFile.replace(/\\/g, "/");
    normalized = normalized.replace(/^(\.\/|\/)?(app\/|\/)?/, "");

    const parts = normalized.split("/").filter(Boolean);
    if (parts.length === 0) continue;

    const filename = parts[parts.length - 1];

    // Only process page.tsx and layout.tsx files
    if (!isPageFile(filename) && !isLayoutFile(filename)) {
      continue;
    }

    const dirSegments = parts.slice(0, parts.length - 1);
    const targetNode = dirSegments.length === 0 ? root : getOrCreateNode(dirSegments);

    // Ensure page/layout paths retain standard Vite root format (e.g. /app/...)
    const fullVitePath = rawFile.startsWith("/") ? rawFile : `/${rawFile}`;

    if (isPageFile(filename)) {
      targetNode.page = fullVitePath;
    } else if (isLayoutFile(filename)) {
      targetNode.layout = fullVitePath;
    }
  }

  return root;
}
