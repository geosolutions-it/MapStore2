var webpackConfig = require('./webpack.config.js');
var UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");

webpackConfig.plugins.push(
    new UglifyJsPlugin({
        compress: {warnings: false},
        mangle: true
    })
);
webpackConfig.devtool = undefined;
webpackConfig.debug = false;

module.exports = webpackConfig;
