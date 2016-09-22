var path = require("path");
module.exports = function karmaConfig(config) {
    config.set({

        browsers: [ 'Chrome' ],

        singleRun: false,

        frameworks: [ 'mocha' ],

        files: [
            'web/client/libs/Cesium/Build/Cesium/Cesium.js',
            'tests.webpack.js',
            { pattern: './web/client/test-resources/**/*', included: false },
            { pattern: './web/client/translations/**/*', included: false }
        ],

        preprocessors: {
            'tests.webpack.js': [ 'webpack', 'sourcemap' ]
        },

        reporters: [ 'mocha', 'coverage', 'coveralls' ],

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

        webpack: {
            devtool: 'eval',
            module: {
                loaders: [
                    { test: /\.jsx?$/, exclude: /(ol\.js$|node_modules)/, loader: 'babel-loader', include: path.join(__dirname, "web", "client") },
                    { test: /\.css$/, loader: 'style!css'},
                    { test: /\.less$/, loader: "style!css!less-loader" },
                    { test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, loader: "url-loader?mimetype=application/font-woff" },
                    { test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, loader: "file-loader?name=[name].[ext]" },
                    { test: /\.(png|jpg|gif|svg)$/, loader: 'url-loader?name=[path][name].[ext]&limit=8192'} // inline base64 URLs for <=8k images, direct URLs for the rest
                ],
                postLoaders: [ ]
            },
            resolve: {
                extensions: ['', '.js', '.json', '.jsx']
            }
        },

        webpackServer: {
            noInfo: true
        }

    });
};
