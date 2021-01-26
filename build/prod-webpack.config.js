const path = require("path");

const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('./moduleFederation').plugin;
const paths = {
    base: path.join(__dirname, ".."),
    dist: path.join(__dirname, "..", "web", "client", "dist"),
    framework: path.join(__dirname, "..", "web", "client"),
    code: path.join(__dirname, "..", "web", "client")
};

module.exports = require('./buildConfig')(
    {
        "mapstore2": path.join(paths.code, "product", "app"),
        "embedded": path.join(paths.code, "product", "embedded"),
        "ms2-api": path.join(paths.code, "product", "api"),
        "dashboard-embedded": path.join(paths.code, "product", "dashboardEmbedded"),
        "geostory-embedded": path.join(paths.code, "product", "geostoryEmbedded")
    },
    themeEntries,
    paths,
    [extractThemesPlugin, ModuleFederationPlugin],
    true,
    "dist/",
    undefined,
    [
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'indexTemplate.html'),
            chunks: ['mapstore2'],
            inject: "body",
            hash: true
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'embeddedTemplate.html'),
            chunks: ['embedded'],
            inject: "body",
            hash: true,
            filename: 'embedded.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'apiTemplate.html'),
            chunks: ['ms2-api'],
            inject: 'head',
            hash: true,
            filename: 'api.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'geostory-embedded-template.html'),
            chunks: ['geostory-embedded'],
            inject: "body",
            hash: true,
            filename: 'geostory-embedded.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'dashboard-embedded-template.html'),
            chunks: ['dashboard-embedded'],
            inject: 'body',
            hash: true,
            filename: 'dashboard-embedded.html'
        })
    ]
);
