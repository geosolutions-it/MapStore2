/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import JSZip from 'jszip';
import {readZip} from './FileUtils';

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
            const { name, title, version } = index.plugins[0];
            if (plugins.indexOf(name) !== -1) {
                return {error: ERROR.ALREADY_INSTALLED};
            }
            return { name, title, version };
        }
        return {error: ERROR.MISSING_PLUGIN};
    } catch (e) {
        return {error: ERROR.MALFORMED_INDEX};
    }
};

export const checkZipBundle = (file, plugins = []) => {
    return readZip(file).then((buffer) => {
        var zip = new JSZip();
        return zip.loadAsync(buffer).catch(() => {
            throw ERROR.WRONG_FORMAT;
        });
    }).then((zip) => {
        if (!zip.files["index.json"]) {
            throw ERROR.MISSING_INDEX;
        }
        const bundles = zip.file(/index\.js$/);
        if (bundles.length === 0) {
            throw ERROR.MISSING_BUNDLE;
        }
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

    });
};

export const UPLOAD_ERROR_MESSAGE_IDS = {
    [ERROR.WRONG_FORMAT]: "contextCreator.configurePlugins.uploadWrongFileFormatError",
    [ERROR.MISSING_INDEX]: "contextCreator.configurePlugins.uploadMissingIndexError",
    [ERROR.MALFORMED_INDEX]: "contextCreator.configurePlugins.uploadParseError",
    [ERROR.MISSING_PLUGIN]: "contextCreator.configurePlugins.uploadMissingPluginError",
    [ERROR.MISSING_BUNDLE]: "contextCreator.configurePlugins.uploadMissingBundleError",
    [ERROR.TOO_MANY_BUNDLES]: "contextCreator.configurePlugins.uploadTooManyBundlesError",
    [ERROR.ALREADY_INSTALLED]: "contextCreator.configurePlugins.uploadAlreadyInstalledError"
};

/**
 * Checks the zip files of extensions before uploading them.
 * When a file is not valid, every file of the list gets its error.
 * @param {File[]} files zip files to check
 * @param {string[]} plugins names of the plugins that cannot be installed again
 * @param {function} getMessage returns the text of a message id
 * @returns {Promise} resolves with `[{ name, title, version, file }]`, or `[{ name, file, error }]`
 */
export const checkUploads = (files, plugins, getMessage) => Promise.all(files.map(file =>
    checkZipBundle(file, plugins).catch(e => {
        throw new Error(getMessage(UPLOAD_ERROR_MESSAGE_IDS[e]));
    })
)).catch(e => files.map(f => ({ name: f.name, file: f, error: e })));
