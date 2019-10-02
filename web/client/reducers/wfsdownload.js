/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {DOWNLOAD_OPTIONS_CHANGE, DOWNLOAD_FEATURES, DOWNLOAD_FINISHED, FORMAT_OPTIONS_FETCH, FORMAT_OPTIONS_UPDATE} = require('../actions/wfsdownload');

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
    case FORMAT_OPTIONS_FETCH:
        return {
            ...state,
            layer: action.layer,
            wfsFormats: [],
            formatsLoading: true
        };
    case DOWNLOAD_FINISHED: {
        return {
            ...state,
            loading: false
        };
    }
    case FORMAT_OPTIONS_UPDATE: {
        return {
            ...state,
            wfsFormats: action.wfsFormats,
            formatsLoading: false
        };
    }
    default:
        return state;
    }
}

module.exports = wfsdownload;
