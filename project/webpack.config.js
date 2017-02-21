var path = require("path");
var DefinePlugin = require("webpack/lib/DefinePlugin");
var LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
var NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");
var NoEmitOnErrorsPlugin = require("webpack/lib/NoEmitOnErrorsPlugin");

module.exports = {
    entry: {
        'webpack-dev-server': 'webpack-dev-server/client?http://0.0.0.0:8081', // WebpackDevServer host and port
        'webpack': 'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
        '__PROJECTNAME__': path.join(__dirname, "js", "app")
    },
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/dist/",
        filename: "[name].js"
    },
    plugins: [
        new LoaderOptionsPlugin({
            debug: true
        }),
        new DefinePlugin({
            "__DEVTOOLS__": true
        }),
        new NormalModuleReplacementPlugin(/leaflet$/, path.join(__dirname, "MapStore2", "web", "client", "libs", "leaflet")),
        new NormalModuleReplacementPlugin(/openlayers$/, path.join(__dirname, "MapStore2", "web", "client", "libs", "openlayers")),
        new NormalModuleReplacementPlugin(/cesium$/, path.join(__dirname, "MapStore2", "web", "client", "libs", "cesium")),
        new NormalModuleReplacementPlugin(/proj4$/, path.join(__dirname, "MapStore2", "web", "client", "libs", "proj4")),
        new NoEmitOnErrorsPlugin()
    ],
    resolve: {
      extensions: [".js", ".jsx"]
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader'},
            { test: /\.less$/, loader: "style-loader!css-loader!less-loader" },
            { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, loader: "url-loader?mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader?name=[path][name].[ext]&limit=8192'}, // inline base64 URLs for <=8k images, direct URLs for the rest
            {
                test: /\.jsx?$/,
                exclude: /(ol\.js)$|(Cesium\.js)$|(cesium\.js)$/,
                loader: "react-hot-loader",
                include: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
            }, {
                test: /\.jsx?$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                loader: "babel-loader",
                include: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
            }
        ]
    },
    devServer: {
        proxy: {
            '/mapstore/rest/geostore': {
                target: "http://dev.mapstore2.geo-solutions.it"
            },
            '/mapstore/proxy': {
                target: "http://dev.mapstore2.geo-solutions.it"
            }
        }
    },

    devtool: 'eval'
};
