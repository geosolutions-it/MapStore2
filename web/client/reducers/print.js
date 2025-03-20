/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SET_PRINT_PARAMETER,
    ADD_PRINT_PARAMETER,
    PRINT_CAPABILITIES_LOADED,
    PRINT_CAPABILITIES_ERROR,
    CONFIGURE_PRINT_MAP,
    CHANGE_PRINT_ZOOM_LEVEL,
    CHANGE_MAP_PRINT_PREVIEW,
    PRINT_SUBMITTING,
    PRINT_CREATED,
    PRINT_ERROR,
    PRINT_CANCEL
} from '../actions/print';

import { TOGGLE_CONTROL } from '../actions/controls';
import { isObject, get } from 'lodash';
import assign from 'object-assign';

import set from "lodash/set";

const initialSpec = {
    antiAliasing: true,
    iconsWidth: 24,
    iconsHeight: 24,
    legendDpi: 96,
    fontFamily: "Verdana",
    fontSize: 8,
    bold: false,
    italic: false,
    resolution: 96,
    name: '',
    description: '',
    outputFormat: "pdf",
    rotation: 0
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
        return {...state, spec: set({...state.spec}, action.name, action.value)};
    }
    case ADD_PRINT_PARAMETER: {
        const exists = get(state.spec, action.name);
        if (!exists) {
            return {...state, spec: set({...state.spec}, action.name, action.value)};
        }
        return state;
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
                size: action.size ?? state.map?.size,
                projection: action.projection,
                useFixedScales: action.useFixedScales
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
                zoom: state.map.zoom + diff >= 0 ? state.map.zoom + diff : 0,
                scale: action.scale
            })
        }
        );
    }
    case CHANGE_MAP_PRINT_PREVIEW: {
        return assign({}, state, {
            map: assign({}, state.map, {
                size: action.size,
                zoom: action.zoom,
                scaleZoom: action.zoom,
                bbox: action.bbox,
                center: action.center
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

export default print;
