/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
'use strict';
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const viteConfigPath = path.resolve(__dirname, '../vite.config.ts');

// Load package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const lexicalDeps = Object.keys(allDeps).filter((name) =>
  name.startsWith('@lexical/'),
);
packageJson.peerDependencies = packageJson.peerDependencies || {};

// Add lexical deps to peerDependencies
lexicalDeps.forEach((dep) => {
  if (!packageJson.peerDependencies[dep]) {
    packageJson.peerDependencies[dep] = allDeps[dep];
    console.log(`➕ Added to peerDependencies: ${dep}@${allDeps[dep]}`);
  }
});
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json updated.');

// Prepare external array
const externalDeps = ['react', 'react-dom', ...lexicalDeps];

// Load vite.config.ts
let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');

const externalRegex = /external\s*:\s*\[(.*?)\]/s;
const match = viteConfig.match(externalRegex);

if (match) {
  // Merge with existing external
  const existing = match[1]
    .split(',')
    .map((s) => s.trim().replace(/^['"`](.*?)['"`]$/, '$1'))
    .filter(Boolean);

  const merged = Array.from(new Set([...existing, ...externalDeps]));
  const newExternalArray = `external: [\n  ${merged.map((d) => `'${d}'`).join(',\n  ')}\n]`;
  viteConfig = viteConfig.replace(externalRegex, newExternalArray);
  console.log('🔧 Updated existing external array in vite.config.ts.');
} else {
  // No external found, try to inject it into rollupOptions
  const rollupRegex = /rollupOptions\s*:\s*\{([\s\S]*?)\}/;
  const rollupMatch = viteConfig.match(rollupRegex);

  const newExternalBlock = `external: [\n  ${externalDeps.map((d) => `'${d}'`).join(',\n  ')}\n]`;

  if (rollupMatch) {
    // Inject external inside existing rollupOptions block
    const fullMatch = rollupMatch[0];
    const modified = fullMatch.replace('{', `{\n  ${newExternalBlock},`);
    viteConfig = viteConfig.replace(rollupRegex, modified);
    console.log('✨ Injected external array into existing rollupOptions.');
  } else {
    console.warn(
      '⚠️ Could not find rollupOptions in vite.config.ts. Please add this manually:\n',
    );
    console.log(`rollupOptions: {\n  ${newExternalBlock}\n}`);
  }
}

fs.writeFileSync(viteConfigPath, viteConfig);
console.log('✅ vite.config.ts updated.');
