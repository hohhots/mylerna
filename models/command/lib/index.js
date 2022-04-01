'use strict';

const semver = require("semver");
const colors = require("colors/safe");

const LOWEST_NODE_VERSION = '16.0.0';

class Command {
    constructor(argv) {
        console.log("Command constructor! ", argv);
        this._argv = argv;

        let runner = new Promise((resolve, reject) => {
            let chain =  Promise.resolve();
            chain = chain.then(() => this.checkNodeVersion());
        });
    }

    init() {
        throw new Error("init must be implemented!");
    }

    exec() {
        throw new Error("exec must be implemented!");
    }

    checkNodeVersion() {
        const currentVersion = process.version;
        const lowestVirsion = LOWEST_NODE_VERSION;
        if (!semver.gte(currentVersion, lowestVirsion)) {
          throw new Error(
            colors.red(`mylerna require version ${lowestVirsion} or above of node.js`)
          );
        }
      }
}

module.exports = Command;