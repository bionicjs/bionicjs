import { WhyAMetaFramework } from "./why-a-meta-framework";
import { TheHonestBaseline } from "./the-honest-baseline";
import { FilesystemRouting } from "./filesystem-routing";
import { TheParserAndManifest } from "./the-parser-and-manifest";
import { VirtualModules } from "./virtual-modules";
import { LayoutAdaptation } from "./layout-adaptation";
import { ProjectGenerator } from "./project-generator";
import { ViteAndNitro } from "./vite-and-nitro";
import { TheDevServer } from "./the-dev-server";
import { HmrAndWatchers } from "./hmr-and-watchers";
import { BionicJSConfig } from "./bionicjs-config";
import { BuildPipeline } from "./build-pipeline";
import { ServerAndHono } from "./server-and-hono";
import { ApiProxying } from "./api-proxying";
import { MiddlewareAndEdge } from "./middleware-and-edge";
import { PythonExecutionModel } from "./python-execution-model";
import { TheRpcBoundary } from "./the-rpc-boundary";
import { AiCapabilities } from "./ai-capabilities";
import { BackgroundJobs } from "./background-jobs";
import { DataMutations } from "./data-mutations";
import { AuthFlow } from "./auth-flow";
import { DatabaseAccess } from "./database-access";
import React from "react";

export const LEARN_CONTENT: Record<string, React.ReactNode> = {
  "why-a-meta-framework": <WhyAMetaFramework />,
  "the-honest-baseline": <TheHonestBaseline />,
  "filesystem-routing": <FilesystemRouting />,
  "the-parser-and-manifest": <TheParserAndManifest />,
  "virtual-modules": <VirtualModules />,
  "layout-adaptation": <LayoutAdaptation />,
  "project-generator": <ProjectGenerator />,
  "vite-and-nitro": <ViteAndNitro />,
  "the-dev-server": <TheDevServer />,
  "hmr-and-watchers": <HmrAndWatchers />,
  "bionicjs-config": <BionicJSConfig />,
  "build-pipeline": <BuildPipeline />,
  "server-and-hono": <ServerAndHono />,
  "api-proxying": <ApiProxying />,
  "middleware-and-edge": <MiddlewareAndEdge />,
  "python-execution-model": <PythonExecutionModel />,
  "the-rpc-boundary": <TheRpcBoundary />,
  "ai-capabilities": <AiCapabilities />,
  "background-jobs": <BackgroundJobs />,
  "data-mutations": <DataMutations />,
  "auth-flow": <AuthFlow />,
  "database-access": <DatabaseAccess />,
};
