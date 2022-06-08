const assign = require('object-assign');
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");
const NormalModuleReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");
const NoEmitOnErrorsPlugin = require("webpack/lib/NoEmitOnErrorsPlugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const castArray = require('lodash/castArray');
/**
 * Webpack configuration builder.
 * Returns a webpack configuration object for the given parameters.
 * This function takes one single object as first argument, containing all the configurations described below. For backward compatibility, if arguments list is longer then one, the function will get the arguments as the parameters described below in the following order (**the argument list usage has been deprecated and will be removed in the future**).
 - bundles,
 - themeEntries,
 - paths,
 - plugins = [],
 - prod,
 - publicPath,
 - cssPrefix,
 - prodPlugins = [],
 - alias = {},
 - proxy,
 - devPlugins = []
 *
 * @param {object} config the object containing the various parameters
 * @param {object} config.bundles object that defines the javascript (or jsx) entry points and related bundles
 * to be built (bundle name -> entry point path)
 * @param {object} config.themeEntries object that defines the css (or less) entry points and related bundles
 * to be built (bundle name -> entry point path)
 * @param {object} config.paths object with paths used by the configuration builder:
 *  - dist: path to the output folder for the bundles
 *  - base: root folder of the project
 *  - framework: root folder of the MapStore2 framework
 *  - code: root folder(s) for javascript / jsx code, can be an array with several folders (e.g. framework code and
 *    project code)
 * @param {object} config.plugins plugin to be added
 * @param {boolean} config.prod flag for production / development mode (true = production)
 * @param {string} config.publicPath web public path for loading bundles (e.g. dist/)
 * @param {string} config.cssPrefix prefix to be appended on every generated css rule (e.g. ms2)
 * @param {array} config.prodPlugins plugins to be used only in production mode
 * @param {array} config.devPlugins plugins to be used only in development mode
 * @param {object} config.alias aliases to be used by webpack to resolve paths (alias -> real path)
 * @param {object} config.proxy webpack-devserver custom proxy configuration object
 * @param {object} config.devServer webpack devserver configuration object, available only with object syntax
 * @param {object} config.resolveModules webpack resolve configuration object, available only with object syntax
 * @param {object} config.projectConfig config mapped to __MAPSTORE_PROJECT_CONFIG__, available only with object syntax
 * @param {string} config.cesiumBaseUrl (optional) url for cesium assets, workers and widgets. It is needed only for custom project where the structure of dist folder is not following the default one
 * @returns a webpack configuration object
 * @example
 * // It's possible to use a single object argument to pass the parameters.
 * // this configuration is preferred and it will replace the previous arguments structure
 * const buildConfig = require('./buildConfig');
 * module.export = buildConfig({
 *  bundles: {},
 *  themeEntries: {},
 *  paths: {
 *      base: path.join(__dirname, ".."),
 *      dist: path.join(__dirname, "..", "web", "client", "dist"),
 *      framework: path.join(__dirname, "..", "web", "client"),
 *      code: path.join(__dirname, "..", "web", "client")
 *  },
 *  plugins: [],
 *  prod: false,
 *  publicPath: "dist/"
 * });
 */

/**
 * this function adds support for object argument in buildConfig
 * but it keeps compatibility with the previous arguments structure
 */
function mapArgumentsToObject(args, func) {
    if (args.length === 1) {
        return func(args[0]);
    }
    const [
        bundles,
        themeEntries,
        paths,
        plugins = [],
        prod,
        publicPath,
        cssPrefix,
        prodPlugins = [],
        alias = {},
        proxy,
        devPlugins = []
    ] = args;
    return func({ bundles, themeEntries, paths, plugins, prod, publicPath, cssPrefix, prodPlugins, alias, proxy, devPlugins});
}

const getCesiumPath = ({ prod, paths }) => {
    return prod
        ? path.join(paths.base, 'node_modules', 'cesium', 'Build', 'Cesium')
        : path.join(paths.base, 'node_modules', 'cesium', 'Source');
};

module.exports = (...args) => mapArgumentsToObject(args, ({
    bundles,
    themeEntries,
    paths,
    plugins = [],
    prod,
    publicPath,
    cssPrefix,
    prodPlugins = [],
    devPlugins = [],
    alias = {},
    proxy,
    // new optional only for single object argument
    projectConfig = {},
    devServer,
    resolveModules,
    cesiumBaseUrl
}) => ({
    target: "web",
    entry: assign({}, bundles, themeEntries),
    mode: prod ? "production" : "development",
    optimization: {
        minimize: !!prod,
        ...(prod && {
            minimizer: [
                // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`)
                `...`,
                new CssMinimizerPlugin() // minify css bundle
            ]
        })
    },
    output: {
        path: paths.dist,
        publicPath,
        filename: "[name].js",
        chunkFilename: prod ? (paths.chunks || "") + "[name].[hash].chunk.js" : (paths.chunks || "") + "[name].js"
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
        new DefinePlugin({ '__MAPSTORE_PROJECT_CONFIG__': JSON.stringify(projectConfig) }),
        new DefinePlugin({
            // Define relative base path in cesium for loading assets
            'CESIUM_BASE_URL': JSON.stringify(cesiumBaseUrl ? cesiumBaseUrl : path.join('dist', 'cesium'))
        }),
        new CopyWebpackPlugin([
            { from: path.join(getCesiumPath({ paths, prod }), 'Workers'), to: path.join(paths.dist, 'cesium', 'Workers') },
            { from: path.join(getCesiumPath({ paths, prod }), 'Assets'), to: path.join(paths.dist, 'cesium', 'Assets') },
            { from: path.join(getCesiumPath({ paths, prod }), 'Widgets'), to: path.join(paths.dist, 'cesium', 'Widgets') },
            { from: path.join(getCesiumPath({ paths, prod }), 'ThirdParty'), to: path.join(paths.dist, 'cesium', 'ThirdParty') }
        ]),
        new ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        }),
        new NormalModuleReplacementPlugin(/leaflet$/, path.join(paths.framework, "libs", "leaflet")),
        new NormalModuleReplacementPlugin(/proj4$/, path.join(paths.framework, "libs", "proj4")),
        // it's not possible to load directly from the module name `cesium/Build/Cesium/Widgets/widgets.css`
        // see https://github.com/CesiumGS/cesium/issues/9212
        new NormalModuleReplacementPlugin(/^cesium\/index\.css$/, path.join(paths.base, "node_modules", "cesium/Build/Cesium/Widgets/widgets.css")),
        new NoEmitOnErrorsPlugin()]
        .concat(castArray(plugins))
        .concat(prod ? prodPlugins : devPlugins),
    resolve: {
        fallback: {
            timers: false,
            stream: false
        },
        extensions: [".js", ".jsx"],
        alias: assign({}, {
            jsonix: '@boundlessgeo/jsonix',
            // next libs are added because of this issue https://github.com/geosolutions-it/MapStore2/issues/4569
            proj4: '@geosolutions/proj4',
            "react-joyride": '@geosolutions/react-joyride'
        }, alias),
        ...(resolveModules && { modules: resolveModules })
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
                        postcssOptions: {
                            plugins: {
                                "postcss-prefix-selector": {
                                    prefix: cssPrefix || '.ms2',
                                    exclude: ['.ms2', ':root', '[data-ms2-container]'].concat(cssPrefix ? [cssPrefix] : [])
                                }
                            }
                        }
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
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: {
                                    "postcss-prefix-selector": {
                                        prefix: cssPrefix || '.ms2',
                                        exclude: ['.ms2', ':root', '[data-ms2-container]'].concat(cssPrefix ? [cssPrefix] : [])
                                    }
                                }
                            }
                        }
                    },
                    'less-loader'
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
    devServer: devServer || {
        publicPath: "/dist/",
        proxy: proxy || {
            '/rest': {
                target: "https://dev-mapstore.geosolutionsgroup.com/mapstore",
                secure: false,
                headers: {
                    host: "dev-mapstore.geosolutionsgroup.com"
                }
            },
            '/pdf': {
                target: "https://dev-mapstore.geosolutionsgroup.com/mapstore",
                secure: false,
                headers: {
                    host: "dev-mapstore.geosolutionsgroup.com"
                }
            },
            '/mapstore/pdf': {
                target: "https://dev-mapstore.geosolutionsgroup.com",
                secure: false,
                headers: {
                    host: "dev-mapstore.geosolutionsgroup.com"
                }
            },
            '/proxy': {
                target: "https://dev-mapstore.geosolutionsgroup.com/mapstore",
                secure: false,
                headers: {
                    host: "dev-mapstore.geosolutionsgroup.com"
                }
            },
            '/docs': {
                target: "http://localhost:8081",
                pathRewrite: {'/docs': '/mapstore/docs'}
            }
        }
    },

    devtool: !prod ? 'eval' : undefined
}));

