const path = require("path");

const themeEntries = require('./MapStore2/themes.js').themeEntries;
const extractThemesPlugin = require('./MapStore2/themes.js').extractThemesPlugin;

module.exports = require('./MapStore2/buildConfig')(
    {
        '__PROJECTNAME__': path.join(__dirname, "js", "app"),
        '__PROJECTNAME__-embedded': path.join(__dirname, "MapStore2", "web", "client", "product", "embedded"),
        '__PROJECTNAME__-api': path.join(__dirname, "MapStore2", "web", "client", "product", "api")
    },
    themeEntries,
    {
        base: __dirname,
        dist: path.join(__dirname, "dist"),
        framework: path.join(__dirname, "MapStore2", "web", "client"),
        code: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
    },
    extractThemesPlugin,
    false,
    "/dist/",
    '.__PROJECTNAME__'
);
