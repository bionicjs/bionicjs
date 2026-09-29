export const PAGE_FILE = "page.tsx";
export const LAYOUT_FILE = "layout.tsx";

export function isPageFile(filename: string): boolean {
  return filename === PAGE_FILE || filename.endsWith(`/${PAGE_FILE}`);
}

export function isLayoutFile(filename: string): boolean {
  return filename === LAYOUT_FILE || filename.endsWith(`/${LAYOUT_FILE}`);
}

export function isDynamicSegment(segment: string): boolean {
  return segment.startsWith("[") && segment.endsWith("]") && !segment.startsWith("[...");
}

export function isCatchAllSegment(segment: string): boolean {
  return segment.startsWith("[...") && segment.endsWith("]");
}

export function formatSegmentToRoutePath(segment: string): string {
  if (isCatchAllSegment(segment)) {
    return "*";
  }
  if (isDynamicSegment(segment)) {
    return `:${segment.slice(1, -1)}`;
  }
  return segment;
}
