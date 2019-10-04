const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;

const path = require("path");

module.exports = require('./buildConfig')(
    process.env.example ? {
        [process.env.example]: path.join(__dirname, "..", "web", "client", "examples", process.env.example, "app")
    } : require('./examples.js'),
    themeEntries,
    {
        base: path.join(__dirname, ".."),
        dist: path.join(__dirname, "..", "web", "client", "dist"),
        framework: path.join(__dirname, "..", "web", "client"),
        code: path.join(__dirname, "..", "web", "client")
    },
    extractThemesPlugin,
    false,
    "/dist/"
);
