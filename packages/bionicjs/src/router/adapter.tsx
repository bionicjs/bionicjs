import React from "react";
import { Outlet } from "react-router";

export interface BionicJSLayoutAdapterProps {
  Layout: React.ComponentType<{ children?: React.ReactNode }>;
}

export function BionicJSLayoutAdapter({ Layout }: BionicJSLayoutAdapterProps) {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
