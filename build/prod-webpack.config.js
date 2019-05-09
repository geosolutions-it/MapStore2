const path = require("path");
const assign = require('object-assign');

const themeEntries = require('./themes.js').themeEntries;
const extractThemesPlugin = require('./themes.js').extractThemesPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = {
    base: path.join(__dirname, ".."),
    dist: path.join(__dirname, "..", "web", "client", "dist"),
    framework: path.join(__dirname, "..", "web", "client"),
    code: path.join(__dirname, "..", "web", "client")
};

module.exports = require('./buildConfig')(
    assign({
            "mapstore2": path.join(paths.code, "product", "app"),
            "embedded": path.join(paths.code, "product", "embedded"),
            "ms2-api": path.join(paths.code, "product", "api")
        },
        require('./examples')
    ),
    themeEntries,
    paths,
    extractThemesPlugin,
    true,
    "dist/",
    undefined,
    [
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'indexTemplate.html'),
            chunks: ['mapstore2'],
            inject: true,
            hash: true
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'embeddedTemplate.html'),
            chunks: ['embedded'],
            inject: true,
            hash: true,
            filename: 'embedded.html'
        }), new HtmlWebpackPlugin({
            template: path.join(paths.framework, 'apiTemplate.html'),
            chunks: ['ms2-api'],
            inject: 'head',
            hash: true,
            filename: 'api.html'
        })
    ]
);
