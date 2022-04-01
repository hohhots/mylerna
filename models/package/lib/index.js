"use strict";

const path = require("path");
const fse = require("fs-extra");
let pathExists;
const npminstall = require("npminstall");

const { isObject } = require("@mylerna/utils");
const formatPath = require("@mylerna/format-path");
const {
  getDefaultRegistry,
  getLatestVersion,
  getNpmVersions,
} = require("@mylerna/get-npm-info");

async function importPackage() {
  pathExists = (await import("path-exists")).pathExistsSync;
}

class Package {
  constructor(options) {
    if (!options) {
      ß;
      throw new Error("options must not be empty!");
    }
    if (!isObject(options)) {
      throw new Error("options must be a object!");
    }
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
    this.targetPath = options.targetPath;
    this.storeDir = options.storeDir;
    this.cacheFilePathPrefix = this.packageName.replace("/", "_");
  }

  async init() {
    await importPackage();
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === "latest") {
      this.packageVersion = await getLatestVersion(this.packageName);
    }
  }

  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
  }

  getSpecificCacheFilePath(pkgVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${pkgVersion}@${this.packageName}`
    );
  }

  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  async update() {
    await this.prepare();

    const latestPkgVersion = await getLatestVersion(this.packageName);
    const latestFilePath = this.getSpecificCacheFilePath(latestPkgVersion);

    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{ name: this.packageName, version: latestPkgVersion }],
      });
      this.packageVersion = latestPkgVersion;
    }
  }

  async getRootFilePath() {
    function _getRootFile(targetPath) {
      var finder = require("find-package-json");
      var pkg = finder(targetPath).next();

      if (pkg.value && pkg.value.main) {
        return formatPath(targetPath + "/" + pkg.value.main);
      }
      return null;
    }

    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
