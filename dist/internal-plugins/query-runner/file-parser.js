"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _taggedTemplateLiteral2 = require("babel-runtime/helpers/taggedTemplateLiteral");

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var parseToAst = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(filePath, fileStr) {
    var ast, transpiled, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, tmp;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ast = void 0;

            // Preprocess and attempt to parse source; return an AST if we can, log an
            // error if we can't.

            _context.next = 3;
            return apiRunnerNode("preprocessSource", {
              filename: filePath,
              contents: fileStr
            });

          case 3:
            transpiled = _context.sent;

            if (!transpiled.length) {
              _context.next = 42;
              break;
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 8;
            _iterator = (0, _getIterator3.default)(transpiled);

          case 10:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 25;
              break;
            }

            item = _step.value;
            _context.prev = 12;
            tmp = babylon.parse(item, {
              sourceType: "module",
              plugins: ["*"]
            });

            ast = tmp;
            return _context.abrupt("break", 25);

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](12);

            console.info(_context.t0);
            return _context.abrupt("continue", 22);

          case 22:
            _iteratorNormalCompletion = true;
            _context.next = 10;
            break;

          case 25:
            _context.next = 31;
            break;

          case 27:
            _context.prev = 27;
            _context.t1 = _context["catch"](8);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 31:
            _context.prev = 31;
            _context.prev = 32;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 34:
            _context.prev = 34;

            if (!_didIteratorError) {
              _context.next = 37;
              break;
            }

            throw _iteratorError;

          case 37:
            return _context.finish(34);

          case 38:
            return _context.finish(31);

          case 39:
            if (ast === undefined) {
              console.error("Failed to parse preprocessed file " + filePath);
            }
            _context.next = 43;
            break;

          case 42:
            try {
              ast = babylon.parse(fileStr, {
                sourceType: "module",
                sourceFilename: true,
                plugins: ["*"]
              });
            } catch (e) {
              console.log("Failed to parse " + filePath);
              console.log(e);
            }

          case 43:
            return _context.abrupt("return", ast);

          case 44:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[8, 27, 31, 39], [12, 18], [32,, 34, 38]]);
  }));

  return function parseToAst(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var findGraphQLTags = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(file, text) {
    var ast, queries;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return parseToAst(file, text);

          case 2:
            ast = _context2.sent;

            if (ast) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return", []);

          case 5:
            queries = [];

            (0, _babelTraverse2.default)(ast, {
              ExportNamedDeclaration: function ExportNamedDeclaration(path, state) {
                path.traverse({
                  TaggedTemplateExpression: function TaggedTemplateExpression(innerPath) {
                    var gqlAst = getGraphQLTag(innerPath);
                    if (gqlAst) {
                      gqlAst.definitions.forEach(function (def) {
                        if (!def.name || !def.name.value) {
                          console.log(stripIndent(_templateObject, file));
                          process.exit(1);
                        }
                      });

                      queries.push.apply(queries, (0, _toConsumableArray3.default)(gqlAst.definitions));
                    }
                  }
                });
              }
            });
            return _context2.abrupt("return", queries);

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function findGraphQLTags(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var _templateObject = (0, _taggedTemplateLiteral3.default)(["\n                  GraphQL definitions must be \"named\".\n                  The query with the missing name is in ", ".\n                  To fix the query, add \"query MyQueryName\" to the start of your query.\n                  So instead of:\n                  {\n                    allMarkdownRemark {\n                      totalCount\n                    }\n                  }\n\n                  Do:\n\n                  query MyQueryName {\n                    allMarkdownRemark {\n                      totalCount\n                    }\n                  }\n                "], ["\n                  GraphQL definitions must be \"named\".\n                  The query with the missing name is in ", ".\n                  To fix the query, add \"query MyQueryName\" to the start of your query.\n                  So instead of:\n                  {\n                    allMarkdownRemark {\n                      totalCount\n                    }\n                  }\n\n                  Do:\n\n                  query MyQueryName {\n                    allMarkdownRemark {\n                      totalCount\n                    }\n                  }\n                "]);

var _babelTraverse = require("babel-traverse");

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require("fs");
var crypto = require("crypto");

// Traverse is a es6 module...

var babylon = require("babylon");
var Bluebird = require("bluebird");

var _require = require("common-tags"),
    stripIndent = _require.stripIndent;

var apiRunnerNode = require("../../utils/api-runner-node");

var _require2 = require("../../utils/babel-plugin-extract-graphql"),
    getGraphQLTag = _require2.getGraphQLTag;

var readFileAsync = Bluebird.promisify(fs.readFile);

var cache = {};

var FileParser = function () {
  function FileParser() {
    (0, _classCallCheck3.default)(this, FileParser);
  }

  (0, _createClass3.default)(FileParser, [{
    key: "parseFile",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(file) {
        var text, hash, astDefinitions;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return readFileAsync(file, "utf8");

              case 2:
                text = _context3.sent;

                if (!(text.indexOf("graphql") === -1)) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", null);

              case 5:
                hash = crypto.createHash("md5").update(file).update(text).digest("hex");
                _context3.prev = 6;
                _context3.t0 = cache[hash];

                if (_context3.t0) {
                  _context3.next = 12;
                  break;
                }

                _context3.next = 11;
                return findGraphQLTags(file, text);

              case 11:
                _context3.t0 = cache[hash] = _context3.sent;

              case 12:
                astDefinitions = _context3.t0;
                return _context3.abrupt("return", astDefinitions.length ? {
                  kind: "Document",
                  definitions: astDefinitions
                } : null);

              case 16:
                _context3.prev = 16;
                _context3.t1 = _context3["catch"](6);

                console.error("Failed to parse GQL query from file: " + file);
                console.error(_context3.t1.message);
                return _context3.abrupt("return", null);

              case 21:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[6, 16]]);
      }));

      function parseFile(_x5) {
        return _ref3.apply(this, arguments);
      }

      return parseFile;
    }()
  }, {
    key: "parseFiles",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(files) {
        var documents, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, file, doc;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                documents = new _map2.default();
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context4.prev = 4;
                _iterator2 = (0, _getIterator3.default)(files);

              case 6:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context4.next = 15;
                  break;
                }

                file = _step2.value;
                _context4.next = 10;
                return this.parseFile(file);

              case 10:
                doc = _context4.sent;


                if (doc) documents.set(file, doc);

              case 12:
                _iteratorNormalCompletion2 = true;
                _context4.next = 6;
                break;

              case 15:
                _context4.next = 21;
                break;

              case 17:
                _context4.prev = 17;
                _context4.t0 = _context4["catch"](4);
                _didIteratorError2 = true;
                _iteratorError2 = _context4.t0;

              case 21:
                _context4.prev = 21;
                _context4.prev = 22;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 24:
                _context4.prev = 24;

                if (!_didIteratorError2) {
                  _context4.next = 27;
                  break;
                }

                throw _iteratorError2;

              case 27:
                return _context4.finish(24);

              case 28:
                return _context4.finish(21);

              case 29:
                return _context4.abrupt("return", documents);

              case 30:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[4, 17, 21, 29], [22,, 24, 28]]);
      }));

      function parseFiles(_x6) {
        return _ref4.apply(this, arguments);
      }

      return parseFiles;
    }()
  }]);
  return FileParser;
}();

exports.default = FileParser;
//# sourceMappingURL=file-parser.js.map