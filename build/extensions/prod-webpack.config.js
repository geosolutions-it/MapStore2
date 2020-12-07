const path = require("path");
const assign = require('object-assign');

const shared = require('../moduleFederation').shared;
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');


const prod = true;
const paths = {
    base: path.join(__dirname, "..", ".."),
    dist: path.join(__dirname, "dist"),
    framework: path.join(__dirname, "..", "..", "web", "client"),
    code: path.join(__dirname)
};
module.exports = {
    target: "web",
    mode: prod ? "production" : "development",
    entry: {},
    optimization: {
        concatenateModules: true,
        minimize: !!false,
        chunkIds: "named"
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
        filename: "sampleExtension.js",
        exposes: {
            './plugin': path.join(__dirname, "plugins", "SampleExtension")
        },
        shared
    })],
    module: {
        noParse: [/html2canvas/],
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        configFile: path.join(__dirname, '..', 'babel.config.js')
                    }
                }],
                include: [
                    paths.code,
                    paths.framework
                ]
            }
        ].concat(prod ? [{
            test: /\.html$/,
            loader: 'html-loader'
        }] : [])
    },
    output: {
        publicPath: './',
        path: path.join(__dirname, "dist")

    }
};
