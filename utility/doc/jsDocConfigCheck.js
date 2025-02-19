/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const utils = require('./jsDocUtils');

const src = utils.parseSections(utils.defaultSections);
const config = utils.getConfig();

const currentSrc = config.src[0];

const keys = ['jsapi', 'plugins'];

let failMessage = '';

keys.forEach(key  => {
    const missing = src[key].filter((file) => !currentSrc[key].includes(file));
    if (missing.length) {
        failMessage = `${failMessage}${missing.map(file => `  docma-config.json: missing entry in src[0].${key} ${file}`).join('\n')}\n`;
    }
    const wrong = currentSrc[key].filter((file) => !src[key].includes(file));
    if (wrong.length) {
        failMessage = `${failMessage}${wrong.map(file => `  docma-config.json: wrong entry in src[0].${key} ${file}`).join('\n')}\n`;
    }
});

if (failMessage) {
    throw Error(`jsdoc check failure caused by:\n\n${failMessage}\n\nuse following command to update docma-config.json file:\n\n  npm run jsdoc:update\n\n---------\n\n`);
}
