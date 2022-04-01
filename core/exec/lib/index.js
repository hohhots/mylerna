"use strict";

const path = require("path");

const Package = require("@mylerna/package");
const log = require("@mylerna/log");

const PACKAGE_SETTINGS = {
  init: "npminstall", //@mylerna/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = "";
  let pkg;

  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = PACKAGE_SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    log.verbose("targetPath", targetPath);
    log.verbose("storeDir", storeDir);

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });
    await pkg.init();

    if (await pkg.exists()) {
      await pkg.update();
    } else {
      // install package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
    await pkg.init();
  }

  const rootFile = await pkg.getRootFilePath();
  if (rootFile) {
    require(rootFile).call(null, Array.from(arguments));
  }
}

module.exports = exec;
