const path = require("path");

const extractThemesPlugin = require('../../build/themes.js').extractThemesPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = {
    base: path.join(__dirname, "..", "..", "..", ".."),
    dist: path.join(__dirname, "..", "..", "..", ".."),
    framework: path.join(__dirname, "..", "..", "..", "..", "node_modules", "mapstore", "web", "client"),
    code: [
        path.join(__dirname, "..", "..", "..", "..", "js"),
        path.join(__dirname, "..", "..", "..", "..", "node_modules", "mapstore", "web", "client")
    ]
};

const mapstoreConfig = require(path.join(__dirname, "..", "..", "..", "..", "package.json")).mapstore || {};

module.exports = require('../../build/buildConfig')(
    {
        'mapstore': path.join(paths.code[0], "app")
    },
    {
        'themes/default': path.join(paths.code[0], "themes", "default", "theme.less"),
        ...mapstoreConfig.themes.reduce((acc, name) => ({
            ['themes/' + name]: path.join(paths.code[0], "themes", name, "theme.less")
        }), {})
    },
    paths,
    extractThemesPlugin,
    false,
    "/",
    '.mapstore',
    [],
    {
        "@mapstore": path.resolve(__dirname, "..", "..", "..", "web", "client"),
        "@js": path.resolve(__dirname, "..", "..", "..", "..", "js")
    },
    undefined,
    [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'indexTemplate.html'),
            chunks: ['mapstore'],
            inject: "body",
            hash: true,
            filename: 'index.html'
        })
    ]
);
