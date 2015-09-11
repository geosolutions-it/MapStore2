var webpackConfig = require('./webpack.config.js');
var path = require("path");
var UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var DefinePlugin = require("webpack/lib/DefinePlugin");
var NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");

webpackConfig.plugins = [
    new DefinePlugin({
        "__DEVTOOLS__": false
    }),
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': '"production"'
      }
    }),
    new CommonsChunkPlugin("commons", "mapstore-commons.js"),
    new NormalModuleReplacementPlugin(/leaflet$/, path.join(__dirname, "web", "client", "libs", "leaflet")),
    new NormalModuleReplacementPlugin(/openlayers$/, path.join(__dirname, "web", "client", "libs", "openlayers")),
    new NormalModuleReplacementPlugin(/proj4$/, path.join(__dirname, "web", "client", "libs", "proj4")),
    new UglifyJsPlugin({
        compress: {warnings: false},
        mangle: true
    })
];
webpackConfig.devtool = undefined;
webpackConfig.debug = false;

module.exports = webpackConfig;
