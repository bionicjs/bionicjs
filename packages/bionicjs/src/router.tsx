import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

// virtual:bionicjs-routes is provided by the bionicjs-routes Vite plugin. It is loaded
// lazily so that importing @bionicjs/core never touches the virtual module outside
// a browser (Node-side config loading, plugin packages, etc. stay crash-free).
const LazyRoutes = lazy(() =>
  // @ts-expect-error Virtual module provided by bionicjsRoutesPlugin
  import("virtual:bionicjs-routes").then((mod) => ({
    default: function BionicJSRoutes() {
      const router = createBrowserRouter(mod.routes);
      return <RouterProvider router={router} />;
    },
  })),
);

export function BionicJSRouter() {
  return (
    <Suspense fallback={null}>
      <LazyRoutes />
    </Suspense>
  );
}