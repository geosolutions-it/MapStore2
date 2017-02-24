var path = require("path");
var DefinePlugin = require("webpack/lib/DefinePlugin");
var LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
var NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");
var NoEmitOnErrorsPlugin = require("webpack/lib/NoEmitOnErrorsPlugin");

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
        new LoaderOptionsPlugin({
            debug: true
        }),
        new DefinePlugin({
            "__DEVTOOLS__": true,
            "__API_KEY_MAPQUEST__": JSON.stringify(process.env.__API_KEY_MAPQUEST__ || '')
        }),
        new NormalModuleReplacementPlugin(/leaflet$/, path.join(__dirname, "web", "client", "libs", "leaflet")),
        new NormalModuleReplacementPlugin(/cesium$/, path.join(__dirname, "web", "client", "libs", "cesium")),
        new NormalModuleReplacementPlugin(/openlayers$/, path.join(__dirname, "web", "client", "libs", "openlayers")),
        new NormalModuleReplacementPlugin(/proj4$/, path.join(__dirname, "web", "client", "libs", "proj4")),
        new NoEmitOnErrorsPlugin()
    ],
    resolve: {
      extensions: [".js", ".jsx"]
    },
    module: {
        noParse: [/html2canvas/],
        rules: [
            {
                test: /\.css$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }]
            },
            {
                test: /\.less$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'less-loader'
                }]
            },
            {
                test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        mimetype: "application/font-woff"
                    }
                }]
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: "[name].[ext]"
                    }
                }]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: "[path][name].[ext]",
                        limit: 8192
                    }
                }] // inline base64 URLs for <=8k images, direct URLs for the rest
            },
            {
                test: /\.jsx$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                use: [{
                    loader: "react-hot-loader"
                }],
                include: path.join(__dirname, "web", "client")
            }, {
                test: /\.jsx?$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                use: [{
                    loader: "babel-loader"
                }],
                include: path.join(__dirname, "web", "client")
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
