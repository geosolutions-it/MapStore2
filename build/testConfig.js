const assign = require('object-assign');
const nodePath = require('path');
const os = require('os');
const webpack = require('webpack');
const ProvidePlugin = require("webpack/lib/ProvidePlugin");

const {
    VERSION_INFO_DEFINE_PLUGIN
} = require('./BuildUtils');

const output = {
    path: nodePath.join(os.tmpdir(), '_karma_webpack_') + Math.floor(Math.random() * 1000000)
};

module.exports = ({browsers = [ 'ChromeHeadless' ], files, path, testFile, singleRun, basePath = ".", alias = {}}) => ({
    browsers,

    browserNoActivityTimeout: 30000,

    reportSlowerThan: 100,

    singleRun,

    frameworks: [ 'mocha', 'webpack' ],

    basePath,

    files: [
        ...files,
        // add all assets needed for Cesium library
        { pattern: './node_modules/cesium/Build/CesiumUnminified/**/*', included: false },
        // see https://github.com/ryanclark/karma-webpack/issues/498#issuecomment-790040818
        // this is needed in combination with the webpack output to load resources with url-loader such as png
        {
            pattern: `${output.path}/**/*`,
            watched: false,
            included: false
        }
    ],

    plugins: [
        require('karma-chrome-launcher'),
        'karma-webpack',
        'karma-mocha',
        'karma-mocha-reporter',
        'karma-coverage',
        'karma-coveralls',
        'karma-junit-reporter',
        'karma-firefox-launcher'

    ],

    preprocessors: {
        [testFile]: [ 'webpack' ]
    },

    reporters: [ 'mocha', 'coverage' ],

    junitReporter: {
        outputDir: './web/target/karma-tests-results',
        suite: ''
    },
    coverageReporter: {
        dir: './coverage/',
        reporters: [
            { type: 'html', subdir: 'report-html' },
            { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
            { type: 'lcovonly', subdir: '.' }
        ],
        instrumenterOptions: {
            istanbul: { noCompact: true }
        }
    },
    browserConsoleLogOptions: {
        terminal: true,
        level: 'DISABLE'
    },
    webpack: {
        devtool: 'eval',
        mode: 'development',
        output,
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            configFile: nodePath.join(__dirname, 'babel.config.js')
                        }
                    }],
                    include: path
                },
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
                    test: /\.(png|jpg|gif|svg)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            name: "[path][name].[ext]",
                            limit: 8192
                        }
                    }] // inline base64 URLs for <=8k images, direct URLs for the rest
                }
            ]
        },
        resolve: {
            fallback: {
                timers: false,
                stream: false,
                http: false,
                https: false,
                zlib: false
            },
            alias: assign({}, {
                jsonix: '@boundlessgeo/jsonix',
                // next libs are added because of this issue https://github.com/geosolutions-it/MapStore2/issues/4569
                // proj4: '@geosolutions/proj4',
                "react-joyride": '@geosolutions/react-joyride'
            }, alias),
            extensions: ['.js', '.json', '.jsx']
        },
        plugins: [
            new ProvidePlugin({
                Buffer: ['buffer', 'Buffer']
            }),
            // needed complete env object for cesium tests
            new webpack.DefinePlugin({
                process: { env: { 'NODE_ENV': JSON.stringify('development') } }
            }),
            new webpack.DefinePlugin({
                '__MAPSTORE_PROJECT_CONFIG__': JSON.stringify({})
            }),
            new webpack.DefinePlugin({
                // Define relative base path in cesium for loading assets
                'CESIUM_BASE_URL': JSON.stringify('base/node_modules/cesium/Build/CesiumUnminified')
            }),
            VERSION_INFO_DEFINE_PLUGIN
        ]
    },
    webpackServer: {
        noInfo: true
    }
});
