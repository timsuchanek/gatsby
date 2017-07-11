"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** *
 * Jobs of this module
 * - Maintain the list of components in the Redux store. So monitor new pages
 *   and add/remove components.
 * - Watch components for query changes and extract these and update the store.
 * - Ensure all page queries are run as part of bootstrap and report back when
 *   this is done
 * - Whenever a query changes, re-run all pages that rely on this query.
 ***/

var _ = require("lodash");
var chokidar = require("chokidar");

var _require = require("../../redux/"),
    store = _require.store;

var _require2 = require("../../redux/actions"),
    boundActionCreators = _require2.boundActionCreators;

var queryCompiler = require("./query-compiler").default;
var queryRunner = require("./query-runner");
var invariant = require("invariant");
var normalize = require("normalize-path");

exports.extractQueries = function () {
  var pages = store.getState().pages;
  var components = _.uniq(pages.map(function (p) {
    return p.component;
  }));
  return queryCompiler().then(function (queries) {
    components.forEach(function (component) {
      var query = queries.get(normalize(component));

      boundActionCreators.replacePageComponentQuery({
        query: query && query.text,
        componentPath: component
      });
    });

    return;
  });
};

var runQueriesForComponent = function runQueriesForComponent(componentPath) {
  var pages = getPagesForComponent(componentPath);
  // Remove page data dependencies before re-running queries because
  // the changing of the query could have changed the data dependencies.
  // Re-running the queries will add back data dependencies.
  boundActionCreators.deletePagesDependencies(pages.map(function (p) {
    return p.path;
  }));
  var component = store.getState().pageComponents[componentPath];
  return _promise2.default.all(pages.map(function (p) {
    return queryRunner(p, component);
  }));
};

var getPagesForComponent = function getPagesForComponent(componentPath) {
  return store.getState().pages.filter(function (p) {
    return p.component === componentPath;
  });
};

var watcher = void 0;
exports.watchComponent = function (componentPath) {
  watcher.add(componentPath);
};
exports.watch = function (rootDir) {
  if (watcher) return;

  var debounceCompile = _.debounce(function () {
    queryCompiler().then(function (queries) {
      var pages = store.getState().pageComponents;
      queries.forEach(function (_ref, path) {
        var text = _ref.text;

        invariant(pages[path], "Path " + path + " not found in the store pages: " + (0, _stringify2.default)(pages));

        if (text !== pages[path].query) {
          boundActionCreators.replacePageComponentQuery({
            query: text,
            componentPath: path
          });
          runQueriesForComponent(path);
        }
      });
    });
  }, 100);

  watcher = chokidar.watch(rootDir + "/src/**/*.{js,jsx,ts,tsx}").on("change", function (path) {
    debounceCompile();
  });
};
//# sourceMappingURL=query-watcher.js.map