import { VitePluginRadar } from "vite-plugin-radar";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2020",
  },
  plugins: [
    VitePluginRadar({
      // Google Analytics tag injection
      analytics: {
        id: "G-R44XEKE06H",
      }
    }),
    react(),
    tsconfigPaths(),
    svgr({
      svgrOptions: {
        // svgr options
      },
    }),
  ],
  define: {
    "process.env": {},
  },
});
