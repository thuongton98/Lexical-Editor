// vite.config.ts
import babel from "file:///E:/Projects/js/Ts/lexical-playground/node_modules/@rollup/plugin-babel/dist/es/index.js";
import react from "file:///E:/Projects/js/Ts/lexical-playground/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path3 from "path";
import { defineConfig } from "file:///E:/Projects/js/Ts/lexical-playground/node_modules/vite/dist/node/index.js";
import dts from "file:///E:/Projects/js/Ts/lexical-playground/node_modules/vite-plugin-dts/dist/index.mjs";

// viteCopyEsm.ts
import * as fs from "node:fs";
import * as path from "node:path";
import copy from "file:///E:/Projects/js/Ts/lexical-playground/node_modules/rollup-plugin-copy/dist/index.commonjs.js";
function parseImportMapImportEntries() {
  const m = /<script type="importmap">([\s\S]+?)<\/script>/g.exec(
    fs.readFileSync("./esm/index.html", "utf8")
  );
  if (!m) {
    throw new Error("Could not parse importmap from esm/index.html");
  }
  return Object.entries(JSON.parse(m[1]).imports);
}
function viteCopyEsm() {
  return copy({
    hook: "writeBundle",
    targets: [
      { dest: "./build/esm/", src: "./esm/*" },
      { dest: "./build/", src: ["./*.png", "./*.ico"] },
      ...parseImportMapImportEntries().map(([mod, fn]) => ({
        dest: "./build/esm/dist/",
        src: path.join(
          `../${mod.replace(/^@/, "").replace(/\//g, "-")}`,
          // Fork modules are only produced by build-release, which is not run
          // in CI, so we don't need to worry about choosing dev or prod
          fn
        )
      }))
    ],
    verbose: true
  });
}

// viteCopyExcalidrawAssets.ts
import { createRequire } from "node:module";
import * as path2 from "node:path";
import { normalizePath } from "file:///E:/Projects/js/Ts/lexical-playground/node_modules/vite/dist/node/index.js";
import { viteStaticCopy } from "file:///E:/Projects/js/Ts/lexical-playground/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///E:/Projects/js/Ts/lexical-playground/viteCopyExcalidrawAssets.ts";
var require2 = createRequire(__vite_injected_original_import_meta_url);
function viteCopyExcalidrawAssets() {
  return [
    {
      config() {
        return {
          define: {
            "process.env.EXCALIDRAW_ASSET_PATH": JSON.stringify("/")
          }
        };
      },
      name: "viteCopyExcalidrawAssets"
    },
    ...viteStaticCopy({
      targets: [
        {
          dest: `./`,
          src: normalizePath(
            path2.join(require2.resolve("@excalidraw/excalidraw"), "..", "fonts")
          )
        }
      ]
    })
  ];
}

// vite.config.ts
import commonjs from "file:///E:/Projects/js/Ts/lexical-playground/node_modules/@rollup/plugin-commonjs/dist/es/index.js";
var __vite_injected_original_dirname = "E:\\Projects\\js\\Ts\\lexical-playground";
var externalPackages = [
  "react",
  "react-dom",
  "katex",
  "prettier",
  "yjs",
  "y-websocket",
  "lexical",
  "@lexical/clipboard",
  "@lexical/code",
  "@lexical/file",
  "@lexical/hashtag",
  "@lexical/link",
  "@lexical/list",
  "@lexical/mark",
  "@lexical/overflow",
  "@lexical/plain-text",
  "@lexical/react",
  "@lexical/rich-text",
  "@lexical/selection",
  "@lexical/table",
  "@lexical/utils"
];
var globals = {
  react: "React",
  "react-dom": "ReactDOM",
  katex: "katex",
  prettier: "prettier",
  yjs: "Y",
  "y-websocket": "WebsocketProvider",
  lexical: "Lexical",
  "@lexical/clipboard": "LexicalClipboard",
  "@lexical/code": "LexicalCode",
  "@lexical/file": "LexicalFile",
  "@lexical/hashtag": "LexicalHashtag",
  "@lexical/link": "LexicalLink",
  "@lexical/list": "LexicalList",
  "@lexical/mark": "LexicalMark",
  "@lexical/overflow": "LexicalOverflow",
  "@lexical/plain-text": "LexicalPlainText",
  "@lexical/react": "LexicalReact",
  "@lexical/rich-text": "LexicalRichText",
  "@lexical/selection": "LexicalSelection",
  "@lexical/table": "LexicalTable",
  "@lexical/utils": "LexicalUtils"
};
var vite_config_default = defineConfig(({ mode }) => ({
  build: {
    cssCodeSplit: true,
    ...mode === "production" && {
      lib: {
        entry: path3.resolve(__vite_injected_original_dirname, "src/main.ts"),
        fileName: (format) => `index.${format}.js`,
        formats: ["es", "umd"],
        name: "LexicalPlayground"
      },
      minify: "terser",
      terserOptions: {
        compress: {
          toplevel: true
        },
        keep_classnames: true
      }
    },
    rollupOptions: {
      input: "./src/main.ts",
      external: externalPackages,
      output: {
        globals
      }
    },
    sourcemap: false
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
      treeShaking: true
    }
  },
  plugins: [
    babel({
      babelHelpers: "bundled",
      babelrc: false,
      configFile: false,
      exclude: "**/node_modules/**",
      extensions: ["jsx", "js", "ts", "tsx", "mjs"],
      plugins: [
        "@babel/plugin-transform-flow-strip-types",
        ...mode !== "production" ? [] : []
      ],
      presets: [["@babel/preset-react", { runtime: "automatic" }]]
    }),
    ,
    react(),
    dts(),
    ...viteCopyExcalidrawAssets(),
    viteCopyEsm(),
    commonjs({
      // This is required for React 19 (at least 19.0.0-beta-26f2496093-20240514)
      // because @rollup/plugin-commonjs does not analyze it correctly
      strictRequires: [/\/node_modules\/(react-dom|react)\/[^/]\.js$/]
    })
  ],
  resolve: {
    preserveSymlinks: true
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZUNvcHlFc20udHMiLCAidml0ZUNvcHlFeGNhbGlkcmF3QXNzZXRzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcUHJvamVjdHNcXFxcanNcXFxcVHNcXFxcbGV4aWNhbC1wbGF5Z3JvdW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxQcm9qZWN0c1xcXFxqc1xcXFxUc1xcXFxsZXhpY2FsLXBsYXlncm91bmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L1Byb2plY3RzL2pzL1RzL2xleGljYWwtcGxheWdyb3VuZC92aXRlLmNvbmZpZy50c1wiOy8qKlxuICogQ29weXJpZ2h0IChjKSBNZXRhIFBsYXRmb3JtcywgSW5jLiBhbmQgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqXG4gKi9cbmltcG9ydCBiYWJlbCBmcm9tICdAcm9sbHVwL3BsdWdpbi1iYWJlbCc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSAndml0ZSc7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5cbmltcG9ydCB2aXRlQ29weUVzbSBmcm9tICcuL3ZpdGVDb3B5RXNtJztcbmltcG9ydCB2aXRlQ29weUV4Y2FsaWRyYXdBc3NldHMgZnJvbSAnLi92aXRlQ29weUV4Y2FsaWRyYXdBc3NldHMnO1xuaW1wb3J0IGNvbW1vbmpzIGZyb20gJ0Byb2xsdXAvcGx1Z2luLWNvbW1vbmpzJztcblxuY29uc3QgZXh0ZXJuYWxQYWNrYWdlcyA9IFtcbiAgJ3JlYWN0JyxcbiAgJ3JlYWN0LWRvbScsXG4gICdrYXRleCcsXG4gICdwcmV0dGllcicsXG4gICd5anMnLFxuICAneS13ZWJzb2NrZXQnLFxuICAnbGV4aWNhbCcsXG4gICdAbGV4aWNhbC9jbGlwYm9hcmQnLFxuICAnQGxleGljYWwvY29kZScsXG4gICdAbGV4aWNhbC9maWxlJyxcbiAgJ0BsZXhpY2FsL2hhc2h0YWcnLFxuICAnQGxleGljYWwvbGluaycsXG4gICdAbGV4aWNhbC9saXN0JyxcbiAgJ0BsZXhpY2FsL21hcmsnLFxuICAnQGxleGljYWwvb3ZlcmZsb3cnLFxuICAnQGxleGljYWwvcGxhaW4tdGV4dCcsXG4gICdAbGV4aWNhbC9yZWFjdCcsXG4gICdAbGV4aWNhbC9yaWNoLXRleHQnLFxuICAnQGxleGljYWwvc2VsZWN0aW9uJyxcbiAgJ0BsZXhpY2FsL3RhYmxlJyxcbiAgJ0BsZXhpY2FsL3V0aWxzJyxcbl07XG5cbmNvbnN0IGdsb2JhbHMgPSB7XG4gIHJlYWN0OiAnUmVhY3QnLFxuICAncmVhY3QtZG9tJzogJ1JlYWN0RE9NJyxcbiAga2F0ZXg6ICdrYXRleCcsXG4gIHByZXR0aWVyOiAncHJldHRpZXInLFxuICB5anM6ICdZJyxcbiAgJ3ktd2Vic29ja2V0JzogJ1dlYnNvY2tldFByb3ZpZGVyJyxcbiAgbGV4aWNhbDogJ0xleGljYWwnLFxuICAnQGxleGljYWwvY2xpcGJvYXJkJzogJ0xleGljYWxDbGlwYm9hcmQnLFxuICAnQGxleGljYWwvY29kZSc6ICdMZXhpY2FsQ29kZScsXG4gICdAbGV4aWNhbC9maWxlJzogJ0xleGljYWxGaWxlJyxcbiAgJ0BsZXhpY2FsL2hhc2h0YWcnOiAnTGV4aWNhbEhhc2h0YWcnLFxuICAnQGxleGljYWwvbGluayc6ICdMZXhpY2FsTGluaycsXG4gICdAbGV4aWNhbC9saXN0JzogJ0xleGljYWxMaXN0JyxcbiAgJ0BsZXhpY2FsL21hcmsnOiAnTGV4aWNhbE1hcmsnLFxuICAnQGxleGljYWwvb3ZlcmZsb3cnOiAnTGV4aWNhbE92ZXJmbG93JyxcbiAgJ0BsZXhpY2FsL3BsYWluLXRleHQnOiAnTGV4aWNhbFBsYWluVGV4dCcsXG4gICdAbGV4aWNhbC9yZWFjdCc6ICdMZXhpY2FsUmVhY3QnLFxuICAnQGxleGljYWwvcmljaC10ZXh0JzogJ0xleGljYWxSaWNoVGV4dCcsXG4gICdAbGV4aWNhbC9zZWxlY3Rpb24nOiAnTGV4aWNhbFNlbGVjdGlvbicsXG4gICdAbGV4aWNhbC90YWJsZSc6ICdMZXhpY2FsVGFibGUnLFxuICAnQGxleGljYWwvdXRpbHMnOiAnTGV4aWNhbFV0aWxzJyxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoe21vZGV9KSA9PiAoe1xuICBidWlsZDoge1xuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICAuLi4obW9kZSA9PT0gJ3Byb2R1Y3Rpb24nICYmIHtcbiAgICAgIGxpYjoge1xuICAgICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9tYWluLnRzJyksXG4gICAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXR9LmpzYCxcbiAgICAgICAgZm9ybWF0czogWydlcycsJ3VtZCddLFxuICAgICAgICBuYW1lOiAnTGV4aWNhbFBsYXlncm91bmQnLFxuICAgICAgfSxcbiAgICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgICAgdG9wbGV2ZWw6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGtlZXBfY2xhc3NuYW1lczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6Jy4vc3JjL21haW4udHMnLFxuICAgICAgZXh0ZXJuYWw6ZXh0ZXJuYWxQYWNrYWdlcyxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBnbG9iYWxzLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICB0YXJnZXQ6ICdlczIwMjInLFxuICAgICAgdHJlZVNoYWtpbmc6IHRydWUsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIGJhYmVsKHtcbiAgICAgIGJhYmVsSGVscGVyczogXCJidW5kbGVkXCIsXG4gICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgIGNvbmZpZ0ZpbGU6IGZhbHNlLFxuICAgICAgZXhjbHVkZTogXCIqKi9ub2RlX21vZHVsZXMvKipcIixcbiAgICAgIGV4dGVuc2lvbnM6IFtcImpzeFwiLCBcImpzXCIsIFwidHNcIiwgXCJ0c3hcIiwgXCJtanNcIl0sXG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIFwiQGJhYmVsL3BsdWdpbi10cmFuc2Zvcm0tZmxvdy1zdHJpcC10eXBlc1wiLFxuICAgICAgICAuLi4obW9kZSAhPT0gXCJwcm9kdWN0aW9uXCIgPyBbXSA6IFtdKSxcbiAgICAgIF0sXG4gICAgICBwcmVzZXRzOiBbW1wiQGJhYmVsL3ByZXNldC1yZWFjdFwiLCB7IHJ1bnRpbWU6IFwiYXV0b21hdGljXCIgfV1dLFxuICAgIH0pLFxuICAgICxcbiAgICByZWFjdCgpLFxuICAgIGR0cygpLFxuICAgIC4uLnZpdGVDb3B5RXhjYWxpZHJhd0Fzc2V0cygpLFxuICAgIHZpdGVDb3B5RXNtKCksXG4gICAgY29tbW9uanMoe1xuICAgICAgLy8gVGhpcyBpcyByZXF1aXJlZCBmb3IgUmVhY3QgMTkgKGF0IGxlYXN0IDE5LjAuMC1iZXRhLTI2ZjI0OTYwOTMtMjAyNDA1MTQpXG4gICAgICAvLyBiZWNhdXNlIEByb2xsdXAvcGx1Z2luLWNvbW1vbmpzIGRvZXMgbm90IGFuYWx5emUgaXQgY29ycmVjdGx5XG4gICAgICBzdHJpY3RSZXF1aXJlczogWy9cXC9ub2RlX21vZHVsZXNcXC8ocmVhY3QtZG9tfHJlYWN0KVxcL1teL11cXC5qcyQvXSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIHByZXNlcnZlU3ltbGlua3M6IHRydWUsXG4gIH0sXG59KSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXFByb2plY3RzXFxcXGpzXFxcXFRzXFxcXGxleGljYWwtcGxheWdyb3VuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcUHJvamVjdHNcXFxcanNcXFxcVHNcXFxcbGV4aWNhbC1wbGF5Z3JvdW5kXFxcXHZpdGVDb3B5RXNtLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9Qcm9qZWN0cy9qcy9Ucy9sZXhpY2FsLXBsYXlncm91bmQvdml0ZUNvcHlFc20udHNcIjsvKipcbiAqIENvcHlyaWdodCAoYykgTWV0YSBQbGF0Zm9ybXMsIEluYy4gYW5kIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKlxuICovXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdub2RlOmZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCBjb3B5IGZyb20gJ3JvbGx1cC1wbHVnaW4tY29weSc7XG5cbmZ1bmN0aW9uIHBhcnNlSW1wb3J0TWFwSW1wb3J0RW50cmllcygpIHtcbiAgY29uc3QgbSA9IC88c2NyaXB0IHR5cGU9XCJpbXBvcnRtYXBcIj4oW1xcc1xcU10rPyk8XFwvc2NyaXB0Pi9nLmV4ZWMoXG4gICAgZnMucmVhZEZpbGVTeW5jKCcuL2VzbS9pbmRleC5odG1sJywgJ3V0ZjgnKSxcbiAgKTtcbiAgaWYgKCFtKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcGFyc2UgaW1wb3J0bWFwIGZyb20gZXNtL2luZGV4Lmh0bWwnKTtcbiAgfVxuICByZXR1cm4gT2JqZWN0LmVudHJpZXM8c3RyaW5nPihKU09OLnBhcnNlKG1bMV0pLmltcG9ydHMpO1xufVxuXG4vLyBGb3JrIG1vZHVsZXMgYXJlIG9ubHkgcHJvZHVjZWQgYnkgdGhlIGJ1aWxkIHNjcmlwdFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdml0ZUNvcHlFc20oKSB7XG4gIHJldHVybiBjb3B5KHtcbiAgICBob29rOiAnd3JpdGVCdW5kbGUnLFxuICAgIHRhcmdldHM6IFtcbiAgICAgIHtkZXN0OiAnLi9idWlsZC9lc20vJywgc3JjOiAnLi9lc20vKid9LFxuICAgICAge2Rlc3Q6ICcuL2J1aWxkLycsIHNyYzogWycuLyoucG5nJywgJy4vKi5pY28nXX0sXG4gICAgICAuLi5wYXJzZUltcG9ydE1hcEltcG9ydEVudHJpZXMoKS5tYXAoKFttb2QsIGZuXSkgPT4gKHtcbiAgICAgICAgZGVzdDogJy4vYnVpbGQvZXNtL2Rpc3QvJyxcbiAgICAgICAgc3JjOiBwYXRoLmpvaW4oXG4gICAgICAgICAgYC4uLyR7bW9kLnJlcGxhY2UoL15ALywgJycpLnJlcGxhY2UoL1xcLy9nLCAnLScpfWAsXG4gICAgICAgICAgLy8gRm9yayBtb2R1bGVzIGFyZSBvbmx5IHByb2R1Y2VkIGJ5IGJ1aWxkLXJlbGVhc2UsIHdoaWNoIGlzIG5vdCBydW5cbiAgICAgICAgICAvLyBpbiBDSSwgc28gd2UgZG9uJ3QgbmVlZCB0byB3b3JyeSBhYm91dCBjaG9vc2luZyBkZXYgb3IgcHJvZFxuICAgICAgICAgIGZuLFxuICAgICAgICApLFxuICAgICAgfSkpLFxuICAgIF0sXG4gICAgdmVyYm9zZTogdHJ1ZSxcbiAgfSk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXFByb2plY3RzXFxcXGpzXFxcXFRzXFxcXGxleGljYWwtcGxheWdyb3VuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcUHJvamVjdHNcXFxcanNcXFxcVHNcXFxcbGV4aWNhbC1wbGF5Z3JvdW5kXFxcXHZpdGVDb3B5RXhjYWxpZHJhd0Fzc2V0cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovUHJvamVjdHMvanMvVHMvbGV4aWNhbC1wbGF5Z3JvdW5kL3ZpdGVDb3B5RXhjYWxpZHJhd0Fzc2V0cy50c1wiOy8qKlxuICogQ29weXJpZ2h0IChjKSBNZXRhIFBsYXRmb3JtcywgSW5jLiBhbmQgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqXG4gKi9cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcblxuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gXCJub2RlOm1vZHVsZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBub3JtYWxpemVQYXRoIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XG5cbmNvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGltcG9ydC5tZXRhLnVybCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZpdGVDb3B5RXhjYWxpZHJhd0Fzc2V0cygpOiBQbHVnaW5bXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgY29uZmlnKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGRlZmluZToge1xuICAgICAgICAgICAgXCJwcm9jZXNzLmVudi5FWENBTElEUkFXX0FTU0VUX1BBVEhcIjogSlNPTi5zdHJpbmdpZnkoXCIvXCIpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgbmFtZTogXCJ2aXRlQ29weUV4Y2FsaWRyYXdBc3NldHNcIixcbiAgICB9LFxuICAgIC4uLnZpdGVTdGF0aWNDb3B5KHtcbiAgICAgIHRhcmdldHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGRlc3Q6IGAuL2AsXG4gICAgICAgICAgc3JjOiBub3JtYWxpemVQYXRoKFxuICAgICAgICAgICAgcGF0aC5qb2luKHJlcXVpcmUucmVzb2x2ZShcIkBleGNhbGlkcmF3L2V4Y2FsaWRyYXdcIiksIFwiLi5cIiwgXCJmb250c1wiKVxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuICBdO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQU9BLE9BQU8sV0FBVztBQUNsQixPQUFPLFdBQVc7QUFDbEIsT0FBT0EsV0FBVTtBQUNqQixTQUFRLG9CQUFtQjtBQUMzQixPQUFPLFNBQVM7OztBQ0poQixZQUFZLFFBQVE7QUFDcEIsWUFBWSxVQUFVO0FBQ3RCLE9BQU8sVUFBVTtBQUVqQixTQUFTLDhCQUE4QjtBQUNyQyxRQUFNLElBQUksaURBQWlEO0FBQUEsSUFDdEQsZ0JBQWEsb0JBQW9CLE1BQU07QUFBQSxFQUM1QztBQUNBLE1BQUksQ0FBQyxHQUFHO0FBQ04sVUFBTSxJQUFJLE1BQU0sK0NBQStDO0FBQUEsRUFDakU7QUFDQSxTQUFPLE9BQU8sUUFBZ0IsS0FBSyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTztBQUN4RDtBQUdlLFNBQVIsY0FBK0I7QUFDcEMsU0FBTyxLQUFLO0FBQUEsSUFDVixNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEs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
