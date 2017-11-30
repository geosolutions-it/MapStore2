const path = require("path");
const assign = require('object-assign');

const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;

module.exports = require('./buildConfig')(
    assign({
            "mapstore2": path.join(__dirname, "web", "client", "product", "app"),
            "embedded": path.join(__dirname, "web", "client", "product", "embedded"),
            "ms2-api": path.join(__dirname, "web", "client", "product", "api")
        },
        require('./examples')
    ),
    themeEntries,
    {
        base: __dirname,
        dist: path.join(__dirname, "web", "client", "dist"),
        framework: path.join(__dirname, "web", "client"),
        code: path.join(__dirname, "web", "client")
    },
    extractThemesPlugin,
    true,
    "/mapstore/dist/"
);
