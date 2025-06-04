const fs = require('fs');
const path = require('path');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json')),
);

delete packageJson.devDependencies;
delete packageJson.scripts;

fs.writeFileSync(
  path.join(__dirname, '..', 'dist', 'package.json'),
  JSON.stringify(packageJson),
);
