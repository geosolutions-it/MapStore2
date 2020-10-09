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

/*
The mapstore properties inside the package.json is a configuration retrieved at build time.
Why should we add this new configuration when we have localConfig.json, appConfig.js, ... ?

Because this configuration should be used to store information about the structure of the project.
We selected the package.json because it is a mandatory file for every project and maybe in the future
we could use also the title, description, version, ... properties to fill some fields automatically inside html template
or inside the application by declaring a global variable in webpack.
In this first example we are using only the new property theme that can be used to override the default theme entries.

example 1: this configuration will look inside the project for the theme/default/theme.less file.
It will override the default mapstore theme
// package.json
{
    ...,
    "mapstore": { "themes": [ "default" ]  },
    ...
}

example 2: this configuration will look inside the project for the theme/mystyle/theme.less file.
It will add a new entry to themes keeping the default style of mapstore

// package.json
{
    "mapstore": { "themes": [ "mystyle" ]  }
}

example 3: this configuration will look inside the project for the theme/default/theme.less and theme/mystyle/theme.less files.
It will add a new entry to themes and it will override the default mapstore theme

// package.json
{
    "mapstore": { "themes": [ "default", "mystyle" ]  }
}
*/
const mapstoreConfig = require(path.join(__dirname, "..", "..", "..", "..", "package.json")).mapstore || {};

module.exports = require('../../build/buildConfig')(
    {
        'mapstore': path.join(paths.code[0], "app")
    },
    {
        'themes/default': path.join(paths.framework, "themes", "default", "theme.less"),
        ...(mapstoreConfig.themes || []).reduce((acc, name) => ({
            ...acc,
            ['themes/' + name]: path.join(paths.base, "themes", name, "theme.less")
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
