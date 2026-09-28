import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY || "http://localhost:5001";

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      port: 5173,
      open: true,
      // allow importing ../shared (SEO page data shared with the API)
      fs: { allow: [".."] },
      // Lets the dev client call /api/* on the same origin — no CORS in dev.
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true },
      },
    },
    preview: { port: 4173 },
    build: {
      outDir: "dist",
      sourcemap: mode !== "production",
      rollupOptions: {
        output: {
          // Split the heavy animation/UI libs out of the main bundle.
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            motion: ["framer-motion", "gsap", "lenis"],
            markdown: ["react-markdown", "remark-gfm", "rehype-highlight"],
          },
        },
      },
    },
  };
});
