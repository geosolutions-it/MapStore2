/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { findIndex } from 'lodash';

import {
    CHECKING_WPS_AVAILABILITY,
    DOWNLOAD_OPTIONS_CHANGE,
    CLEAR_DOWNLOAD_OPTIONS,
    DOWNLOAD_FEATURES,
    DOWNLOAD_FINISHED,
    FORMAT_OPTIONS_FETCH,
    FORMAT_OPTIONS_UPDATE,
    SET_SERVICE,
    SET_EXPORT_DATA_RESULTS,
    ADD_EXPORT_DATA_RESULT,
    UPDATE_EXPORT_DATA_RESULT,
    REMOVE_EXPORT_DATA_RESULT,
    REMOVE_EXPORT_DATA_RESULTS,
    CHECKING_EXPORT_DATA_ENTRIES,
    SET_WPS_AVAILABILITY
} from '../actions/layerdownload';
import { DOWNLOAD } from '../actions/layers';

/**
 * reducer for layerdownload
 * @memberof reducers
 * @param  {Object} [state={downloadOptions: {}}]          The initial state
 * @param  {Object} action                   the action
 * @return {Object}                          the new state
 *
 * @prop {object}  downloadOptions the options for WFS download
 * @prop {string}  downloadOptions.selectedFormat the format selectedFormat
 * @prop {boolean} downloadOptions.singlePage export only the current page, not the whole data
 */
function layerdownload( state = {downloadOptions: {singlePage: true}}, action) {
    switch (action.type) {
    case DOWNLOAD:
        return {
            ...state,
            downloadLayer: action.layer
        };
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
    case CLEAR_DOWNLOAD_OPTIONS:
        return {
            ...state,
            downloadOptions: {
                singlePage: true
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
    case SET_SERVICE: {
        return {
            ...state,
            service: action.service
        };
    }
    case SET_WPS_AVAILABILITY: {
        return {
            ...state,
            wpsAvailable: action.value
        };
    }
    case CHECKING_WPS_AVAILABILITY: {
        return {
            ...state,
            checkingWPSAvailability: action.checking
        };
    }
    case SET_EXPORT_DATA_RESULTS: {
        return {
            ...state,
            results: action.results
        };
    }
    case ADD_EXPORT_DATA_RESULT: {
        return {
            ...state,
            results: [...(state.results || []), action.result]
        };
    }
    case UPDATE_EXPORT_DATA_RESULT: {
        const resultIndex = findIndex(state.results || [], {id: action.id});

        return {
            ...state,
            results: resultIndex > -1 ? [
                ...state.results.slice(0, resultIndex),
                {
                    ...state.results[resultIndex],
                    ...(action.newProps || {})
                },
                ...state.results.slice(resultIndex + 1)
            ] : state.results
        };
    }
    case REMOVE_EXPORT_DATA_RESULT: {
        return {
            ...state,
            results: (state.results || []).filter(result => result.id !== action.id)
        };
    }
    case REMOVE_EXPORT_DATA_RESULTS: {
        return {
            ...state,
            results: (state.results || []).filter(result => findIndex(action.ids, id => id === result.id) === -1)
        };
    }
    case CHECKING_EXPORT_DATA_ENTRIES: {
        return {
            ...state,
            checkingExportDataEntries: action.checking
        };
    }
    default:
        return state;
    }
}

export default layerdownload;
