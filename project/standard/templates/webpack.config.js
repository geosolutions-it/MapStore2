const assign = require('object-assign');
const path = require("path");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");

const webpackConfig = require('./MapStore2/webpack.config.js');
const themeEntries = require('./MapStore2/themes.js').themeEntries;
const extractThemesPlugin = require('./MapStore2/themes.js').extractThemesPlugin;

module.exports = assign({}, webpackConfig, {
    entry: assign({
        'webpack-dev-server': 'webpack-dev-server/client?http://0.0.0.0:8081', // WebpackDevServer host and port
        'webpack': 'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
        '__PROJECTNAME__': path.join(__dirname, "js", "app")
    }, themeEntries),
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/dist/",
        filename: "[name].js"
    },
    plugins: webpackConfig.plugins.map((plugin) => (
        (plugin instanceof LoaderOptionsPlugin)
            ? new LoaderOptionsPlugin({
                debug: true,
                options: {
                    postcss: {
                        plugins: [
                            require('postcss-prefix-selector')({prefix: '.__PROJECTNAME__', exclude: ['.ms2', '.__PROJECTNAME__', '[data-ms2-container]']})
                        ]
                    },
                    context: __dirname
                }
            })
            : plugin)),
    module: assign({}, webpackConfig.module, {
        rules: webpackConfig.module.rules.map((rule) => (
            rule.include ? assign({}, rule, {
                include: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
            }) : rule
        ))
    })
});

