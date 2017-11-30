const path = require("path");

const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;

module.exports = require('./buildConfig')(
    {
        "mapstore2": path.join(__dirname, "web", "client", "product", "app"),
        "embedded": path.join(__dirname, "web", "client", "product", "embedded"),
        "ms2-api": path.join(__dirname, "web", "client", "product", "api")
    },
    themeEntries,
    {
        base: __dirname,
        dist: path.join(__dirname, "web", "client", "dist"),
        framework: path.join(__dirname, "web", "client"),
        code: path.join(__dirname, "web", "client")
    },
    extractThemesPlugin,
    false,
    "/dist/"
);
