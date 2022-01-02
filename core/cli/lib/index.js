//'use strict';

module.exports = core;

let homedir;
let rootCheck;
let pathExists;
let args;

const semver = require('semver');
const colors = require('colors/safe');

const pkg = require('../package.json');
const log = require('@mylerna/log');
const constant = require('./const');

async function core() {
    try{
        homedir = (await import('os')).homedir();
        rootCheck = (await import('root-check')).default;
        pathExists = (await import('path-exists')).pathExistsSync;

        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        checkInputArgs();
    } catch(e){
        log.error(e.message);
    }
}

function checkInputArgs() {
    args = require('minimist')(process.argv.slice(2));
    checkArgs();
}

function checkArgs(){
    if(args.debug){
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
}

function checkUserHome() {
    if (!homedir || !pathExists(homedir)) {
        throw new Error(colors.red(`Current user home ${homedir} doesn't exists.`))
    }
}

function checkRoot() {
    rootCheck();
}

function checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVirsion = constant.LOWEST_NODE_VERSION;
    if ( !semver.gte(currentVersion, lowestVirsion) ){
        throw new Error(colors.red(`mylerna require version ${lowestVirsion} or above of node.js`));
    }
}

function checkPkgVersion() {
    console.log(pkg.version);
}