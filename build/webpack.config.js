const path = require("path");

const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;
const moduleFederationPlugin = require('./moduleFederation.js').plugin;
const config = require('./buildConfig')({
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
    prod: false,
    publicPath: undefined,
    cssPrefix: undefined,
    proxy: {
        '/rest': {
            target: "http://localhost:8080/mapstore"
        },
        '/proxy': {
            target: "http://localhost:8080/mapstore"
        },
        '/extensions.json': {
            target: "http://localhost:8080/mapstore"
        },
        '/dist/extensions': {
            target: "http://localhost:8080/mapstore"
        },
        '/pdf': {
            target: "http://localhost:8080/mapstore"
        },
        '/mapstore/pdf': {
            target: "http://localhost:8080"
        },
        '/geofence': {
            target: "http://localhost:8080"
        }
    }
});
module.exports = config;
