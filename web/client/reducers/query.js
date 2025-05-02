/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    FEATURE_TYPE_SELECTED,
    FEATURE_TYPE_LOADED,
    FEATURE_TYPE_ERROR,
    FEATURE_LOADING,
    FEATURE_LOADED,
    FEATURE_ERROR,
    QUERY_CREATE,
    QUERY_RESULT,
    QUERY_ERROR,
    RESET_QUERY,
    UPDATE_QUERY,
    TOGGLE_SYNC_WMS,
    TOGGLE_LAYER_FILTER
} from '../actions/wfsquery';
import { SET_SYNC_TOOL } from '../actions/featuregrid';
import { QUERY_FORM_RESET } from '../actions/queryform';
import { RESET_CONTROLS } from '../actions/controls';

const extractData = (feature) => {
    return ['STATE_NAME', 'STATE_ABBR', 'SUB_REGION', 'STATE_FIPS' ].map((attribute) => ({
        attribute,
        values: feature.features.reduce((previous, current) => {
            if (previous.indexOf(current.properties[attribute]) === -1) {
                return [...previous, current.properties[attribute]].sort();
            }
            return previous;
        }, [])
    })).reduce((previous, current) => {
        return Object.assign(previous, {
            [current.attribute]: current.values.map((value) => ({
                id: value,
                name: value
            }))
        });
    }, {});
};

const initialState = {
    featureTypes: {},
    data: {},
    result: null,
    resultError: null,
    syncWmsFilter: false,
    isLayerFilter: false
};

function query(state = initialState, action) {
    switch (action.type) {
    case FEATURE_TYPE_SELECTED: {
        return Object.assign({}, state, {
            typeName: action.typeName,
            url: action.url
        });
    }
    case FEATURE_TYPE_LOADED: {
        return Object.assign({}, state, {
            featureTypes: Object.assign({}, state.featureTypes, {[action.typeName]: action.featureType})
        });
    }
    case FEATURE_TYPE_ERROR: {
        return Object.assign({}, state, {
            featureTypes: Object.assign({}, state.featureTypes, {[action.typeName]: {error: action.error}})
        });
    }
    case FEATURE_LOADING: {
        return Object.assign({}, state, {
            featureLoading: action.isLoading
        });
    }
    case FEATURE_LOADED: {
        return Object.assign({}, state, {
            featureLoading: false,
            data: Object.assign({}, state.data, {[action.typeName]: extractData(action.feature)})
        });
    }
    case FEATURE_ERROR: {
        return Object.assign({}, state, {
            featureLoading: false,
            featureTypes: Object.assign({}, state.data, {[action.typeName]: {error: action.error}})
        });
    }
    case QUERY_CREATE: {
        return Object.assign({}, state, {
            isNew: true,
            searchUrl: action.searchUrl,
            filterObj: action.filterObj
        });
    }
    case UPDATE_QUERY: {
        return Object.assign({}, state, {
            filterObj: Object.assign({}, state.filterObj, action.updates)
        });
    }
    case QUERY_RESULT: {
        return Object.assign({}, state, {
            isNew: false,
            result: action.result,
            searchUrl: action.searchUrl,
            filterObj: action.filterObj,
            resultError: null
        });
    }
    case QUERY_ERROR: {
        return Object.assign({}, state, {
            isNew: false,
            result: null,
            resultError: action.error
        });
    }
    case RESET_CONTROLS:
    case QUERY_FORM_RESET:
        if (action.skip && action.skip.indexOf("query") >= 0) {
            return state;
        }
        return Object.assign({}, state, {
            isNew: false,
            result: null,
            filterObj: null,
            searchUrl: null,
            filters: null
        });
    case RESET_QUERY: {
        return Object.assign({}, state, {
            result: null,
            resultError: null
        });
    }
    case TOGGLE_SYNC_WMS:
        return Object.assign({}, state, {syncWmsFilter: !state.syncWmsFilter});
    case SET_SYNC_TOOL:
        return Object.assign({}, state, {syncWmsFilter: action.syncWmsFilter});
    case TOGGLE_LAYER_FILTER:
        return Object.assign({}, state, {isLayerFilter: !state.isLayerFilter});
    default:
        return state;
    }
}

export default query;
