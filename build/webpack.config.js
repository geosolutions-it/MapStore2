const path = require("path");

const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;
const moduleFederationPlugin = require('./moduleFederation.js').plugin;
const config = require('./buildConfig')(
    {
        bundles: {
            [process.env.bundle || "mapstore2"]: path.join(__dirname, "..", "web", "client", "product", process.env.entrypoint || process.env.bundle || "app"),
            "embedded": path.join(__dirname, "..", "web", "client", "product", "embedded"),
            "ms2-api": path.join(__dirname, "..", "web", "client", "product", "api"),
            "dashboard-embedded": path.join(__dirname, "..", "web", "client", "product", "dashboardEmbedded"),
            "geostory-embedded": path.join(__dirname, "..", "web", "client", "product", "geostoryEmbedded")
        },
        themeEntries,
        paths: {
            base: path.join(__dirname, ".."),
            dist: path.join(__dirname, "..", "web", "client", "dist"),
            framework: path.join(__dirname, "..", "web", "client"),
            code: path.join(__dirname, "..", "web", "client")
        },
        plugins: [extractThemesPlugin, moduleFederationPlugin],
        prod: false
    }
);
module.exports = config;
