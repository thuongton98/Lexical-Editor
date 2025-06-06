const fs = require('fs');
const path = require('path');
const {DIST_PATH, APP_PATH} = require('./paths.cjs');
const dotenv = require('dotenv');
const rimraf = require('rimraf');

const envFilePath = path.join(__dirname, '.env');
if (!fs.existsSync(envFilePath)) {
  return;
}

dotenv.config({path: path.join(__dirname, '.env')});
if (!process.env.PACKAGE_TEST_DIR) {
  return;
}

const packageTestDir = path.join(APP_PATH, process.env.PACKAGE_TEST_DIR);

rimraf.sync(packageTestDir);

fs.cpSync(DIST_PATH, packageTestDir, {
  recursive: true,
});
