"use strict";

const Command = require("@mylerna/command");

class InitCommand extends Command {

}

function init(argv) {
  // console.log(
  //   "init",
  //   projectName,
  //   cmdObj,
  //   parent.parent._optionValues.targetPath,
  //   process.env.CLI_TARGET_PATH
  // );

  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
