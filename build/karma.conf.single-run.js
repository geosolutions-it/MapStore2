const path = require("path");

module.exports = function karmaConfig(config) {

    // set BABEL_ENV to load proper preset config (e.g. istanbul plugin)
    process.env.BABEL_ENV = 'test';
    const testConfig = require('./testConfig')({
        files: [
            'build/tests-firefox.webpack.js',
            { pattern: './web/client/test-resources/**/*', included: false },
            { pattern: './web/client/translations/**/*', included: false }
        ],
        path: path.join(__dirname, "..", "web", "client"),
        basePath: path.join(__dirname, ".."),
        testFile: 'build/tests-firefox.webpack.js',
        singleRun: true
    });
    config.set(testConfig);
};
