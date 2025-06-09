import {resolve} from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import {dts} from 'rollup-plugin-dts';
import packageJson from './package.json' assert {type: 'json'};
import url from 'postcss-url';
import postcssImport from 'postcss-import';
import commonjs from '@rollup/plugin-commonjs';

const input = resolve(__dirname, './src/main.ts');
const external = [
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.peerDependencies),
  'react/jsx-runtime',
];

export default [
  {
    input,
    output: [
      {
        dir: resolve(__dirname, 'dist', 'es'),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      image(),
      nodeResolve(),
      typescript({
        outDir: resolve(__dirname, 'dist', 'es', 'types'),
      }),
      ,
      postcss({
        inject: true,
        extract: false,
        sourceMap: true,
        minimize: true,
        modules: false,
        use: {
          less: {javascriptEnabled: true},
        },
        to: 'dist',
        plugins: [
          postcssImport(),
          url({
            url: 'inline',
            // useHash: true,
            // assetsPath: './dist/assets',
            // basePath: '.',
          }),
          // url({
          //   url: (asset, dir, options, decl, warn, result) => {
          //     return `../assets/${basename(asset.url)}`;
          //   },
          // }),
        ],
      }),
    ],
    external,
  },
  {
    input: './src/index.cjs.ts',
    output: [
      {
        dir: resolve(__dirname, 'dist', 'cjs'),
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      image(),
      nodeResolve(),
      commonjs(),
      typescript({
        declaration: false,
        emitDeclarationOnly: false,
        outDir: resolve(__dirname, 'dist', 'cjs', 'types'),
      }),
      postcss({
        inject: false,
        extract: false,
        sourceMap: true,
        minimize: true,
        modules: false,
        use: {
          less: {javascriptEnabled: true},
        },
      }),
    ],
    external,
  },
  {
    input: resolve(__dirname, 'dist', 'es', 'types', 'main.d.ts'),
    output: {file: 'dist/index.d.ts', format: 'es'},
    plugins: [dts()],
    external: [/\.s?css$/],
  },
];
