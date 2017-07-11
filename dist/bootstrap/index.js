"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Promise = require("bluebird");
var glob = require("glob");
var _ = require("lodash");
var slash = require("slash");
var fs = require("fs-extra");
var md5File = require("md5-file/promise");
var crypto = require("crypto");

var apiRunnerNode = require("../utils/api-runner-node");

var _require = require("graphql"),
    graphql = _require.graphql;

var _require2 = require("../redux"),
    store = _require2.store,
    emitter = _require2.emitter;

var _require3 = require("../redux/actions"),
    boundActionCreators = _require3.boundActionCreators;

var loadPlugins = require("./load-plugins");

var _require4 = require("../utils/cache"),
    initCache = _require4.initCache;

var _require5 = require("../internal-plugins/query-runner/query-watcher"),
    extractQueries = _require5.extractQueries;

var _require6 = require("../internal-plugins/query-runner/page-query-runner"),
    runQueries = _require6.runQueries;

var _require7 = require("../internal-plugins/query-runner/pages-writer"),
    writePages = _require7.writePages;

// Override console.log to add the source file + line number.
// Useful for debugging if you lose a console.log somewhere.
// Otherwise leave commented out.
// require(`./log-line-function`)

// Start off the query running.


var QueryRunner = require("../internal-plugins/query-runner");

var preferDefault = function preferDefault(m) {
  return m && m.default || m;
};

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(program) {
    var config, flattenedPlugins, pluginVersions, hashes, pluginsHash, state, oldPluginsHash, srcDir, siteDir, hasAPIFile, ssrPlugins, browserPlugins, browserAPIRunner, browserPluginsRequires, sSRAPIRunner, ssrPluginsRequires, extensions, apiResults, graphqlRunner, exists404html, checkJobsDone;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log("lib/bootstrap/index.js time since started:", process.uptime(), "sec");

            // Fix program directory path for windows env
            program.directory = slash(program.directory);

            store.dispatch({
              type: "SET_PROGRAM",
              payload: program
            });

            QueryRunner.watch(program.directory);

            // Try opening the site's gatsby-config.js file.
            console.time("open and validate gatsby-config.js");
            config = void 0;

            try {
              // $FlowFixMe
              config = preferDefault(require(program.directory + "/gatsby-config"));
            } catch (e) {
              // Ignore. Having a config isn't required.
            }

            store.dispatch({
              type: "SET_SITE_CONFIG",
              payload: config
            });

            console.timeEnd("open and validate gatsby-config.js");

            _context.next = 11;
            return loadPlugins(config);

          case 11:
            flattenedPlugins = _context.sent;


            // Check if any plugins have been updated since our last run. If so
            // we delete the cache is there's likely been changes
            // since the previous run.
            //
            // We do this by creating a hash of all the version numbers of installed
            // plugins, the site's package.json, gatsby-config.js, and gatsby-node.js.
            // The last, gatsby-node.js, is important as many gatsby sites put important
            // logic in there e.g. generating slugs for custom pages.
            pluginVersions = flattenedPlugins.map(function (p) {
              return p.version;
            });
            _context.next = 15;
            return Promise.all([md5File("package.json"), Promise.resolve(md5File(program.directory + "/gatsby-config.js").catch(function () {})), // ignore as this file isn't required),
            Promise.resolve(md5File(program.directory + "/gatsby-node.js").catch(function () {}))] // ignore as this file isn't required),
            );

          case 15:
            hashes = _context.sent;
            pluginsHash = crypto.createHash("md5").update((0, _stringify2.default)(pluginVersions.concat(hashes))).digest("hex");
            state = store.getState();
            oldPluginsHash = state && state.status ? state.status.PLUGINS_HASH : "";

            // Check if anything has changed. If it has, delete the site's .cache
            // directory and tell reducers to empty themselves.
            //
            // Also if the hash isn't there, then delete things just in case something
            // is weird.

            if (oldPluginsHash && pluginsHash !== oldPluginsHash) {
              console.log("\nOne or more of your plugins have changed since the last time you ran Gatsby. As\na precaution, we're deleting your site's cache to ensure there's not any stale\ndata\n");
            }

            if (!(!oldPluginsHash || pluginsHash !== oldPluginsHash)) {
              _context.next = 30;
              break;
            }

            _context.prev = 21;
            _context.next = 24;
            return fs.remove(program.directory + "/.cache");

          case 24:
            _context.next = 29;
            break;

          case 26:
            _context.prev = 26;
            _context.t0 = _context["catch"](21);

            console.error("Failed to remove .cache files. " + _context.t0.message);

          case 29:
            // Tell reducers to delete their data (the store will already have
            // been loaded from the file system cache).
            store.dispatch({
              type: "DELETE_CACHE"
            });

          case 30:

            // Update the store with the new plugins hash.
            store.dispatch({
              type: "UPDATE_PLUGINS_HASH",
              payload: pluginsHash
            });

            // Now that we know the .cache directory is safe, initialize the cache
            // directory.
            initCache();

            // Ensure the public directory is created.
            _context.next = 34;
            return fs.mkdirs(program.directory + "/public");

          case 34:

            // Copy our site files to the root of the site.
            console.time("copy gatsby files");
            srcDir = __dirname + "/../cache-dir";
            siteDir = program.directory + "/.cache";
            _context.prev = 37;
            _context.next = 40;
            return fs.copy(srcDir, siteDir, { clobber: true });

          case 40:
            _context.next = 42;
            return fs.mkdirs(program.directory + "/.cache/json");

          case 42:
            _context.next = 49;
            break;

          case 44:
            _context.prev = 44;
            _context.t1 = _context["catch"](37);

            console.log("Unable to copy site files to .cache");
            console.log(_context.t1);
            process.exit(1);

          case 49:

            // Find plugins which implement gatsby-browser and gatsby-ssr and write
            // out api-runners for them.
            hasAPIFile = function hasAPIFile(env, plugin) {
              return (
                // TODO make this async...
                glob.sync(plugin.resolve + "/gatsby-" + env + "*")[0]
              );
            };

            ssrPlugins = _.filter(flattenedPlugins.map(function (plugin) {
              return {
                resolve: hasAPIFile("ssr", plugin),
                options: plugin.pluginOptions
              };
            }), function (plugin) {
              return plugin.resolve;
            });
            browserPlugins = _.filter(flattenedPlugins.map(function (plugin) {
              return {
                resolve: hasAPIFile("browser", plugin),
                options: plugin.pluginOptions
              };
            }), function (plugin) {
              return plugin.resolve;
            });
            browserAPIRunner = "";


            try {
              browserAPIRunner = fs.readFileSync(siteDir + "/api-runner-browser.js", "utf-8");
            } catch (err) {
              console.error("Failed to read " + siteDir + "/api-runner-browser.js");
            }

            browserPluginsRequires = browserPlugins.map(function (plugin) {
              return "{\n      plugin: require('" + plugin.resolve + "'),\n      options: " + (0, _stringify2.default)(plugin.options) + ",\n    }";
            }).join(",");


            browserAPIRunner = "var plugins = [" + browserPluginsRequires + "]\n" + browserAPIRunner;

            sSRAPIRunner = "";


            try {
              sSRAPIRunner = fs.readFileSync(siteDir + "/api-runner-ssr.js", "utf-8");
            } catch (err) {
              console.error("Failed to read " + siteDir + "/api-runner-ssr.js");
            }

            ssrPluginsRequires = ssrPlugins.map(function (plugin) {
              return "{\n      plugin: require('" + plugin.resolve + "'),\n      options: " + (0, _stringify2.default)(plugin.options) + ",\n    }";
            }).join(",");

            sSRAPIRunner = "var plugins = [" + ssrPluginsRequires + "]\n" + sSRAPIRunner;

            fs.writeFileSync(siteDir + "/api-runner-browser.js", browserAPIRunner, "utf-8");
            fs.writeFileSync(siteDir + "/api-runner-ssr.js", sSRAPIRunner, "utf-8");

            console.timeEnd("copy gatsby files");

            // Source nodes
            console.time("initial sourcing and transforming nodes");
            _context.next = 66;
            return require("../utils/source-nodes")();

          case 66:
            console.timeEnd("initial sourcing and transforming nodes");

            // Create Schema.
            console.time("building schema");
            _context.next = 70;
            return require("../schema")();

          case 70:
            console.timeEnd("building schema");

            // Collect resolvable extensions and attach to program.
            extensions = [".js", ".jsx"];
            // Change to this being an action and plugins implement `onPreBootstrap`
            // for adding extensions.

            _context.next = 74;
            return apiRunnerNode("resolvableExtensions", {
              traceId: "initial-resolvableExtensions"
            });

          case 74:
            apiResults = _context.sent;


            store.dispatch({
              type: "SET_PROGRAM_EXTENSIONS",
              payload: _.flattenDeep([extensions, apiResults])
            });

            graphqlRunner = function graphqlRunner(query) {
              var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

              var schema = store.getState().schema;
              return graphql(schema, query, context, context, context);
            };

            // Collect pages.


            console.time("createPages");
            _context.next = 80;
            return apiRunnerNode("createPages", {
              graphql: graphqlRunner,
              traceId: "initial-createPages",
              waitForCascadingActions: true
            });

          case 80:
            console.timeEnd("createPages");

            // A variant on createPages for plugins that want to
            // have full control over adding/removing pages. The normal
            // "createPages" API is called every time (during development)
            // that data changes.
            console.time("createPagesStatefully");
            _context.next = 84;
            return apiRunnerNode("createPagesStatefully", {
              graphql: graphqlRunner,
              traceId: "initial-createPagesStatefully",
              waitForCascadingActions: true
            });

          case 84:
            console.timeEnd("createPagesStatefully");

            // Copy /404/ to /404.html as many static site hosts expect
            // site 404 pages to be named this.
            // https://www.gatsbyjs.org/docs/add-404-page/
            exists404html = _.some(store.getState().pages, function (p) {
              return p.path === "/404.html";
            });

            if (!exists404html) {
              store.getState().pages.forEach(function (page) {
                if (page.path === "/404/") {
                  boundActionCreators.createPage((0, _extends3.default)({}, page, {
                    path: "/404.html"
                  }));
                }
              });
            }

            // Extract queries
            console.time("extract queries");
            _context.next = 90;
            return extractQueries();

          case 90:
            console.timeEnd("extract queries");

            // Run queries
            console.time("Run queries");
            _context.next = 94;
            return runQueries();

          case 94:
            console.timeEnd("Run queries");

            // Write out files.
            console.time("write out pages modules");
            _context.next = 98;
            return writePages();

          case 98:
            console.timeEnd("write out pages modules");

            // Update Schema for SitePage.
            console.time("Updating schema");
            _context.next = 102;
            return require("../schema")();

          case 102:
            console.timeEnd("Updating schema");

            checkJobsDone = _.debounce(function (resolve) {
              var state = store.getState();
              if (state.jobs.active.length === 0) {
                console.log("bootstrap finished, time since started: " + process.uptime() + "sec");
                resolve({ graphqlRunner: graphqlRunner });
              }
            }, 100);

            if (!(store.getState().jobs.active.length === 0)) {
              _context.next = 109;
              break;
            }

            console.log("bootstrap finished, time since started: " + process.uptime() + "sec");
            return _context.abrupt("return", { graphqlRunner: graphqlRunner });

          case 109:
            return _context.abrupt("return", new Promise(function (resolve) {
              // Wait until all side effect jobs are finished.
              emitter.on("END_JOB", function () {
                return checkJobsDone(resolve);
              });
            }));

          case 110:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[21, 26], [37, 44]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=index.js.map