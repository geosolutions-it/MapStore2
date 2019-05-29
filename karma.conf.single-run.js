const path = require("path");

module.exports = function karmaConfig(config) {
    const testConfig = require('./testConfig')({
        files: [
            'tests-travis.webpack.js',
            { pattern: './web/client/test-resources/**/*', included: false },
            { pattern: './web/client/translations/**/*', included: false }
        ],
        path: path.join(__dirname, "web", "client"),
        testFile: 'tests-travis.webpack.js',
        singleRun: true
    });
    testConfig.webpack.module.rules = [{
                    test: /\.jsx?$/,
                    exclude: /(__tests__|node_modules|legacy|libs\\Cesium|libs\\html2canvas)\\|(__tests__|node_modules|legacy|libs\/Cesium|libs\/html2canvas)\/|webpack\.js|utils\/(openlayers|leaflet)/,
                    enforce: "pre",
                    use: [
                        {
                            loader: 'babel-istanbul-loader'
                        }
                    ]
                }, ...testConfig.webpack.module.rules];
    config.set(testConfig);
};
