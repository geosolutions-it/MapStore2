const assign = require('object-assign');
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");
const NoEmitOnErrorsPlugin = require("webpack/lib/NoEmitOnErrorsPlugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * Webpack configuration builder.
 * Returns a webpack configuration object for the given parameters.
 *
 * @param {object} bundles object that defines the javascript (or jsx) entry points and related bundles
 * to be built (bundle name -> entry point path)
 * @param {object} themeEntries object that defines the css (or less) entry points and related bundles
 * to be built (bundle name -> entry point path)
 * @param {object} paths object with paths used by the configuration builder:
 *  - dist: path to the output folder for the bundles
 *  - base: root folder of the project
 *  - framework: root folder of the MapStore2 framework
 *  - code: root folder(s) for javascript / jsx code, can be an array with several folders (e.g. framework code and
 *    project code)
 * @param {object} extractThemesPlugin plugin to be used for bundling css (usually defined in themes.js)
 * @param {boolean} prod flag for production / development mode (true = production)
 * @param {string} publicPath web public path for loading bundles (e.g. dist/)
 * @param {string} cssPrefix prefix to be appended on every generated css rule (e.g. ms2)
 * @param {array} prodPlugins plugins to be used only in production mode
 * @param {object} alias aliases to be used by webpack to resolve paths (alias -> real path)
 * @param {object} proxy webpack-devserver custom proxy configuration object
 * @returns a webpack configuration object
 */
module.exports = (bundles, themeEntries, paths, extractThemesPlugin, prod, publicPath, cssPrefix, prodPlugins, alias = {}, proxy) => ({
    entry: assign({
        'webpack-dev-server': 'webpack-dev-server/client?http://0.0.0.0:8081', // WebpackDevServer host and port
        'webpack': 'webpack/hot/only-dev-server' // "only" prevents reload on syntax errors
    }, bundles, themeEntries),
    mode: prod ? "production" : "development",
    optimization: {
        minimize: !!prod,
        moduleIds: "named",
        chunkIds: "named"
    },
    output: {
        path: paths.dist,
        publicPath,
        filename: "[name].js",
        chunkFilename: prod ? "[name].[hash].chunk.js" : "[name].js"
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: path.join(paths.base, 'node_modules', 'bootstrap', 'less'), to: path.join(paths.dist, "bootstrap", "less") }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.base, 'node_modules', 'react-nouislider', 'example'), to: path.join(paths.dist, "react-nouislider", "example") }
        ]),
        new LoaderOptionsPlugin({
            debug: !prod,
            options: {
                context: paths.base
            }
        }),
        new DefinePlugin({
            "__DEVTOOLS__": !prod
        }),
        new DefinePlugin({
            'process.env': {
                'NODE_ENV': prod ? '"production"' : '""'
            }
        }),
        new NormalModuleReplacementPlugin(/leaflet$/, path.join(paths.framework, "libs", "leaflet")),
        new NormalModuleReplacementPlugin(/proj4$/, path.join(paths.framework, "libs", "proj4")),
        new NoEmitOnErrorsPlugin(),
        extractThemesPlugin
    ].concat(prod && prodPlugins || []),
    resolve: {
        extensions: [".js", ".jsx"],
        alias: assign({}, {
            jsonix: '@boundlessgeo/jsonix',
            // next libs are added because of this issue https://github.com/geosolutions-it/MapStore2/issues/4569
            proj4: '@geosolutions/proj4',
            "react-joyride": '@geosolutions/react-joyride'
        }, alias)
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
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('postcss-prefix-selector')({ prefix: cssPrefix || '.ms2', exclude: ['.ms2', '[data-ms2-container]'].concat(cssPrefix ? [cssPrefix] : []) })
                        ]
                    }
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
                test: /themes[\\\/]?.+\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('postcss-prefix-selector')({ prefix: cssPrefix || '.ms2', exclude: ['.ms2', '[data-ms2-container]'].concat(cssPrefix ? [cssPrefix] : []) })
                            ]
                        }
                    }, 'less-loader'
                ]
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
                    paths.framework,
                    path.join(paths.base, "node_modules", "query-string"),
                    path.join(paths.base, "node_modules", "strict-uri-encode"),
                    path.join(paths.base, "node_modules", "react-draft-wysiwyg"), // added for issue #4602
                    path.join(paths.base, "node_modules", "split-on-first")
                ]
            }
        ].concat(prod ? [{
            test: /\.html$/,
            loader: 'html-loader'
        }] : [])
    },
    devServer: {
        proxy: proxy || {
            '/rest': {
                target: "https://dev.mapstore.geo-solutions.it/mapstore",
                secure: false,
                headers: {
                    host: "dev.mapstore.geo-solutions.it"
                }
            },
            '/pdf': {
                target: "https://dev.mapstore.geo-solutions.it/mapstore",
                secure: false,
                headers: {
                    host: "dev.mapstore.geo-solutions.it"
                }
            },
            '/mapstore/pdf': {
                target: "https://dev.mapstore.geo-solutions.it",
                secure: false,
                headers: {
                    host: "dev.mapstore.geo-solutions.it"
                }
            },
            '/proxy': {
                target: "https://dev.mapstore.geo-solutions.it/mapstore",
                secure: false,
                headers: {
                    host: "dev.mapstore.geo-solutions.it"
                }
            },
            '/docs': {
                target: "http://localhost:8081",
                pathRewrite: {'/docs': '/mapstore/docs'}
            }
        }
    },

    devtool: !prod ? 'eval' : undefined
});
