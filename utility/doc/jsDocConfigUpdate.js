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

const sections = {
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

const src = Object.fromEntries(Object.keys(sections).map((key) => {
    const options =  sections[key];
    return [key, checkFolder(path.join(options.path), options.check)];
}));

const configPath = 'build/docma-config.json';
const config = JSON.parse(fs.readFileSync('build/docma-config.json', 'utf-8'));

fs.writeFileSync(configPath, JSON.stringify({
    ...config,
    src: [
        {
            ...config.src[0],
            jsapi: src.jsapi,
            plugins: src.plugins
        }
    ]
}, null, 4));
