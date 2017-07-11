"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var program = require("commander");
var packageJson = require("../../package.json");
var path = require("path");
var _ = require("lodash");
var Promise = require("bluebird");
console.log("bin/cli: time since started:", process.uptime());

// Improve Promise error handling. Maybe... what's the best
// practice for this these days?
global.Promise = require("bluebird");
Promise.onPossiblyUnhandledRejection(function (error) {
  throw error;
});
process.on("unhandledRejection", function (error) {
  console.error("UNHANDLED REJECTION", error.stack);
});

var defaultHost = "localhost";

var directory = path.resolve(".");

program.version(packageJson.version).usage("[command] [options]");

console.time("time to load develop");
program.command("develop").description("Start development server. Watches files and rebuilds and hot reloads " + "if something changes") // eslint-disable-line max-len
.option("-H, --host <url>", "Set host. Defaults to " + defaultHost, defaultHost).option("-p, --port <port>", "Set port. Defaults to 8000", "8000").option("-o, --open", "Open the site in your browser for you.").action(function (command) {
  var develop = require("../utils/develop");
  console.timeEnd("time to load develop");
  var p = (0, _extends3.default)({}, command, {
    directory: directory
  });
  develop(p);
});

program.command("build").description("Build a Gatsby project.").option("--prefix-paths", "Build site with link paths prefixed (set prefix in your config).").action(function (command) {
  // Set NODE_ENV to 'production'
  process.env.NODE_ENV = "production";

  var build = require("../utils/build");
  var p = (0, _extends3.default)({}, command, {
    directory: directory
  });
  build(p).then(function () {
    console.log("Done building in", process.uptime(), "seconds");
    process.exit();
  });
});

program.command("serve").description("Serve built site.").option("-H, --host <url>", "Set host. Defaults to " + defaultHost, defaultHost).option("-p, --port <port>", "Set port. Defaults to 9000", "9000").option("-o, --open", "Open the site in your browser for you.").action(function (command) {
  var serve = require("../utils/serve");
  var p = (0, _extends3.default)({}, command, {
    directory: directory
  });
  serve(p);
});

program.command("new [rootPath] [starter]").description("Create new Gatsby project.").action(function (rootPath, starter) {
  var newCommand = require("../utils/new");
  newCommand(rootPath, starter);
});

program.on("--help", function () {
  console.log("To show subcommand help:\n\n    gatsby [command] -h\n");
});

// If the user types an unknown sub-command, just display the help.
var subCmd = process.argv.slice(2, 3)[0];
var cmds = _.map(program.commands, "_name");
cmds = cmds.concat(["--version", "-V"]);

if (!_.includes(cmds, subCmd)) {
  program.help();
} else {
  program.parse(process.argv);
}
//# sourceMappingURL=cli.js.map