const themeEntries = require('../themes.js').themeEntries;
const extractThemesPlugin = require('../themes.js').extractThemesPlugin;

const path = require("path");
const assign = require('object-assign');

module.exports = assign(require('../buildConfig')(
    {
        extensions: path.join(__dirname, "app")
    },
    themeEntries,
    {
        base: path.join(__dirname, "..", ".."),
        dist: path.join(__dirname, "dist"),
        framework: path.join(__dirname, "..", "..", "web", "client"),
        code: path.join(__dirname)
    },
    extractThemesPlugin,
    true,
    "/dist/"
), {
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/dist/",
        filename: "[name].js",
        chunkFilename: "[name].js"
    }
});
