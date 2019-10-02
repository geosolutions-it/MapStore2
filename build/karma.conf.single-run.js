const path = require("path");

module.exports = function karmaConfig(config) {
    const testConfig = require('./testConfig')({
        files: [
            'build/tests-travis.webpack.js',
            { pattern: './web/client/test-resources/**/*', included: false },
            { pattern: './web/client/translations/**/*', included: false }
        ],
        path: path.join(__dirname, "..", "web", "client"),
        basePath: "..",
        testFile: 'build/tests-travis.webpack.js',
        singleRun: true
    });
    testConfig.webpack.module.rules = [{
        test: /\.jsx?$/,
        exclude: /(__tests__|node_modules|legacy|libs\\Cesium|libs\\html2canvas)\\|(__tests__|node_modules|legacy|libs\/Cesium|libs\/html2canvas)\/|webpack\.js|utils\/(openlayers|leaflet)/,
        enforce: "post",
        use: [
            {
                loader: 'istanbul-instrumenter-loader',
                options: { esModules: true }
            }
        ]
    }, ...testConfig.webpack.module.rules];
    config.set(testConfig);
};
