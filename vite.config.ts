import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { VitePluginRadar } from "vite-plugin-radar";
import tsconfigPaths from "vite-tsconfig-paths";
import copyDtsPlugin from 'vite-plugin-copy-dts'

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
    // Configuration for copyDtsPlugin
    copyDtsPlugin({
      files: [
        {
          from: ['types/*', 'src/types/extension.d.ts'],
          to: 'target.d.ts',
          excludes: ['types/excludes.d.ts']
        },
        {
          from: 'src/types/extension.d.ts',
          to: 'target.d.ts'
        },
        {
          from: 'blog.html', 
          to: 'dist/blog.html' 
        },
        {
          from: 'sitemap.xml', 
          to: 'dist/sitemap.xml'
        },
        {
          from: 'robots.txt', 
          to: 'dist/robots.txt' 
        }
      ]
    }),
  ],
  define: {
    "process.env": {},
  },
});
