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

const favicon = path.join(__dirname, '..', 'web', 'client', 'product', 'assets', 'img', 'favicon.png');

module.exports = require('./buildConfig')({
    bundles: {
        "mapstore2": path.join(paths.code, "product", "app"),
        "embedded": path.join(paths.code, "product", "embedded"),
        "ms2-api": path.join(paths.code, "product", "api"),
        "dashboard-embedded": path.join(paths.code, "product", "dashboardEmbedded"),
        "geostory-embedded": path.join(paths.code, "product", "geostoryEmbedded")
    },
    themeEntries,
    paths,
    plugins: [extractThemesPlugin, ModuleFederationPlugin],
    prod: true,
    prodPlugins: [
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'indexTemplate.html'),
            publicPath: 'dist/',
            chunks: ['mapstore2'],
            inject: "body",
            hash: true,
            favicon
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'embeddedTemplate.html'),
            publicPath: 'dist/',
            chunks: ['embedded'],
            inject: "body",
            hash: true,
            filename: 'embedded.html',
            favicon
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'apiTemplate.html'),
            publicPath: 'dist/',
            chunks: ['ms2-api'],
            inject: 'body',
            hash: true,
            filename: 'api.html',
            favicon
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'geostory-embedded-template.html'),
            publicPath: 'dist/',
            chunks: ['geostory-embedded'],
            inject: "body",
            hash: true,
            filename: 'geostory-embedded.html',
            favicon
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'dashboard-embedded-template.html'),
            publicPath: 'dist/',
            chunks: ['dashboard-embedded'],
            inject: 'body',
            hash: true,
            filename: 'dashboard-embedded.html',
            favicon
        })
    ]
});
