const path = require("path");

module.exports = function karmaConfig(config) {
    config.set(require('./testConfig')({
        files: [
            'web/client/libs/Cesium/Build/Cesium/Cesium.js',
            'tests.webpack.js',
            { pattern: './web/client/test-resources/**/*', included: false },
            { pattern: './web/client/translations/**/*', included: false }
        ],
        path: path.join(__dirname, "web", "client"),
        testFile: 'tests.webpack.js',
        singleRun: false
    }));
};
