"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _webpackValidator = require("webpack-validator");

var _webpackValidator2 = _interopRequireDefault(_webpackValidator);

var _apiRunnerNode = require("./api-runner-node");

var _apiRunnerNode2 = _interopRequireDefault(_apiRunnerNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(config, stage) {
    var validationState;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _apiRunnerNode2.default)("modifyWebpackConfig", { config: config, stage: stage });

          case 2:

            (0, _invariant2.default)(_lodash2.default.isObject(config) && _lodash2.default.isFunction(config.resolve), "\n    You must return an webpack-configurator instance when modifying the Webpack config.\n    Returned: " + config + "\n    stage: " + stage + "\n    ");

            validationState = (0, _webpackValidator2.default)(config.resolve(), {
              returnValidation: true
            });

            if (validationState.error) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", config);

          case 6:

            console.log("There were errors with your webpack config:");
            validationState.error.details.forEach(function (err, index) {
              console.log("[" + (index + 1) + "]");
              console.log(err.path);
              console.log(err.type, ",", err.message);
              console.log("\n");
            });

            return _context.abrupt("return", process.exit(1));

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function ValidateWebpackConfig(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return ValidateWebpackConfig;
}();
//# sourceMappingURL=webpack-modify-validate.js.map