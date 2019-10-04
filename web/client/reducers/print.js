/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    SET_PRINT_PARAMETER,
    PRINT_CAPABILITIES_LOADED,
    PRINT_CAPABILITIES_ERROR,
    CONFIGURE_PRINT_MAP,
    CHANGE_PRINT_ZOOM_LEVEL,
    CHANGE_MAP_PRINT_PREVIEW,
    PRINT_SUBMITTING,
    PRINT_CREATED,
    PRINT_ERROR,
    PRINT_CANCEL
} = require('../actions/print');

const {TOGGLE_CONTROL} = require('../actions/controls');
const {isObject, get} = require('lodash');

const assign = require('object-assign');

const initialSpec = {
    antiAliasing: true,
    iconSize: 24,
    legendDpi: 96,
    fontFamily: "Verdana",
    fontSize: 8,
    bold: false,
    italic: false,
    resolution: 96,
    name: '',
    description: ''
};

const getSheetName = (name = '') => {
    return name.split('_')[0];
};

function print(state = {spec: initialSpec, capabilities: null, map: null, isLoading: false, pdfUrl: null}, action) {
    switch (action.type) {
    case TOGGLE_CONTROL: {
        if (action.control === 'print') {
            return assign({}, state, {pdfUrl: null, isLoading: false, error: null});
        }
        return state;
    }
    case PRINT_CAPABILITIES_LOADED: {
        const layouts = get(action, 'capabilities.layouts', [{name: 'A4'}]);
        const sheetName = layouts.filter(l => getSheetName(l.name) === state.spec.sheet).length ?
            state.spec.sheet : getSheetName(layouts[0].name);
        return assign({}, state, {
            capabilities: action.capabilities,
            spec: assign({}, state.spec || {}, {
                sheet: sheetName,
                resolution: action.capabilities
                        && action.capabilities.dpis
                        && action.capabilities.dpis.length
                        && action.capabilities.dpis[0].value
            })
        });
    }
    case SET_PRINT_PARAMETER: {
        return assign({}, state, {
            spec: assign({}, state.spec, {[action.name]: action.value})
        }
        );
    }
    case CONFIGURE_PRINT_MAP: {

        const layers = action.layers.map((layer) => {
            return layer.title ? assign({}, layer, {
                title: isObject(layer.title) && action.currentLocale && layer.title[action.currentLocale]
                || isObject(layer.title) && layer.title.default
                || layer.title
            }) : layer;
        });

        return assign({}, state, {
            map: {
                center: action.center,
                zoom: action.zoom,
                scaleZoom: action.scaleZoom,
                scale: action.scale,
                layers,
                projection: action.projection
            },
            error: null
        }
        );
    }
    case CHANGE_PRINT_ZOOM_LEVEL: {
        const diff = action.zoom - state.map.scaleZoom;
        return assign({}, state, {
            map: assign({}, state.map, {
                scaleZoom: action.zoom,
                zoom: state.map.zoom + diff,
                scale: action.scale
            })
        }
        );
    }
    case CHANGE_MAP_PRINT_PREVIEW: {
        return assign({}, state, {
            map: assign({}, state.map, {
                size: action.size
            })
        }
        );
    }
    case PRINT_SUBMITTING: {
        return assign({}, state, {isLoading: true, pdfUrl: null, error: null});
    }
    case PRINT_CREATED: {
        return assign({}, state, {isLoading: false, pdfUrl: action.url, error: null});
    }
    case PRINT_ERROR: {
        return assign({}, state, {isLoading: false, pdfUrl: null, error: action.error});
    }
    case PRINT_CAPABILITIES_ERROR: {
        return assign({}, state, {isLoading: false, pdfUrl: null, error: action.error});
    }
    case PRINT_CANCEL: {
        return assign({}, state, {isLoading: false, pdfUrl: null, error: null});
    }
    default:
        return state;
    }
}

module.exports = print;
