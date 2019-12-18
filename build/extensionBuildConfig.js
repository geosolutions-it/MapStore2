const NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");
const NoEmitOnErrorsPlugin = require("webpack/lib/NoEmitOnErrorsPlugin");
const path = require('path');
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
const VirtualModulesPlugin = require('webpack-virtual-modules');

var virtualModules = new VirtualModulesPlugin({
    'node_modules/@mapstore/buildplugin': 'import(/* webpackChunkName: "' + process.env.name + '" */`../../' + process.env.source + '`);'
});

/**
 * Webpack configuration for building a single extension bundle (usable with dynamic plugins loading functionality).
 * Some environment variables are used to specify the plugin to be built:
 *  - name: name to be assigned to the plugin (and used as a prefix for the final bundle name)
 *  - source: path to the plugin entry point
 *  - version: will be appended to the bundle name to identify the build version
 *
 * example:
 * name=myextension source=web/client/extensions/MyExtension version=1111 npm run build-extension
 */
const paths = {
    base: path.join(__dirname, ".."),
    dist: path.join(__dirname, "..", "plugins"),
    framework: path.join(__dirname, "..", "web", "client"),
    code: path.join(__dirname, "..", "web", "client")
};
module.exports = {
    entry: {
        "wrapper": path.join(__dirname, "pluginWrapper")
    },
    mode: "production",
    optimization: {
        minimize: false,
        moduleIds: "named",
        chunkIds: "named"
    },
    output: {
        path: paths.dist,
        publicPath: "/dist",
        filename: "[name]." + process.env.version + ".chunk.js"
    },
    plugins: [
        virtualModules,
        new NormalModuleReplacementPlugin(/leaflet$/, path.join(paths.framework, "libs", "leaflet")),
        new NormalModuleReplacementPlugin(/proj4$/, path.join(paths.framework, "libs", "proj4")),
        new NoEmitOnErrorsPlugin(),
        new ParallelUglifyPlugin({
            uglifyJS: {
                sourceMap: false,
                mangle: true
            }
        })
    ],
    resolve: {
        extensions: [".js", ".jsx"],
        alias: {
            jsonix: '@boundlessgeo/jsonix'
        }
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
                exclude: /themes[\\\/]?.+\.less$/,
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
                test: /\.jsx?$/,
                exclude: /(ol\.js)$|(Cesium\.js)$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        configFile: path.join(__dirname, 'babel.config.js')
                    }
                }],
                include: [
                    paths.code,
                    path.join(paths.base, "node_modules", "query-string"),
                    path.join(paths.base, "node_modules", "strict-uri-encode"),
                    path.join(paths.base, "node_modules", "split-on-first")
                ]
            }
        ]
    }
};
