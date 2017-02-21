var webpackConfig = require('./webpack.config.js');
var path = require("path");
var LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
var ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
var DefinePlugin = require("webpack/lib/DefinePlugin");
var NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");

var assign = require('object-assign');

assign(webpackConfig.entry, require('./examples.js'));

webpackConfig.plugins = [
    new LoaderOptionsPlugin({
        debug: false
    }),
    new DefinePlugin({
        "__DEVTOOLS__": false
    }),
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': '"production"'
      }
    }),
    new NormalModuleReplacementPlugin(/leaflet$/, path.join(__dirname, "web", "client", "libs", "leaflet")),
    new NormalModuleReplacementPlugin(/openlayers$/, path.join(__dirname, "web", "client", "libs", "openlayers")),
    new NormalModuleReplacementPlugin(/proj4$/, path.join(__dirname, "web", "client", "libs", "proj4")),
    new ParallelUglifyPlugin({
        uglifyJS: {
            sourceMap: false,
            compress: {warnings: false},
            mangle: true
        }
    })
];
webpackConfig.devtool = undefined;

// this is a workaround for this issue https://github.com/webpack/file-loader/issues/3
// use `__webpack_public_path__` in the index.html when fixed
webpackConfig.output.publicPath = "/mapstore/dist/";

module.exports = webpackConfig;
