//'use strict';

module.exports = core;

let homedir, rootCheck, pathExists, args, config;

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const commander = require('commander');

const log = require('@mylerna/log');

const pkg = require('../package.json');
const constant = require('./const');

const program = new commander.Command();

async function core() {
    try{
        homedir = (await import('os')).homedir();
        rootCheck = (await import('root-check')).default;
        pathExists = (await import('path-exists')).pathExistsSync;

        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        // checkInputArgs();
        checkEnv();
        await checkGlobalUpdate();
        registerCommand();
    } catch(e){
        log.error(e.message);
    }
}

function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d, --debug', 'open debug mode', false);

    program.on('option:debug', function() {
        if(program._optionValues.debug){
            process.env.LOG_LEVEL = 'verbose';
        } else {
            process.env.LOG_LEVEL = 'info';
        }
        log.level = process.env.LOG_LEVEL;
    });

    program.on('command:*', function(obj) {
        const availableCommands = program.commands.map(cmd => cmd.name());
        console.log(colors.red(`unknown command: ${obj[0]}`));
        if(availableCommands.length > 0){
            console.log(colors.green(`available commands: ${availableCommands.join(',')}`));
        }
    });

    program.parse(process.argv);

    if(program.args && program.args.length < 1){
        program.outputHelp();
        console.log();
    }
}

async function checkGlobalUpdate() {
    const currentVersion = pkg.version;
    const npmName = 'dotenv'; //pkg.name;
    
    const {getSemverVersion} = require('@mylerna/get-npm-info');
    const lastVersion = await getSemverVersion(currentVersion, npmName);
    if(lastVersion && semver.gt(lastVersion, currentVersion)){
        log.warn(colors.yellow(`Please upgrade npm package ${npmName}. 
        Current version : ${currentVersion}, 
        last version : ${lastVersion}.`));
    }
}

function checkEnv() {
    const dotenpath = path.resolve(homedir, '.env');
    if(pathExists(dotenpath)){
        require('dotenv').config({
            path: dotenpath
        });
    }
    config = createDefaultConfig();
    log.verbose(process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
    let config = {
        home: homedir
    };
    if(process.env.CLI_HOME){
        config['cliHome'] = path.join(homedir, process.env.CLI_HOME)
    } else {
        config['cliHome'] = path.join(homedir, constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = config.cliHome;
    return config;
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
    log.info('cli', pkg.version);
}