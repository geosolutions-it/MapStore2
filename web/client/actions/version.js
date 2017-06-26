/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('../libs/ajax');

const CHANGE_VERSION = 'CHANGE_VERSION';
const LOAD_VERSION_ERROR = 'LOAD_VERSION_ERROR';

/**
 * updates the version identifier of the application
 * @memberof actions.version
 * @param {string} version new version to be set
 */
function changeVersion(version) {
    return {
        type: CHANGE_VERSION,
        version
    };
}

/**
 * error in loading version file
 * @memberof actions.version
 * @param {object} e error description
 */
function loadVersionError(e) {
    return {
        type: LOAD_VERSION_ERROR,
        error: e
    };
}
/**
 * loads a version identifier from the given url
 * @memberof actions.version
 * @param {string} config ['version.txt'] url of the (text) file to load the version identifier from
 */
function loadVersion(config = 'version.txt') {
    return (dispatch) => {
        return axios.get(config).then((response) => {
            dispatch(changeVersion(response.data));
        }).catch((e) => {
            dispatch(loadVersionError(e));
        });
    };
}

/**
 * Actions for version
 * @name actions.version
 */
module.exports = {CHANGE_VERSION, LOAD_VERSION_ERROR,
    loadVersion, loadVersionError, changeVersion};
