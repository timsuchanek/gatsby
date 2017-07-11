"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var startServer = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(program) {
    var directory, compilerConfig, devConfig, compiler, app, proxy, prefix, url, listener;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            directory = program.directory;

            // Start bootstrap process.

            _context.next = 3;
            return bootstrap(program);

          case 3:
            _context.next = 5;
            return developHtml(program).catch(function (err) {
              console.log(err);
              process.exit(1);
            });

          case 5:
            _context.next = 7;
            return webpackConfig(program, directory, "develop", program.port);

          case 7:
            compilerConfig = _context.sent;
            devConfig = compilerConfig.resolve();
            compiler = webpack(devConfig);
            app = express();

            app.use(require("webpack-hot-middleware")(compiler, {
              log: function log() {},
              path: "/__webpack_hmr",
              heartbeat: 10 * 1000
            }));
            app.use("/___graphql", graphqlHTTP({
              schema: store.getState().schema,
              graphiql: true
            }));

            app.use(express.static(__dirname + "/public"));

            app.use(require("webpack-dev-middleware")(compiler, {
              noInfo: true,
              quiet: true,
              publicPath: devConfig.output.publicPath
            }));

            // Set up API proxy.
            proxy = store.getState().config.proxy;

            if (proxy) {
              prefix = proxy.prefix, url = proxy.url;

              app.use(prefix + "/*", function (req, res) {
                var proxiedUrl = url + req.originalUrl;
                req.pipe(request(proxiedUrl)).pipe(res);
              });
            }

            // As last step, check if the file exists in the public folder.
            app.get("*", function (req, res) {
              // Load file but ignore errors.
              res.sendFile(process.cwd() + "/public/" + req.url, function (err) {
                if (err) {
                  res.status(404).end();
                }
              });
            });

            listener = app.listen(program.port, program.host, function (e) {
              if (e) {
                if (e.code === "EADDRINUSE") {
                  // eslint-disable-next-line max-len
                  console.log("Unable to start Gatsby on port " + program.port + " as there's already a process listing on that port.");
                } else {
                  console.log(e);
                }

                process.exit();
              } else {
                if (program.open) {
                  var opn = require("opn");
                  opn("http://" + listener.address().address + ":" + listener.address().port);
                }
                var host = listener.address().address === "127.0.0.1" ? "localhost" : listener.address().address;
              }
            });

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function startServer(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require("express");
var graphqlHTTP = require("express-graphql");
var glob = require("glob");
var request = require("request");
var bootstrap = require("../bootstrap");
var webpack = require("webpack");
var webpackConfig = require("./webpack.config");
var React = require("react");
var ReactDOMServer = require("react-dom/server");
var rl = require("readline");
var parsePath = require("parse-filepath");
var _ = require("lodash");

var _require = require("../redux"),
    store = _require.store;

var copyStaticDirectory = require("./copy-static-directory");
var developHtml = require("./develop-html");

// Watch the static directory and copy files to public as they're added or
// changed. Wait 10 seconds so copying doesn't interfer with the regular
// bootstrap.
setTimeout(function () {
  copyStaticDirectory();
}, 10000);

var rlInterface = rl.createInterface({
  input: process.stdin,
  output: process.stdout
});

var debug = require("debug")("gatsby:application");

module.exports = function (program) {
  var detect = require("detect-port");
  var port = typeof program.port === "string" ? parseInt(program.port, 10) : program.port;

  detect(port, function (err, _port) {
    if (err) {
      console.error(err);
      process.exit();
    }

    if (port !== _port) {
      // eslint-disable-next-line max-len
      var question = "Something is already running at port " + port + " \nWould you like to run the app at another port instead? [Y/n] ";

      return rlInterface.question(question, function (answer) {
        if (answer.length === 0 || answer.match(/^yes|y$/i)) {
          program.port = _port; // eslint-disable-line no-param-reassign
          console.log("changed the port");
        }

        return startServer(program);
      });
    }

    return startServer(program);
  });
};
//# sourceMappingURL=develop.js.map