/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs');
const path = require('path');

function checkFolder(dirPath, check) {
    const entries = fs.readdirSync(dirPath);
    const indexPath = path.join(dirPath, 'index.jsdoc');
    return [
        ...(fs.existsSync(indexPath) ? [indexPath.split('\\').join('/')] : []),
        ...entries.map(entry => {
            if (entry === '__tests__') {
                return null;
            }
            const entryPath = path.join(dirPath, entry);
            const stats = fs.lstatSync(entryPath);
            if (stats.isDirectory()) {
                return checkFolder(entryPath, check);
            }
            const content = fs.readFileSync(entryPath, 'utf8');
            if (check(content)) {
                return entryPath.split('\\').join('/');
            }
            return null;
        }).filter(val => val).flat()
    ];
}

const defaultSections = {
    framework: {
        path: 'web/client',
        check: content => content.includes('@memberof')
            && !content.includes('@memberof plugins')
            && !content.includes('@memberof MapStore2')
    },
    jsapi: {
        path: 'web/client/jsapi',
        check: content => content.includes('@memberof MapStore2')
    },
    plugins: {
        path: 'web/client/plugins',
        check: content => content.includes('@memberof plugins')
    }
};

const configPath = 'build/docma-config.json';
const getConfig = () => JSON.parse(fs.readFileSync('build/docma-config.json', 'utf-8'));

module.exports = {
    getConfig,
    updateConfig: (updateFunc) => {
        const config = getConfig();
        fs.writeFileSync(configPath, JSON.stringify(updateFunc(config), null, 4));
    },
    defaultSections,
    parseSections: (sections) => {
        return Object.fromEntries(Object.keys(sections).map((key) => {
            const options =  sections[key];
            return [key, checkFolder(path.join(options.path), options.check).sort((a, b) => {
                return a < b
                    ? -1
                    : a > b
                        ? 1
                        : 0;
            })];
        }));
    }
};
