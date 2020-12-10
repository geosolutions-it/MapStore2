const path = require("path");

const shared = require('../moduleFederation').shared;
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = ({prod = true}) => ({
    target: "web",
    mode: prod ? "production" : "development",
    entry: {},
    optimization: {
        concatenateModules: true,
        minimize: !!false
    },
    resolve: {
        fallback: {
            timers: false,
            stream: false
        },
        extensions: [".js", ".jsx"]
    },
    plugins: [new ModuleFederationPlugin({
        name: 'SampleExtension',
        filename: "index.js", // "bundle.[chunkhash:8].js", // [chunkhash:8]
        exposes: {
            './plugin': path.join(__dirname, "plugins", "SampleExtension")
        },
        shared
    }),
    new MiniCssExtractPlugin({
        filename: "assets/css/[name].css"
    })],
    module: {
        noParse: [/html2canvas/],
        rules: [
            {
                test: /\.css$/,
                use: [prod ? MiniCssExtractPlugin.loader : "style-loader", // HMR do not worj with minicss plugin
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: true
                        }
                    }]
            },
            {
                test: /\.jsx?$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        configFile: path.join(__dirname, '..', 'babel.config.js')
                    }
                }]
            }
        ]
    },
    output: {
        chunkFilename: 'assets/js/[name].[chunkhash:8].js', // to test - this helpse to move every other chunk in a directory
        path: path.join(__dirname, "dist")

    }
});
