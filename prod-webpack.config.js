var webpackConfig = require('./webpack.config.js');
var UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var DefinePlugin = require("webpack/lib/DefinePlugin");

webpackConfig.plugins = [
    new DefinePlugin({
        "__DEVTOOLS__": false
    }),
    new CommonsChunkPlugin("commons", "mapstore-commons.js"),
    new UglifyJsPlugin({
        compress: {warnings: false},
        mangle: true
    })
];
webpackConfig.devtool = undefined;
webpackConfig.debug = false;

module.exports = webpackConfig;
