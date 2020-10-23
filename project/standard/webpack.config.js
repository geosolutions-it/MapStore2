/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');
const fs = require('fs');
const extractThemesPlugin = require('../../build/themes.js').extractThemesPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const appDirectory = fs.realpathSync(process.cwd());

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
    'mapstore': { 'themes': [ 'default' ]  },
    ...
}

example 2: this configuration will look inside the project for the theme/mystyle/theme.less file.
It will add a new entry to themes keeping the default style of mapstore

// package.json
{
    'mapstore': { 'themes': [ 'mystyle' ]  }
}

example 3: this configuration will look inside the project for the theme/default/theme.less and theme/mystyle/theme.less files.
It will add a new entry to themes and it will override the default mapstore theme

// package.json
{
    'mapstore': { 'themes': [ 'default', 'mystyle' ]  }
}
*/
const mapstoreConfig = require(path.join(appDirectory, 'package.json')).mapstore || {};
const publicPath = '/';
const output = '/';
const themePrefix = 'mapstore';
const buildConfig = require('../../build/buildConfig');

let frameworkPath = path.join(appDirectory, 'web', 'client');
let appEntriesDirectory = path.join(appDirectory, 'web', 'client', 'product');

if (fs.existsSync(path.resolve(appDirectory, './MapStore2'))) {
    frameworkPath = path.join(appDirectory, 'MapStore2', 'web', 'client');
    appEntriesDirectory = path.join(appDirectory, 'js');
}

if (fs.existsSync(path.resolve(appDirectory, './node_modules/mapstore'))) {
    frameworkPath = path.join(appDirectory, 'node_modules', 'mapstore', 'web', 'client');
    appEntriesDirectory = path.join(appDirectory, 'js');
}

const paths = {
    base: path.resolve(appDirectory),
    dist: path.resolve(appDirectory, output),
    framework: frameworkPath,
    code: [
        path.join(appDirectory, 'js'),
        frameworkPath
    ]
};

module.exports = buildConfig(
    {
        'mapstore': path.join(appEntriesDirectory, 'app')
    },
    {
        'themes/default': path.join(paths.framework, 'themes', 'default', 'theme.less'),
        ...(mapstoreConfig.themes || []).reduce((acc, name) => ({
            ...acc,
            ['themes/' + name]: path.join(paths.base, 'themes', name, 'theme.less')
        }), {})
    },
    paths,
    extractThemesPlugin,
    false,
    publicPath,
    `.${themePrefix}`,
    [],
    {
        '@mapstore/framework': paths.framework,
        '@js': path.resolve(appDirectory, 'js')
    },
    undefined,
    [
        new HtmlWebpackPlugin({
            inject: false,
            template: path.resolve(__dirname, 'index.ejs'),
            templateParameters: {
                title: mapstoreConfig.title || 'MapStore HomePage'
            }
        }),
        new DefinePlugin({
            '__MAPSTORE_PROJECT_CONFIG__': JSON.stringify({
                themePath: publicPath + 'themes',
                themePrefix: themePrefix
            })
        })
    ]
);
