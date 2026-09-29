export interface RouteManifestNode {
  segment: string;
  path?: string;
  page?: string;
  layout?: string;
  children: RouteManifestNode[];
}

export interface ParseOptions {
  appDir?: string;
}
