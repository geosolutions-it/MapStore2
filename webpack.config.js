var path = require("path");
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
        "mapstore2": path.join(__dirname, "web", "client", "product", "app")
    },
    output: {
      path: path.join(__dirname, "web", "client", "dist"),
        publicPath: "/dist/",
        filename: "[name].js"
    },
    plugins: [
        new DefinePlugin({
            "__DEVTOOLS__": true,
            "__API_KEY_MAPQUEST__": JSON.stringify(process.env.__API_KEY_MAPQUEST__ || '')
        }),
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
            { test: /\.less$/, loader: "style!css!less-loader" },
            { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, loader: "url-loader?mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader?name=[path][name].[ext]&limit=8192'}, // inline base64 URLs for <=8k images, direct URLs for the rest
            {
                test: /\.jsx$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                loader: "react-hot",
                include: path.join(__dirname, "web", "client")
            }, {
                test: /\.jsx?$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                loader: "babel-loader",
                include: path.join(__dirname, "web", "client")
            }
        ]
    },
    devServer: {
        proxy: [{
            path: new RegExp("/mapstore/rest/geostore/(.*)"),
            rewrite: rewriteUrl("/mapstore/rest/geostore/$1"),
            host: "dev.mapstore2.geo-solutions.it",
            target: "http://dev.mapstore2.geo-solutions.it"
        }, {
            path: new RegExp("/mapstore/proxy(.*)"),
            rewrite: rewriteUrl("/mapstore/proxy$1"),
            host: "dev.mapstore2.geo-solutions.it",
            target: "http://dev.mapstore2.geo-solutions.it"
        }]
    },

    devtool: 'eval',
    debug: true
};
