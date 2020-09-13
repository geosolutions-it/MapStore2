/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import JSZip from 'jszip';
import FileUtils from './FileUtils';

export const ERROR = {
    WRONG_FORMAT: 'WRONG_FORMAT',
    MISSING_INDEX: 'MISSING_INDEX',
    MALFORMED_INDEX: 'MALFORMED_INDEX',
    MISSING_PLUGIN: 'MISSING_PLUGIN',
    MISSING_BUNDLE: 'MISSING_BUNDLE',
    TOO_MANY_PLUGINS: 'TOO_MANY_BUNDLES',
    ALREADY_INSTALLED: 'ALREADY_INSTALLED'
};

const parseIndex = (json, plugins) => {
    try {
        const index = JSON.parse(json);
        if (index.plugins && index.plugins.length && index.plugins[0].name) {
            const name = index.plugins[0].name;
            if (plugins.indexOf(name) !== -1) {
                return {error: ERROR.ALREADY_INSTALLED};
            }
            return { name };
        }
        return {error: ERROR.MISSING_PLUGIN};
    } catch (e) {
        return {error: ERROR.MALFORMED_INDEX};
    }
};

export const checkZipBundle = (file, plugins = []) => {
    return FileUtils.readZip(file).then((buffer) => {
        var zip = new JSZip();
        return zip.loadAsync(buffer).catch(() => {
            throw ERROR.WRONG_FORMAT;
        });
    }).then((zip) => {
        if (!zip.files["index.json"]) {
            throw ERROR.MISSING_INDEX;
        }
        const bundles = zip.file(/\.js$/);
        if (bundles.length === 1) {
            return zip.files["index.json"].async("text").then((json) => {
                const index = parseIndex(json, plugins);
                if (index.error) {
                    throw index.error;
                }
                return {
                    ...index,
                    file
                };
            });
        }
        if (bundles.length === 0) {
            throw ERROR.MISSING_BUNDLE;
        }
        throw ERROR.TOO_MANY_BUNDLES;
    });
};
