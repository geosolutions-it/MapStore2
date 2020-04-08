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
    MISSING_INDEX: 'MISSING_INDEX',
    MALFORMED_INDEX: 'MALFORMED_INDEX',
    MISSING_PLUGIN: 'MISSING_PLUGIN',
    MISSING_BUNDLE: 'MISSING_BUNDLE',
    TOO_MANY_PLUGINS: 'TOO_MANY_BUNDLES'
};

export const checkZipBundle = (file) => {
    return FileUtils.readZip(file).then((buffer) => {
        var zip = new JSZip();
        return zip.loadAsync(buffer);
    }).then((zip) => {
        if (!zip.files["index.json"]) {
            throw ERROR.MISSING_INDEX;
        }
        const bundles = zip.file(/\.js$/);
        if (bundles.length === 1) {
            return zip.files["index.json"].async("text").then((json) => {
                try {
                    const index = JSON.parse(json);
                    if (index.plugins && index.plugins.length && index.plugins[0].name) {
                        return { name: index.plugins[0].name, file };
                    }
                } catch (e) {
                    throw ERROR.MALFORMED_INDEX;
                }
                throw ERROR.MISSING_PLUGIN;
            });
        }
        if (bundles.length === 0) {
            throw ERROR.MISSING_BUNDLE;
        }
        throw ERROR.TOO_MANY_BUNDLES;
    });
};
