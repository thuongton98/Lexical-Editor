/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import babel from "@rollup/plugin-babel";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import viteCopyEsm from "./viteCopyEsm";
import viteCopyExcalidrawAssets from "./viteCopyExcalidrawAssets";
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig(({ mode }) => ({
  build: {
    cssCodeSplit: true,
    ...(mode === "production" && {
      lib: {
        entry: path.resolve(__dirname, "src/main.ts"),
        fileName: (format) => `index.${format}.js`,
        formats: ["es", "cjs"],
        name: "LexicalPlayground",
      },
      minify: "terser",
      terserOptions: {
        compress: {
          toplevel: true,
        },
        keep_classnames: true,
      },
    }),
    rollupOptions: {
      external: [
        "katex",
        "prettier",
        "yjs",
        "y-websocket",
        "react",
        "react-dom",
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
        "@lexical/utils",
      ],
    },
    sourcemap: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
      treeShaking: true,
    },
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
        ...(mode !== "production" ? [] : []),
      ],
      presets: [["@babel/preset-react", { runtime: "automatic" }]],
    }),
    ,
    react(),
    dts(),
    ...viteCopyExcalidrawAssets(),
    viteCopyEsm(),
    commonjs({
      // This is required for React 19 (at least 19.0.0-beta-26f2496093-20240514)
      // because @rollup/plugin-commonjs does not analyze it correctly
      strictRequires: [/\/node_modules\/(react-dom|react)\/[^/]\.js$/],
    }),
  ],
  resolve: {
    preserveSymlinks: true,
  },
}));
