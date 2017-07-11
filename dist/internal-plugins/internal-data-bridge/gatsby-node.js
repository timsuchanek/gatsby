"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crypto = require("crypto");
var moment = require("moment");
var chokidar = require("chokidar");
var systemPath = require("path");
var _ = require("lodash");

var _require = require("../../redux"),
    emitter = _require.emitter;

var _require2 = require("../../redux/actions"),
    boundActionCreators = _require2.boundActionCreators;

function transformPackageJson(json) {
  var transformDeps = function transformDeps(deps) {
    return _.entries(deps).map(function (_ref) {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
          name = _ref2[0],
          version = _ref2[1];

      return {
        name: name,
        version: version
      };
    });
  };

  json = _.pick(json, ["name", "description", "version", "main", "keywords", "author", "license", "dependencies", "devDependencies", "peerDependencies", "optionalDependecies", "bundledDependecies"]);
  json.dependencies = transformDeps(json.dependencies);
  json.devDependencies = transformDeps(json.devDependencies);
  json.peerDependencies = transformDeps(json.peerDependencies);
  json.optionalDependecies = transformDeps(json.optionalDependecies);
  json.bundledDependecies = transformDeps(json.bundledDependecies);

  return json;
}

exports.sourceNodes = function (_ref3) {
  var boundActionCreators = _ref3.boundActionCreators,
      store = _ref3.store;
  var createNode = boundActionCreators.createNode;

  var state = store.getState();
  var program = state.program;
  var flattenedPlugins = state.flattenedPlugins;

  // Add our default development page since we know it's going to
  // exist and we need a node to exist so it's query works :-)

  var page = { path: "/dev-404-page/" };
  createNode((0, _extends3.default)({}, page, {
    id: createPageId(page.path),
    parent: "SOURCE",
    children: [],
    internal: {
      mediaType: "application/json",
      type: "SitePage",
      content: (0, _stringify2.default)(page),
      contentDigest: crypto.createHash("md5").update((0, _stringify2.default)(page)).digest("hex")
    }
  }));

  flattenedPlugins.forEach(function (plugin) {
    return createNode((0, _extends3.default)({}, plugin, {
      packageJson: transformPackageJson(require(plugin.resolve + "/package.json")),
      id: "Plugin " + plugin.name,
      parent: "SOURCE",
      children: [],
      internal: {
        contentDigest: crypto.createHash("md5").update((0, _stringify2.default)(plugin)).digest("hex"),
        mediaType: "application/json",
        content: (0, _stringify2.default)(plugin),
        type: "SitePlugin"
      }
    }));
  });

  // Add site node.
  var buildTime = moment().subtract(process.uptime(), "seconds").toJSON();

  var createGatsbyConfigNode = function createGatsbyConfigNode() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Delete plugins from the config as we add plugins above.
    var configCopy = (0, _extends3.default)({}, config);
    delete configCopy.plugins;
    var node = (0, _extends3.default)({
      siteMetadata: (0, _extends3.default)({}, configCopy.siteMetadata),
      port: state.program.port,
      host: state.program.host
    }, configCopy, {
      buildTime: buildTime
    });
    createNode((0, _extends3.default)({}, node, {
      id: "Site",
      parent: "SOURCE",
      children: [],
      internal: {
        contentDigest: crypto.createHash("md5").update((0, _stringify2.default)(node)).digest("hex"),
        content: (0, _stringify2.default)(node),
        mediaType: "application/json",
        type: "Site"
      }
    }));
  };

  createGatsbyConfigNode(state.config);

  var pathToGatsbyConfig = systemPath.join(program.directory, "gatsby-config.js");
  chokidar.watch(pathToGatsbyConfig).on("change", function () {
    // Delete require cache so we can reload the module.
    delete require.cache[require.resolve(pathToGatsbyConfig)];
    var config = require(pathToGatsbyConfig);
    createGatsbyConfigNode(config);
  });
};

var createPageId = function createPageId(path) {
  return "SitePage " + path;
};

exports.onCreatePage = function (_ref4) {
  var page = _ref4.page,
      boundActionCreators = _ref4.boundActionCreators;
  var createNode = boundActionCreators.createNode;

  // Add page.

  createNode((0, _extends3.default)({}, page, {
    id: createPageId(page.path),
    parent: "SOURCE",
    children: [],
    internal: {
      mediaType: "application/json",
      type: "SitePage",
      content: (0, _stringify2.default)(page),
      contentDigest: crypto.createHash("md5").update((0, _stringify2.default)(page)).digest("hex")
    }
  }));
};

// Listen for DELETE_PAGE and delete page nodes.
emitter.on("DELETE_PAGE", function (action) {
  boundActionCreators.deleteNode(createPageId(action.payload.path));
});
//# sourceMappingURL=gatsby-node.js.map