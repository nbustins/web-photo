import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { rmSync } from "fs";
import path from "path";

/**
 * MSW's worker lives in public/, so Vite copies it into every build. It is inert unless a
 * page registers it — which only happens under VITE_ENABLE_MSW — but there is no reason to
 * publish it, so drop it from builds that cannot use it.
 */
function stripMswWorker(enabled: boolean): Plugin {
  let outDir = "dist";
  return {
    name: "strip-msw-worker",
    apply: "build",
    configResolved: config => {
      outDir = config.build.outDir;
    },
    closeBundle: () => {
      if (enabled) return;
      rmSync(path.resolve(outDir, "mockServiceWorker.js"), { force: true });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "VITE_");

  return {
    base: "/",
    plugins: [react(), stripMswWorker(env.VITE_ENABLE_MSW === "true")],
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@layouts": path.resolve(__dirname, "src/layouts"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@services": path.resolve(__dirname, "src/services"),
        "@ui": path.resolve(__dirname, "src/ui"),
        "@styles": path.resolve(__dirname, "src/styles"),
        "@mocks": path.resolve(__dirname, "src/mocks")
      }
    }
  };
});
