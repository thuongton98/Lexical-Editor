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
        dir: resolve(__dirname, 'dist', 'build'),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      image(),
      nodeResolve(),
      typescript({
        outDir: resolve(__dirname, 'dist', 'build', 'types'),
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
    input: resolve(__dirname, 'dist', 'build', 'types', 'main.d.ts'),
    output: {file: 'dist/index.d.ts', format: 'es'},
    plugins: [dts()],
    external: [/\.s?css$/],
  },
];
