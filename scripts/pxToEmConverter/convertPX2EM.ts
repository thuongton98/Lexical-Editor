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

            const updatedData = data.replace(/(\d*\.?\d+)px/g, (match, p1) => {
              const pxValue = parseFloat(p1);
              const emValue = convertPXToEM(pxValue);
              return `${emValue}em`;
            });

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
