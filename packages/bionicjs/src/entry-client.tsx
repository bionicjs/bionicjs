import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BionicJSRouter } from "./router";
import "/app/globals.css"; // Ensure user's globals.css is imported

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BionicJSRouter />
  </StrictMode>
);
