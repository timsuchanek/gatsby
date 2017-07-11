"use strict";

var fs = require("fs");
var path = require("path");

var _require = require("./query-watcher"),
    watchComponent = _require.watchComponent;

var pageComponents = {};
exports.onCreatePage = function (_ref) {
  var page = _ref.page,
      store = _ref.store,
      boundActionCreators = _ref.boundActionCreators;

  var component = page.component;
  if (!pageComponents[component]) {
    // We haven't seen this component before so we:
    // - Ensure it has a JSON file.
    // - Add it to Redux
    // - Watch the component to detect query changes
    var pathToJSONFile = path.join(store.getState().program.directory, ".cache", "json", page.jsonName);
    if (!fs.existsSync(pathToJSONFile)) {
      fs.writeFile(pathToJSONFile, "{}", function () {});
    }
    boundActionCreators.createPageComponent(component);

    // Make sure we're watching this component.
    watchComponent(component);
  }

  // Mark we've seen this page component.
  pageComponents[component] = component;
};
//# sourceMappingURL=gatsby-node.js.map