/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import babel from '@rollup/plugin-babel';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

import viteCopyEsm from './viteCopyEsm';
import viteCopyExcalidrawAssets from './viteCopyExcalidrawAssets';
import commonjs from '@rollup/plugin-commonjs';
import {visualizer} from 'rollup-plugin-visualizer';

const externalPackages = [
  'react',
  'react-dom',
  'katex',
  'prettier',
  'prettier-plugin-hermes-parser',
  'prettier-plugin-organize-attributes',
  'prettier-plugin-tailwindcss',
  'yjs',
  'y-websocket',
  'hermes-estree',
  '@excalidraw/excalidraw',
  'lexical',
  '@lexical/clipboard',
  '@lexical/code',
  '@lexical/file',
  '@lexical/hashtag',
  '@lexical/link',
  '@lexical/list',
  '@lexical/mark',
  '@lexical/overflow',
  '@lexical/plain-text',
  '@lexical/react',
  '@lexical/rich-text',
  '@lexical/selection',
  '@lexical/table',
  '@lexical/utils',
];

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  katex: 'katex',
  prettier: 'prettier',
  'prettier-plugin-hermes-parser': 'prettierPluginHermesParser',
  'prettier-plugin-organize-attributes': 'prettierPluginOrganizeAttributes',
  'prettier-plugin-tailwindcss': 'prettierPluginTailwindCSS',
  yjs: 'Y',
  'y-websocket': 'WebsocketProvider',
  lexical: 'Lexical',
  'hermes-estree': 'hermesEStree',
  '@excalidraw/excalidraw': 'Excalidraw',
  '@lexical/clipboard': 'LexicalClipboard',
  '@lexical/code': 'LexicalCode',
  '@lexical/file': 'LexicalFile',
  '@lexical/hashtag': 'LexicalHashtag',
  '@lexical/link': 'LexicalLink',
  '@lexical/list': 'LexicalList',
  '@lexical/mark': 'LexicalMark',
  '@lexical/overflow': 'LexicalOverflow',
  '@lexical/plain-text': 'LexicalPlainText',
  '@lexical/react': 'LexicalReact',
  '@lexical/rich-text': 'LexicalRichText',
  '@lexical/selection': 'LexicalSelection',
  '@lexical/table': 'LexicalTable',
  '@lexical/utils': 'LexicalUtils',
};

export default defineConfig(({mode}) => ({
  build: {
    outDir: 'dist/build',
    ...(mode === 'production' && {
      lib: {
        entry: path.resolve(__dirname, 'src/main.ts'),
        fileName: (format) => `index.${format}.js`,
        formats: ['es'],
        name: 'LexicalPlayground',
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          toplevel: true,
        },
        keep_classnames: true,
      },
    }),
    rollupOptions: {
      input: './src/main.ts',
      external: externalPackages,
      output: {
        globals,
      },
    },
    sourcemap: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
      treeShaking: true,
    },
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      babelrc: false,
      configFile: false,
      exclude: '**/node_modules/**',
      extensions: ['jsx', 'js', 'ts', 'tsx', 'mjs'],
      plugins: [
        '@babel/plugin-transform-flow-strip-types',
        ...(mode !== 'production' ? [] : []),
      ],
      presets: [['@babel/preset-react', {runtime: 'automatic'}]],
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
    visualizer(),
  ],
}));
