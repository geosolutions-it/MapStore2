/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('../libs/ajax');

const CHANGE_VERSION = 'CHANGE_VERSION';
const LOAD_VERSION_ERROR = 'LOAD_VERSION_ERROR';

function changeVersion(version) {
    return {
        type: CHANGE_VERSION,
        version
    };
}

function loadVersionError(e) {
    return {
        type: LOAD_VERSION_ERROR,
        error: e
    };
}

function loadVersion(config = 'version.txt') {
    return (dispatch) => {
        return axios.get(config).then((response) => {
            dispatch(changeVersion(response.data));
        }).catch((e) => {
            dispatch(loadVersionError(e));
        });
    };
}

module.exports = {CHANGE_VERSION, LOAD_VERSION_ERROR,
     loadVersion, loadVersionError, changeVersion};
