const path = require("path");

module.exports = function karmaConfig(config) {
    config.set(require('./MapStore2/build/testConfig')({
        files: [
            'tests.webpack.js',
            { pattern: './js/test-resources/**/*', included: false }
        ],
        path: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")],
        testFile: 'tests.webpack.js',
        singleRun: false,
        alias: {
            "@mapstore": path.resolve(__dirname, "MapStore2", "web", "client"),
            "@js": path.resolve(__dirname, "js")
        }
    }));
};
