const path = require("path");

const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;
module.exports = require('./buildConfig')(
    {
        [process.env.bundle || "mapstore2"]: path.join(__dirname, "..", "web", "client", "product", process.env.entrypoint || process.env.bundle || "app")
    },
    { ["themes/default"]: themeEntries["themes/" + (process.env.theme || "default")]},
    {
        base: path.join(__dirname, ".."),
        dist: path.join(__dirname, "..", "web", "client", "dist"),
        framework: path.join(__dirname, "..", "web", "client"),
        code: path.join(__dirname, "..", "web", "client")
    },
    extractThemesPlugin,
    false,
    "dist/"
);
