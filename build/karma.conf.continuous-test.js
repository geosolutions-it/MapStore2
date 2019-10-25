const path = require("path");

module.exports = function karmaConfig(config) {
    config.set(require('./testConfig')({
        files: [
            './web/client/libs/Cesium/Build/Cesium/Cesium.js',
            'build/tests.webpack.js',
            { pattern: './web/client/test-resources/**/*', included: false },
            { pattern: './web/client/translations/**/*', included: false }
        ],
        browsers: ["Chrome"],
        basePath: "..",
        path: path.join(__dirname, "..", "web", "client"),
        testFile: 'build/tests.webpack.js',
        singleRun: false
    }));
};
