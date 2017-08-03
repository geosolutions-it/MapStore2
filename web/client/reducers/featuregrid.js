/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const assign = require("object-assign");
const {head} = require("lodash");
const {
    SELECT_FEATURES,
    DESELECT_FEATURES,
    TOGGLE_FEATURES_SELECTION,
    CLEAR_SELECTION,
    SET_FEATURES,
    FEATURES_MODIFIED,
    CREATE_NEW_FEATURE,
    SAVING,
    SAVE_SUCCESS,
    SAVE_ERROR,
    CLEAR_CHANGES,
    CHANGE_PAGE,
    DOCK_SIZE_FEATURES,
    SET_LAYER, TOGGLE_TOOL,
    CUSTOMIZE_ATTRIBUTE,
    SET_SELECTION_OPTIONS,
    TOGGLE_MODE,
    MODES,
    GEOMETRY_CHANGED,
    DELETE_GEOMETRY_FEATURE,
    START_DRAWING_FEATURE,
    SET_PERMISSION,
    DISABLE_TOOLBAR
} = require('../actions/featuregrid');
const{
    FEATURE_TYPE_LOADED,
    FEATURE_CLOSE
} = require('../actions/wfsquery');
const{
    CHANGE_DRAWING_STATUS
} = require('../actions/draw');
const uuid = require('uuid');

const emptyResultsState = {
    canEdit: false,
    focusOnEdit: true,
    mode: MODES.VIEW,
    changes: [],
    pagination: {
        page: 0,
        size: 20
    },
    select: [],
    multiselect: false,
    drawing: false,
    newFeatures: [],
    features: [],
    dockSize: 0.35
};
const isSameFeature = (f1, f2) => f2 === f1 || (f1.id !== undefined && f1.id !== null && f1.id === f2.id);
const isPresent = (f1, features = []) => features.filter( f2 => isSameFeature(f1, f2)).length > 0;

const applyUpdate = (f, updates, updatesGeom) => {
    if (updatesGeom) {
        return {...f,
            properties: {
                ...f.properties,
                ...updates
            },
            geometry: updatesGeom.geometry
        };
    }
    return {...f,
    properties: {
        ...f.properties,
        ...updates
    }};

};
const applyNewChanges = (features, changedFeatures, updates, updatesGeom) =>
    features.map(f => isPresent(f, changedFeatures) ? applyUpdate(f, updates, updatesGeom) : f);

function featuregrid(state = emptyResultsState, action) {
    switch (action.type) {
    case CHANGE_PAGE: {
        return assign({}, state, {
            pagination: {
                page: action.page !== undefined ? action.page : state.pagination.page,
                size: action.size !== undefined ? action.size : state.pagination.size
            }
        });
    }
    case SELECT_FEATURES:
        if (state.multiselect && action.append) {
            return assign({}, state, {select: action.append ? [...state.select, ...action.features] : action.features});
        }
        if (action.features && state.select && state.select[0] && action.features[0] && state.select.length === 1 && isSameFeature(action.features[0], state.select[0])) {
            return state;
        }
        return assign({}, state, {select: (action.features || []).splice(0, 1)});
    case TOGGLE_FEATURES_SELECTION:
        let keepValues = state.select.filter( f => !isPresent(f, action.features));
        // let removeValues = state.select.filter( f => isPresent(f, action.features));
        let newValues = action.features.filter( f => !isPresent(f, state.select));
        let res = keepValues.concat( (newValues || []));
        return assign({}, state, {select: res});
    case DESELECT_FEATURES:
        return assign({}, state, {
            select: state.select.filter(f1 => !isPresent(f1, action.features))
            });
    case SET_SELECTION_OPTIONS: {
        return assign({}, state, {multiselect: action.multiselect});
    }
    case CLEAR_SELECTION:
        return assign({}, state, {select: [], changes: []});
    case SET_FEATURES:
        return assign({}, state, {features: action.features});
    case DOCK_SIZE_FEATURES:
        return assign({}, state, {dockSize: action.dockSize});
    case SET_LAYER:
        return assign({}, state, {selectedLayer: action.id});
    case TOGGLE_TOOL:
        return assign({}, state, {
            tools: {
                ...state.tools,
                [action.tool]: action.value === undefined ? !(state.tools && state.tools[action.tool]) : action.value
            }

        });
    case CUSTOMIZE_ATTRIBUTE:
        return assign({}, state, {
            attributes: {
                ...state.attributes,
                [action.name]: {
                    ...(state.attributes && state.attributes[action.name] || {}),
                    [action.key]: action.value || (state.attributes && state.attributes[action.name] && !state.attributes[action.name][action.key])
                }
            }
        });
    case TOGGLE_MODE: {
        return assign({}, state, {
            mode: action.mode,
            multiselect: action.mode === MODES.EDIT,
            drawing: false
        });
    }
    case FEATURES_MODIFIED: {
        const newFeaturesChanges = action.features.filter(f => f._new) || [];
        return assign({}, state, {
            newFeatures: newFeaturesChanges.length > 0 ? applyNewChanges(state.newFeatures, newFeaturesChanges, action.updated, null) : state.newFeatures,
            changes: [...(state && state.changes || []), ...(action.features.filter(f => !f._new).map(f => ({
                id: f.id,
                updated: action.updated
            })))]
        });
    }
    case SAVING: {
        return assign({}, state, {
            saving: true,
            loading: true
        });
    }
    case SAVE_SUCCESS: {
        return assign({}, state, {
            deleteConfirm: false,
            saved: true,
            saving: false,
            drawing: false,
            loading: false
        });
    }
    case CLEAR_CHANGES: {
        return assign({}, state, {
            saved: false,
            deleteConfirm: false,
            drawing: false,
            newFeatures: [],
            changes: [],
            select: []
        });
    }
    case CREATE_NEW_FEATURE: {
        let id = uuid.v1();
        return assign({}, state, {
            newFeatures: action.features.map(f => ({...f, _new: true, id: id, type: "Feature",
                geometry: null
            })),
            select: action.features.map(f => ({...f, _new: true, id: id, type: "Feature",
                geometry: null
            }))
        });
    }
    case SAVE_ERROR: {
        return assign({}, state, {
            deleteConfirm: false,
            saving: false,
            loading: false,
            drawing: false
        });
    }
    case GEOMETRY_CHANGED: {
        const newFeaturesChanges = action.features.filter(f => f._new) || [];
        return assign({}, state, {
            newFeatures: newFeaturesChanges.length > 0 ? applyNewChanges(state.newFeatures, newFeaturesChanges, null, {geometry: {...head(newFeaturesChanges).geometry} }) : state.newFeatures,
            changes: [...(state && state.changes || []), ...(action.features.filter(f => !f._new).map(f => ({
                id: f.id,
                updated: {geometry: head(action.features).geometry}
            })))],
            drawing: false
        });
    }
    case DELETE_GEOMETRY_FEATURE: {
        const newFeaturesChanges = action.features.filter(f => f._new) || [];
        return assign({}, state, {
            newFeatures: newFeaturesChanges.length > 0 ? applyNewChanges(state.newFeatures, newFeaturesChanges, null, {geometry: null}) : state.newFeatures,
            changes: [...(state && state.changes || []), ...(action.features.filter(f => !f._new).map(f => ({
                id: f.id,
                updated: {geometry: null}
            })))]
        });
    }
    case FEATURE_TYPE_LOADED: {
        return assign({}, state, {
            localType: action.featureType.original.featureTypes[0].properties[1].localType
        });
    }
    case START_DRAWING_FEATURE: {
        return assign({}, state, {
            drawing: !state.drawing
        });
    }
    case FEATURE_CLOSE: {
        return assign({}, state, {
            pagination: {
                page: 0,
                size: state.pagination.size
            },
            mode: MODES.VIEW,
            tools: {},
            saved: false,
            deleteConfirm: false,
            drawing: false,
            newFeatures: [],
            changes: [],
            select: []
        });
    }
    case DISABLE_TOOLBAR: {
        return assign({}, state, {
            disableToolbar: action.disabled
        });
    }
    case SET_PERMISSION: {
        return assign({}, state, {
            canEdit: action.permission.canEdit
        });
    }
    case CHANGE_DRAWING_STATUS: {
        if (action.status === "clean") {
            return assign({}, state, {
                drawing: false
            });
        }
        return state;
    }
    default:
        return state;
    }
}

module.exports = featuregrid;
