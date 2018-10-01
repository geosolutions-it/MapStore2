module.exports = ({files, path, testFile, singleRun}) => ({
    browsers: [ 'Chrome' ],

    browserNoActivityTimeout: 30000,

    reportSlowerThan: 100,

    singleRun,

    frameworks: [ 'mocha' ],

    files,

    preprocessors: {
        [testFile]: [ 'webpack', 'sourcemap' ]
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
    browserConsoleLogOptions: {
        terminal: true,
        level: 'DISABLE'
    },
    webpack: {
        devtool: 'eval',
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(ol\.js$|node_modules)/,
                    use: [{
                        loader: 'babel-loader'
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
            extensions: ['.js', '.json', '.jsx']
        }
    },
    webpackServer: {
        noInfo: true
    }
});
