const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const {APP_PATH, DIST_PATH} = require('./paths.cjs');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(APP_PATH, 'package.json')),
);

delete packageJson.devDependencies;
delete packageJson.scripts;

prettier
  .resolveConfig(path.join(APP_PATH, '.prettierrc.json'))
  .then((prettierOptions) => {
    fs.writeFileSync(
      path.join(DIST_PATH, 'package.json'),
      prettier.format(JSON.stringify(packageJson), {
        ...prettierOptions,
        parser: 'json',
      }),
    );
  });

fs.copyFileSync(
  path.join(APP_PATH, 'README.md'),
  path.join(DIST_PATH, 'README.md'),
);
