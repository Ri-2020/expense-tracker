/**
 * CONTENTS:
 * - Vite config: React plugin, dev-server proxy for /expenses -> backend :3001
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/expenses": "http://localhost:3001",
    },
  },
});
