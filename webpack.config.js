var path = require("path");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var DefinePlugin = require("webpack/lib/DefinePlugin");
var NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");
var NoErrorsPlugin = require("webpack/lib/NoErrorsPlugin");

var rewriteUrl = function(replacePath) {
    return function(req, opt) {  // gets called with request and proxy object
        var queryIndex = req.url.indexOf('?');
        var query = queryIndex >= 0 ? req.url.substr(queryIndex) : "";
        req.url = req.path.replace(opt.path, replacePath) + query;
    };
};

module.exports = {
    entry: {
        'webpack-dev-server': 'webpack-dev-server/client?http://0.0.0.0:8081', // WebpackDevServer host and port
        'webpack': 'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
        viewer: path.join(__dirname, "web", "client", "examples", "viewer", "app"),
        mobile: path.join(__dirname, "web", "client", "examples", "viewer", "mobile"),
        home: path.join(__dirname, "web", "client", "examples", "home", "app"),
        mouseposition: path.join(__dirname, "web", "client", "examples", "mouseposition", "app"),
        scalebar: path.join(__dirname, "web", "client", "examples", "scalebar", "app"),
        layertree: path.join(__dirname, "web", "client", "examples", "layertree", "app"),
        "3dviewer": path.join(__dirname, "web", "client", "examples", "3dviewer", "app")
    },
    output: {
      path: path.join(__dirname, "web", "client", "dist"),
        publicPath: "/dist/",
        filename: "[name].js"
    },
    plugins: [
        new DefinePlugin({
            "__DEVTOOLS__": true
        }),
        new CommonsChunkPlugin("commons", "mapstore-commons.js"),
        new NormalModuleReplacementPlugin(/leaflet$/, path.join(__dirname, "web", "client", "libs", "leaflet")),
        new NormalModuleReplacementPlugin(/cesium$/, path.join(__dirname, "web", "client", "libs", "cesium")),
        new NormalModuleReplacementPlugin(/openlayers$/, path.join(__dirname, "web", "client", "libs", "openlayers")),
        new NormalModuleReplacementPlugin(/proj4$/, path.join(__dirname, "web", "client", "libs", "proj4")),
        new NoErrorsPlugin()
    ],
    resolve: {
      extensions: ["", ".js", ".jsx"]
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css'},
            { test: /\.(png|jpg|gif|svg)$/, loader: 'url-loader?name=[path][name].[ext]&limit=8192'}, // inline base64 URLs for <=8k images, direct URLs for the rest
            {
                test: /\.jsx$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                loader: "react-hot",
                include: path.join(__dirname, "web", "client")
            }, {
                test: /\.jsx?$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                loader: "babel-loader",
                include: path.join(__dirname, "web", "client"),
                query: {
                  "stage": 0,
                  "env": {
                    "development": {
                      "plugins": ["react-transform"],
                      "extra": {
                        "react-transform": {
                          "transforms": [{
                            "transform": "react-transform-catch-errors",
                            "imports": [
                              "react",
                              "redbox-react"
                            ]
                          }]
                        }
                      }
                    }
                  }
                }
            }
        ]
    },
    devServer: {
        proxy: [{
            path: new RegExp("/mapstore/rest/geostore/(.*)"),
            rewrite: rewriteUrl("/geostore/rest/$1"),
            host: "mapstore.geo-solutions.it",
            target: "http://mapstore.geo-solutions.it"
        }, {
            path: new RegExp("/mapstore/proxy(.*)"),
            rewrite: rewriteUrl("/http_proxy/proxy$1"),
            host: "mapstore.geo-solutions.it",
            target: "http://mapstore.geo-solutions.it"
        }]
    },

    devtool: 'inline-source-map',
    debug: true
};
