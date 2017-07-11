"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Jobs of this module
 * - Ensure on bootstrap that all invalid page queries are run and report
 *   when this is done
 * - Watch for when a page's query is invalidated and re-run it.
 */

var _ = require("lodash");
var Promise = require("bluebird");

var _require = require("../../redux"),
    store = _require.store,
    emitter = _require.emitter;

var queryRunner = require("./query-runner");

var queuedDirtyActions = [];

var active = false;

exports.runQueries = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
  var state, paths;
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          active = true;
          state = store.getState();

          // Run queued dirty nodes now that we're active.

          queuedDirtyActions = _.uniq(queuedDirtyActions, function (a) {
            return a.payload.id;
          });
          _context.next = 5;
          return findAndRunQueriesForDirtyPaths(queuedDirtyActions);

        case 5:

          // Find paths without data dependencies and run them (just in case?)
          paths = findPathsWithoutDataDependencies();
          // Run these pages

          _context.next = 8;
          return Promise.all(paths.map(function (path) {
            var page = state.pages.find(function (p) {
              return p.path === path;
            });
            var component = state.pageComponents[page.component];
            return queryRunner(page, component);
          }));

        case 8:
          return _context.abrupt("return");

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, undefined);
}));

emitter.on("CREATE_NODE", function (action) {
  queuedDirtyActions.push(action);
});

var runQueuedActions = function runQueuedActions() {
  if (active) {
    queuedDirtyActions = _.uniq(queuedDirtyActions, function (a) {
      return a.payload.id;
    });
    findAndRunQueriesForDirtyPaths(queuedDirtyActions);
    queuedDirtyActions = [];
  }
};

// Wait until all plugins have finished running (e.g. various
// transformer plugins) before running queries so we don't
// query things in a 1/2 finished state.
emitter.on("API_RUNNING_QUEUE_EMPTY", runQueuedActions);

var findPathsWithoutDataDependencies = function findPathsWithoutDataDependencies() {
  var state = store.getState();
  var allTrackedPaths = _.uniq(_.flatten(_.concat(_.values(state.pageDataDependencies.nodes), _.values(state.pageDataDependencies.connections))));

  // Get list of paths not already tracked and run the queries for these
  // paths.
  return _.difference(state.pages.map(function (p) {
    return p.path;
  }), allTrackedPaths);
};

var findAndRunQueriesForDirtyPaths = function findAndRunQueriesForDirtyPaths(actions) {
  var state = store.getState();
  var dirtyPaths = [];
  actions.forEach(function (action) {
    var node = state.nodes[action.payload.id];

    // Check if the node was deleted
    if (!node) {
      return;
    }

    // Find invalid pages.
    if (state.pageDataDependencies.nodes[node.id]) {
      dirtyPaths = dirtyPaths.concat(state.pageDataDependencies.nodes[node.id]);
    }

    // Find invalid connections
    if (state.pageDataDependencies.connections[node.internal.type]) {
      dirtyPaths = dirtyPaths.concat(state.pageDataDependencies.connections[node.internal.type]);
    }
  });

  if (dirtyPaths.length > 0) {
    // Run these pages
    return Promise.all(_.uniq(dirtyPaths).map(function (path) {
      var page = state.pages.find(function (p) {
        return p.path === path;
      });
      if (page) {
        var component = state.pageComponents[page.component];
        return queryRunner(page, component);
      }
    }));
  } else {
    return Promise.resolve();
  }
};
//# sourceMappingURL=page-query-runner.js.map