const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json')),
);

delete packageJson.devDependencies;
delete packageJson.scripts;

prettier
  .resolveConfig(path.join(__dirname, '..', '.prettierrc.json'))
  .then((prettierOptions) => {
    fs.writeFileSync(
      path.join(__dirname, '..', 'dist', 'package.json'),
      prettier.format(JSON.stringify(packageJson), {
        ...prettierOptions,
        parser: 'json',
      }),
    );
  });
