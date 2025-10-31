import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const ENV_PREFIX = ["VITE_"];

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: {
    port: 5000,
    host: "0.0.0.0",
    allowedHosts: true as const,
    sourcemapIgnoreList: () => true,
  },
  assetsInclude: ["**/*.glb"],
  define: {
    "process.env.ANCHOR_BROWSER": true,
  },
  resolve: {
    alias: {
      crypto: "crypto-browserify",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      sourcemap: false,
    },
    exclude: ["@base-org/account"],
  },
  build: {
    target: "esnext",
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  plugins: [
    react({ jsxRuntime: "classic" }),
    nodePolyfills({
      include: ["buffer", "crypto", "stream"],
    }),
  ],
}));
