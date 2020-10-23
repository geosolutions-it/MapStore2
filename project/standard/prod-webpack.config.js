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
const CopyWebpackPlugin = require('copy-webpack-plugin');
const appDirectory = fs.realpathSync(process.cwd());

const mapstoreConfig = require(path.join(appDirectory, 'package.json')).mapstore || {};
const publicPath = '';
const output = 'dist/';
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
        'js/mapstore': path.join(appEntriesDirectory, 'app'),
        'js/embedded': path.join(appEntriesDirectory, 'embedded'),
        'js/ms2-api': path.join(appEntriesDirectory, 'api')
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
    true,
    publicPath,
    `.${themePrefix}`,
    [
        new DefinePlugin({
            '__MAPSTORE_PROJECT_CONFIG__': JSON.stringify({
                themePath: publicPath + 'themes',
                themePrefix: themePrefix
            })
        }),

        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'configs'), to: path.join(paths.dist, 'configs') }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'translations'), to: path.join(paths.dist, 'translations') }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'unsupportedBrowser.html'), to: paths.dist }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'config.json'), to: paths.dist }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'new.json'), to: paths.dist }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'localConfig.json'), to: paths.dist }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'pluginsConfig.json'), to: paths.dist }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'libs', 'cesium-navigation'), to: path.join(paths.dist, 'libs', 'cesium-navigation') }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(paths.framework, 'version.txt'), to: path.join(paths.dist, 'version.txt') }
        ]),
        new HtmlWebpackPlugin({
            inject: false,
            filename: 'index.html',
            template: path.resolve(__dirname, 'index.ejs'),
            templateParameters: {
                title: mapstoreConfig.title || 'MapStore HomePage'
            }
        }),
        new HtmlWebpackPlugin({
            inject: false,
            filename: 'embedded.html',
            template: path.resolve(__dirname, 'embedded.ejs'),
            templateParameters: {
                title: mapstoreConfig.embeddedTitle || 'MapStore HomePage'
            }
        }),
        new HtmlWebpackPlugin({
            inject: false,
            filename: 'api.html',
            template: path.resolve(__dirname, 'api.ejs'),
            templateParameters: {
                title: mapstoreConfig.apiTitle || 'Page with MapStore API'
            }
        })
    ],
    {
        '@mapstore/framework': paths.framework,
        '@js': path.resolve(appDirectory, 'js')
    },
    undefined
);
