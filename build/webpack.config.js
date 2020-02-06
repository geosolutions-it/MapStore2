const path = require("path");

const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;
module.exports = require('./buildConfig')(
    {
        "mapstore2": path.join(__dirname, "..", "web", "client", "product", "app")
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
    "dist/",
    null,
    [],
    {},
    {
        '/geoserver': {
            target: "http://localhost:8040"
        },
        '/rest': {
            target: "https://dev.mapstore.geo-solutions.it/mapstore",
            secure: false,
            headers: {
                host: "dev.mapstore.geo-solutions.it"
            }
        },
        '/pdf': {
            target: "https://dev.mapstore.geo-solutions.it/mapstore",
            secure: false,
            headers: {
                host: "dev.mapstore.geo-solutions.it"
            }
        },
        '/mapstore/pdf': {
            target: "https://dev.mapstore.geo-solutions.it",
            secure: false,
            headers: {
                host: "dev.mapstore.geo-solutions.it"
            }
        },
        '/proxy': {
            target: "http://localhost:8040/mapstore"
        },
        '/docs': {
            target: "http://localhost:8081",
            pathRewrite: {'/docs': '/mapstore/docs'}
        }
    }
);
