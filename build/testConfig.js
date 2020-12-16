const assign = require('object-assign');
const nodePath = require('path');
const webpack = require('webpack');
const ProvidePlugin = require("webpack/lib/ProvidePlugin");

module.exports = ({browsers = [ 'ChromeHeadless' ], files, path, testFile, singleRun, basePath = ".", alias = {}}) => ({
    browsers,

    browserNoActivityTimeout: 30000,

    reportSlowerThan: 100,

    singleRun,

    frameworks: [ 'mocha', 'webpack' ],

    basePath,

    files,

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
        [testFile]: [ 'webpack', 'coverage' ]
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
                stream: false
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
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('development')
            }),
            new webpack.ProvidePlugin({
                process: 'process/browser'
            })
        ]
    },
    webpackServer: {
        noInfo: true
    }
});
