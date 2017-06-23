/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {DOWNLOAD_OPTIONS_CHANGE, DOWNLOAD_FEATURES, DOWNLOAD_FINISHED} = require('../actions/wfsdownload');

/**
 * reducer for wfsdownload
 * @memberof reducers
 * @param  {Object} [state={downloadOptions: {}}]          The initial state
 * @param  {Object} action                   the action
 * @return {Object}                          the new state
 *
 * @prop {object}  downloadOptions the options for WFS download
 * @prop {string}  downloadOptions.selectedFormat the format selectedFormat
 * @prop {boolean} downloadOptions.singlePage export only the current page, not the whole data
 */
function wfsdownload( state = {downloadOptions: {singlePage: true}}, action) {
    switch (action.type) {
        case DOWNLOAD_FEATURES:
            return {
                ...state,
                loading: true
            };
        case DOWNLOAD_OPTIONS_CHANGE:
            return {
                ...state,
                downloadOptions: {
                    ...state.downloadOptions,
                    [action.key]: action.value
                }
            };
        case DOWNLOAD_FINISHED: {
            return {
                ...state,
                loading: false
            };
        }
        default:
            return state;

    }
    return state;
}

module.exports = wfsdownload;
