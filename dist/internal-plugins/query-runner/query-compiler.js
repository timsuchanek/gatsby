"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

exports.default = compile;

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

var _relayCompiler = require("relay-compiler");

var _ASTConvert = require("relay-compiler/lib/ASTConvert");

var _ASTConvert2 = _interopRequireDefault(_ASTConvert);

var _RelayCompilerContext = require("relay-compiler/lib/RelayCompilerContext");

var _RelayCompilerContext2 = _interopRequireDefault(_RelayCompilerContext);

var _filterContextForNode = require("relay-compiler/lib/filterContextForNode");

var _filterContextForNode2 = _interopRequireDefault(_filterContextForNode);

var _redux = require("../../redux");

var _fileParser = require("./file-parser");

var _fileParser2 = _interopRequireDefault(_fileParser);

var _queryPrinter = require("./query-printer");

var _queryPrinter2 = _interopRequireDefault(_queryPrinter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var normalize = require("normalize-path");

var _ = require("lodash");

var printTransforms = _relayCompiler.IRTransforms.printTransforms;

var globp = _bluebird2.default.promisify(_glob2.default);

var _require = require("graphql"),
    ArgumentsOfCorrectTypeRule = _require.ArgumentsOfCorrectTypeRule,
    DefaultValuesOfCorrectTypeRule = _require.DefaultValuesOfCorrectTypeRule,
    FragmentsOnCompositeTypesRule = _require.FragmentsOnCompositeTypesRule,
    KnownTypeNamesRule = _require.KnownTypeNamesRule,
    LoneAnonymousOperationRule = _require.LoneAnonymousOperationRule,
    PossibleFragmentSpreadsRule = _require.PossibleFragmentSpreadsRule,
    ScalarLeafsRule = _require.ScalarLeafsRule,
    VariablesAreInputTypesRule = _require.VariablesAreInputTypesRule,
    VariablesInAllowedPositionRule = _require.VariablesInAllowedPositionRule;

var Runner = function () {
  function Runner(baseDir, schema) {
    (0, _classCallCheck3.default)(this, Runner);

    this.baseDir = baseDir;
    this.schema = schema;
  }

  (0, _createClass3.default)(Runner, [{
    key: "compileAll",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var nodes;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.parseEverything();

              case 2:
                nodes = _context.sent;
                return _context.abrupt("return", this.write(nodes));

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function compileAll() {
        return _ref.apply(this, arguments);
      }

      return compileAll;
    }()
  }, {
    key: "parseEverything",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var files, parser;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return globp(this.baseDir + "/**/*.+(t|j)s?(x)");

              case 2:
                files = _context2.sent;

                files = files.filter(function (d) {
                  return !d.match(/\.d\.ts$/);
                });
                files = files.map(normalize);
                // Ensure all page components added as they're not necessarily in the
                // pages directory e.g. a plugin could add a page component.  Plugins
                // *should* copy their components (if they add a query) to .cache so that
                // our babel plugin to remove the query on building is active (we don't
                // run babel on code in node_modules). Otherwise the component will throw
                // an error in the browser of "graphql is not defined".
                files = files.concat(_redux.store.getState().pages.map(function (p) {
                  return normalize(p.component);
                }));
                files = _.uniq(files);

                parser = new _fileParser2.default();
                _context2.next = 10;
                return parser.parseFiles(files);

              case 10:
                return _context2.abrupt("return", _context2.sent);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function parseEverything() {
        return _ref2.apply(this, arguments);
      }

      return parseEverything;
    }()
  }, {
    key: "write",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(nodes) {
        var _this = this;

        var namePathMap, documents, compilerContext, regex, m, error, docName, filePath, docWithError, printContext, compiledNodes;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                namePathMap = new _map2.default();
                documents = [];


                nodes.forEach(function (doc, filePath) {
                  documents.push(doc);
                  doc.definitions.forEach(function (def) {
                    var name = def.name.value;
                    namePathMap.set(name, filePath);
                  });
                });

                compilerContext = new _RelayCompilerContext2.default(this.schema);

                try {
                  compilerContext = compilerContext.addAll(_ASTConvert2.default.convertASTDocuments(this.schema, documents, [ArgumentsOfCorrectTypeRule, DefaultValuesOfCorrectTypeRule, FragmentsOnCompositeTypesRule, KnownTypeNamesRule, LoneAnonymousOperationRule, PossibleFragmentSpreadsRule, ScalarLeafsRule, VariablesAreInputTypesRule, VariablesInAllowedPositionRule]));
                } catch (e) {
                  // Find the name of file
                  regex = /Invariant Violation: RelayParser: (.*). Source: document `(.*)` file:/g;
                  m = void 0;
                  error = void 0;
                  docName = void 0;
                  filePath = void 0;

                  while ((m = regex.exec(e.toString())) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex.lastIndex) {
                      regex.lastIndex++;
                    }

                    // The result can be accessed through the `m`-variable.
                    m.forEach(function (match, groupIndex) {
                      if (groupIndex === 1) {
                        error = match;
                      } else if (groupIndex === 2) {
                        docName = match;
                      }
                      // console.log(`Found match, group ${groupIndex}: ${match}`)
                    });
                  }
                  docWithError = documents.find(function (doc) {
                    return doc.definitions.find(function (node) {
                      var value = node.name.value;

                      if (value === docName) {
                        filePath = namePathMap.get(value) || "";
                        return true;
                      }
                      return false;
                    });
                  });

                  if (docName && filePath && error) {
                    console.log("\nThere was an error while compiling your site's GraphQL queries in document \"" + docName + "\" in file \"" + filePath + "\".\n");
                    console.log("    ", error);
                    console.log("");
                  } else {
                    console.log("\nThere was an error while compiling your site's GraphQL queries\n" + e.toString());
                  }
                }

                printContext = printTransforms.reduce(function (ctx, transform) {
                  return transform(ctx, _this.schema);
                }, compilerContext);
                compiledNodes = new _map2.default();


                compilerContext.documents().forEach(function (node) {
                  if (node.kind !== "Root") return;

                  var name = node.name;

                  var filePath = namePathMap.get(name) || "";

                  (0, _invariant2.default)(!compiledNodes.has(filePath), "Gatsby: Pages may only specify one \"root\" query tag. " + "Combine them into a single query");

                  var text = (0, _filterContextForNode2.default)(printContext.getRoot(name), printContext).documents().map(_queryPrinter2.default.print).join("\n");

                  compiledNodes.set(filePath, {
                    name: name,
                    text: text,
                    path: _path2.default.join(_this.baseDir, filePath)
                  });
                });

                return _context3.abrupt("return", compiledNodes);

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function write(_x) {
        return _ref3.apply(this, arguments);
      }

      return write;
    }()
  }]);
  return Runner;
}();

function compile() {
  var _store$getState = _redux.store.getState(),
      program = _store$getState.program,
      schema = _store$getState.schema;

  var runner = new Runner(program.directory + "/src", schema);

  return runner.compileAll();
}
//# sourceMappingURL=query-compiler.js.map