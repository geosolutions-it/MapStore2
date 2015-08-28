var path = require("path");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var rewriteUrl = function(replacePath) {
    return function(req, opt) {  // gets called with request and proxy object
        var queryIndex = req.url.indexOf('?');
        var query = queryIndex >= 0 ? req.url.substr(queryIndex) : "";
        req.url = req.path.replace(opt.path, replacePath) + query;
    };
};

module.exports = {
    entry: {
        viewer: path.join(__dirname, "web", "client", "examples", "viewer", "app"),
        manager: path.join(__dirname, "web", "client", "examples", "manager", "app")
    },
    output: {
      path: path.join(__dirname, "web", "client", "dist"),
        publicPath: "/dist/",
        filename: "[name].js"
    },
    plugins: [
        new CommonsChunkPlugin("commons", "mapstore-commons.js")
    ],
    resolve: {
      extensions: ["", ".js", ".jsx"]
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loader: "babel-loader" }
        ]
    },
    devServer: {
        proxy: [{
            path: new RegExp("/mapstore/rest/geostore/(.*)"),
            rewrite: rewriteUrl("/geostore/rest/$1"),
            host: "mapstore.geo-solutions.it",
            target: "http://mapstore.geo-solutions.it"
        }]
    },

    devtool: 'inline-source-map',
    debug: true
};
