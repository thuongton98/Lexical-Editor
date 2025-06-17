import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

let globalBaseFontSize = 16;
let globalInputPath = '';
let globalDecimalPlaces = 3;

function convertPXToEM(pxValue: number): number {
  const em = pxValue / globalBaseFontSize;
  return parseFloat(em.toFixed(globalDecimalPlaces));
}

function recursiveChager(rootPath: string) {
  fs.readdir(rootPath, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const filePath = path.join(rootPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) throw err;

        if (stats.isDirectory()) {
          recursiveChager(filePath);
        } else if (path.extname(file) === '.css') {
          // Process CSS file
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) throw err;
            const updatedData = processBlocks(data);
            fs.writeFile(filePath, updatedData, (err) => {
              if (err) throw err;
              console.log(`Converted ${filePath} to EM units.`);
            });
          });
        }
      });
    });
  });
}

// Utility to find the matching closing bracket for a given opening bracket index
function findMatchingBracket(str: string, startIdx: number): number {
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') depth--;
    if (depth === 0) return i;
  }
  return -1; // Not found
}

// Recursively process CSS blocks, handling nested @media and normal blocks
function processBlocks(css: string, parentIsMedia = false): string {
  let result = '';
  let i = 0;
  while (i < css.length) {
    // Detect @media blocks
    const mediaMatch = css.slice(i).match(/@media[^{]*\{/);
    if (mediaMatch && mediaMatch.index === 0) {
      const mediaStart = i;
      const blockStart = i + mediaMatch[0].length - 1;
      const blockEnd = findMatchingBracket(css, blockStart);
      if (blockEnd === -1) break;
      const before = css.slice(i, blockStart + 1);
      const inner = css.slice(blockStart + 1, blockEnd);
      // Recursively process inner blocks of @media
      result += before + processBlocks(inner, true) + '}';
      i = blockEnd + 1;
    } else {
      // Detect normal CSS rule blocks
      const selectorMatch = css.slice(i).match(/[^@\s][^{]*\{/);
      if (selectorMatch && selectorMatch.index === 0) {
        const blockStart = i + selectorMatch[0].length - 1;
        const blockEnd = findMatchingBracket(css, blockStart);
        if (blockEnd === -1) break;
        const before = css.slice(i, blockStart + 1);
        const inner = css.slice(blockStart + 1, blockEnd);
        if (parentIsMedia) {
          // If inside @media, process recursively
          result += before + processBlocks(inner, true) + '}';
        } else {
          // Otherwise, process declarations for px to em conversion
          result += before + processDeclarations(inner) + '}';
        }
        i = blockEnd + 1;
      } else {
        // Copy non-block content (e.g. whitespace, comments)
        result += css[i];
        i++;
      }
    }
  }
  return result;
}

// Convert px values to em for allowed CSS properties
function processDeclarations(blockContent: string): string {
  return blockContent.replace(
    /([\w-]+)\s*:\s*([^;]+);/g,
    (declMatch, prop, value) => {
      const propName = prop.trim().toLowerCase();
      // Skip conversion for top, left, right, bottom, and translate properties
      if (
        ['top', 'left', 'right', 'bottom'].includes(propName) ||
        /translate/i.test(propName)
      ) {
        return declMatch;
      }
      // Replace px values with em using the global base font size
      const newValue = value.replace(/(\d*\.?\d+)px/g, (m, pxNum) => {
        const pxValue = parseFloat(pxNum);
        const emValue = convertPXToEM(pxValue);
        return `${emValue}em`;
      });
      return `${prop}: ${newValue};`;
    },
  );
}

async function startConvertion() {
  const argv = await yargs(hideBin(process.argv))
    .option('base', {
      alias: 'b',
      type: 'number',
      description: 'Base font size for conversion',
      default: globalBaseFontSize,
    })
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Root directory path to process',
      demandOption: true,
    })
    .option('decimal', {
      alias: 'd',
      type: 'number',
      description: 'Number of decimal places in output',
      default: globalDecimalPlaces,
    })
    .help().argv;

  globalBaseFontSize = argv.base as number;
  globalInputPath = argv.input as string;
  globalDecimalPlaces = argv.decimal as number;
  console.log(globalInputPath, globalBaseFontSize);
  if (!globalInputPath) {
    console.error('Please provide a root directory path with --input or -i.');
    process.exit(1);
  }

  let rootPath = globalInputPath;
  if (!path.isAbsolute(rootPath)) {
    rootPath = path.resolve(rootPath);
  }
  recursiveChager(rootPath);
}

startConvertion();
