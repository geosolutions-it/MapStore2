/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { head, get, uniqBy, isArray } from 'lodash';

import {
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
    SET_LAYER,
    TOGGLE_TOOL,
    CUSTOMIZE_ATTRIBUTE,
    SET_SELECTION_OPTIONS,
    TOGGLE_MODE,
    MODES,
    GEOMETRY_CHANGED,
    TOGGLE_SHOW_AGAIN_FLAG,
    DELETE_GEOMETRY_FEATURE,
    START_DRAWING_FEATURE,
    SET_PERMISSION,
    DISABLE_TOOLBAR,
    OPEN_FEATURE_GRID,
    CLOSE_FEATURE_GRID,
    UPDATE_FILTER,
    INIT_PLUGIN,
    SIZE_CHANGE,
    STORE_ADVANCED_SEARCH_FILTER,
    GRID_QUERY_RESULT,
    LOAD_MORE_FEATURES,
    SET_UP,
    SET_TIME_SYNC,
    UPDATE_EDITORS_OPTIONS,
    SET_PAGINATION,
    SET_VIEWPORT_FILTER
} from '../actions/featuregrid';
import { MAP_CONFIG_LOADED } from '../actions/config';

import { FEATURE_TYPE_LOADED, QUERY_CREATE, UPDATE_QUERY } from '../actions/wfsquery';
import { CHANGE_DRAWING_STATUS } from '../actions/draw';
import uuid from 'uuid';

const emptyResultsState = {
    advancedFilters: {},
    filters: {},
    editingAllowedRoles: ["ADMIN"],
    editingAllowedGroups: [],
    enableColumnFilters: true,
    showFilteredObject: false,
    timeSync: false,
    showTimeSync: false,
    open: false,
    canEdit: false,
    focusOnEdit: false,
    showAgain: false,
    mode: MODES.VIEW,
    changes: [],
    pagination: {
        page: 0,
        size: 20
    },
    select: [],
    drawing: false,
    newFeatures: [],
    features: [],
    dockSize: 0.35,
    customEditorsOptions: {
        "rules": []
    },
    viewportFilter: null
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
/**
 * Manages the state of the featuregrid
 * The properties represent the shape of the state
 * @prop {string[]} editingAllowedRoles array of user roles allowed to enter in edit mode
 * @prop {string[]} editingAllowedGroups array of user roles allowed to enter in edit mode, when logged-in user role is not ADMIN
 * @prop {boolean} canEdit flag used to enable editing on the feature grid
 * @prop {object} filters filters for quick search. `{attribute: "name", value: "filter_value", opeartor: "=", rawValue: "the fitler raw value"}`
 * @prop {boolean} enableColumnFilters enables column filter. [configurable]
 * @prop {boolean} open feature grid open or close
 * @prop {string} mode `VIEW` or `EDIT`
 * @prop {array} changes list of current changes in editing
 * @prop {object} pagination object containing current page and page size of the feature grid.
 * @prop {array} select A list of the selected features ids
 * @prop {boolean} multiselect enables multiselect (edit mode by default allows multiselect)
 * @prop {boolean} drawing flag set during drawing
 * @prop {array} newFeatures array of new features created in editing
 * @prop {array} features list of the features currently loaded in the feature grid
 * @prop {boolean} timeSync false by default. If true, enables the time sync on the timeline
 * @prop {boolean} showTimeSync false by default. If true, shows the time sync button. Its disabled by default because WFS do not support officially time.
 * @example
 *  {
 *     editingAllowedRoles: ["ADMIN"],
 *     filters: {},
 *     enableColumnFilters: true,
 *     open: false,
 *     canEdit: false,
 *     focusOnEdit: false,
 *     mode: MODES.VIEW,
 *     changes: [],
 *     pagination: {
 *         page: 0,
 *         size: 20
 *     },
 *     select: [],
 *     multiselect: false,
 *     drawing: false,
 *     newFeatures: [],
 *     features: [],
 *     dockSize: 0.35
 * }
 *
 * @memberof reducers
 */
function featuregrid(state = emptyResultsState, action) {
    switch (action.type) {
    case INIT_PLUGIN: {
        return Object.assign({}, state, {
            editingAllowedRoles: action.options.editingAllowedRoles || state.editingAllowedRoles || ["ADMIN"],
            editingAllowedGroups: action.options.editingAllowedGroups || state.editingAllowedGroups || [],
            virtualScroll: !!action.options.virtualScroll,
            maxStoredPages: action.options.maxStoredPages || 5
        });
    }
    case LOAD_MORE_FEATURES:
    case CHANGE_PAGE: {
        return Object.assign({}, state, {
            pagination: {
                page: action.page !== undefined ? action.page : state.pagination.page,
                size: action.size !== undefined ? action.size : state.pagination.size
            }
        });
    }
    case SET_PAGINATION: {
        return {
            ...state,
            pagination: {
                ...(state.pagination ?? {}),
                size: action.size
            }
        };
    }
    case SELECT_FEATURES: {
        const features = action.features.filter(f => f.id !== 'empty_row');
        if (state.multiselect && action.append) {
            return Object.assign({}, state, {select: action.append ? uniqBy([...state.select, ...features], "id") : features});
        }
        if (features && state.select && state.select[0] && features[0] && state.select.length === 1 && isSameFeature(features[0], state.select[0])) {
            return state;
        }
        return Object.assign({}, state, {select: (features || [])});
    }
    case TOGGLE_FEATURES_SELECTION:
        let keepValues = state.select.filter( f => !isPresent(f, action.features));
        // let removeValues = state.select.filter( f => isPresent(f, action.features));
        let newValues = action.features.filter( f => !isPresent(f, state.select));
        let res = keepValues.concat( (newValues || []));
        return Object.assign({}, state, {select: res});
    case DESELECT_FEATURES:
        return Object.assign({}, state, {
            select: state.select.filter(f1 => !isPresent(f1, action.features))
        });
    case SET_SELECTION_OPTIONS: {
        return Object.assign({}, state, {multiselect: action.multiselect ?? state.multiselect, showCheckbox: action.showCheckbox ?? state.showCheckbox});
    }
    case UPDATE_EDITORS_OPTIONS:
        return Object.assign({}, state, { customEditorsOptions: action.payload });
    case SET_UP: {
        return Object.assign({}, state, action.options || {});
    }
    case CLEAR_SELECTION:
        return Object.assign({}, state, {select: [], changes: []});
    case SET_FEATURES:
        return Object.assign({}, state, {features: action.features});
    case DOCK_SIZE_FEATURES:
        return Object.assign({}, state, {dockSize: action.dockSize});
    case SET_LAYER:
        return Object.assign({}, state, {selectedLayer: action.id});
    case TOGGLE_TOOL:
        return Object.assign({}, state, {
            tools: {
                ...state.tools,
                [action.tool]: action.value === undefined ? !(state.tools && state.tools[action.tool]) : action.value
            }

        });
    case CUSTOMIZE_ATTRIBUTE:
        return Object.assign({}, state, {
            attributes: {
                ...state.attributes,
                [action.name]: {
                    ...(state.attributes && state.attributes[action.name] || {}),
                    [action.key]: action.value || (state.attributes && state.attributes[action.name] && !state.attributes[action.name][action.key])
                }
            }
        });
    case TOGGLE_MODE: {
        return Object.assign({}, state, {
            tools: action.mode === MODES.EDIT ? {} : state.tools,
            mode: action.mode,
            multiselect: action.mode === MODES.EDIT,
            drawing: false
        });
    }
    case FEATURES_MODIFIED: {
        const newFeaturesChanges = action.features.filter(f => f._new) || [];
        return Object.assign({}, state, {
            newFeatures: newFeaturesChanges.length > 0 ? applyNewChanges(state.newFeatures, newFeaturesChanges, action.updated, null) : state.newFeatures,
            changes: [...(state && state.changes || []), ...(action.features.filter(f => !f._new).map(f => ({
                id: f.id,
                updated: action.updated
            })))]
        });
    }
    case SAVING: {
        return Object.assign({}, state, {
            saving: true,
            loading: true
        });
    }
    case SAVE_SUCCESS: {
        return Object.assign({}, state, {
            deleteConfirm: false,
            saved: true,
            saving: false,
            drawing: false,
            loading: false
        });
    }
    case CLEAR_CHANGES: {
        return Object.assign({}, state, {
            saved: false,
            deleteConfirm: false,
            drawing: false,
            newFeatures: [],
            changes: []
        });
    }
    case CREATE_NEW_FEATURE: {
        let id = uuid.v1();
        return Object.assign({}, state, {
            newFeatures: action.features.map(f => ({...f, _new: true, id: f.id ? f.id : id, type: "Feature",
                geometry: f.geometry ? f.geometry : null
            })),
            select: action.features.map(f => ({...f, _new: true, id: f.id ? f.id : id, type: "Feature",
                geometry: f.geometry ? f.geometry : null
            }))
        });
    }
    case SAVE_ERROR: {
        return Object.assign({}, state, {
            deleteConfirm: false,
            saving: false,
            loading: false,
            drawing: false
        });
    }
    case GEOMETRY_CHANGED: {
        const newFeaturesChanges = action.features.filter(f => f._new) || [];
        return Object.assign({}, state, {
            newFeatures: newFeaturesChanges.length > 0 ? applyNewChanges(state.newFeatures, newFeaturesChanges, null, {geometry: {...head(newFeaturesChanges).geometry} }) : state.newFeatures,
            changes: action.features.filter(f => !f._new).map((f, index) => ({
                id: f.id,
                updated: {geometry: action.features[index].geometry}
            })),
            drawing: false
        });
    }
    case DELETE_GEOMETRY_FEATURE: {
        const newFeaturesChanges = action.features.filter(f => f._new) || [];
        return Object.assign({}, state, {
            newFeatures: newFeaturesChanges.length > 0 ? applyNewChanges(state.newFeatures, newFeaturesChanges, null, {geometry: null}) : state.newFeatures,
            changes: [...(state && state.changes || []), ...(action.features.filter(f => !f._new).map(f => ({
                id: f.id,
                updated: {geometry: null}
            })))]
        });
    }
    case FEATURE_TYPE_LOADED: {
        return Object.assign({}, state, {
            localType: get(action, "featureType.original.featureTypes[0].properties[1].localType")
        });
    }
    case START_DRAWING_FEATURE: {
        return Object.assign({}, state, {
            drawing: !state.drawing
        });
    }
    case OPEN_FEATURE_GRID: {
        return Object.assign({}, state, {
            open: true,
            closer: null
        });
    }
    case CLOSE_FEATURE_GRID: {
        return Object.assign({}, state, {
            open: false,
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
            closer: action.closer
        });
    }
    case DISABLE_TOOLBAR: {
        return Object.assign({}, state, {
            disableToolbar: action.disabled
        });
    }
    case SET_PERMISSION: {
        return Object.assign({}, state, {
            canEdit: action.permission.canEdit
        });
    }
    case CHANGE_DRAWING_STATUS: {
        if (action.status === "clean") {
            return Object.assign({}, state, {
                drawing: false
            });
        }
        return state;
    }
    case UPDATE_FILTER : {
        const {attribute} = (action.update || {});
        if (attribute && action.append) {
            const value = state.filters[attribute].value;
            let oldVal = [];
            if (value?.attribute) {
                oldVal = [value];
            }

            if (isArray(value)) {
                oldVal = value;
            }

            const newValue = [...oldVal, action.update.value];
            return Object.assign({}, state, {
                filters: {
                    [attribute]: {
                        attribute: attribute,
                        enabled: true,
                        type: "geometry",
                        operator: "OR",
                        value: newValue
                    }
                }
            });
        }
        if (attribute) {
            return Object.assign({}, state, {
                filters: {
                    ...state.filters,
                    [attribute]: action.update
                }
            });
        }
        return state;
    }
    case QUERY_CREATE : {
        return Object.assign({}, state, {
            filters: {
            }
        });
    }
    case UPDATE_QUERY: {
        return {
            ...state,
            useLayerFilter: action.useLayerFilter ?? state.useLayerFilter // if not present, keep current
        };
    }
    case SIZE_CHANGE : {
        const maxDockSize = action.dockProps && action.dockProps.maxDockSize;
        const minDockSize = action.dockProps && action.dockProps.minDockSize;
        const size = maxDockSize && minDockSize && minDockSize <= action.size && maxDockSize >= action.size && action.size
        || maxDockSize && maxDockSize < action.size && maxDockSize
        || minDockSize && minDockSize > action.size && minDockSize
        || action.size;
        return Object.assign({}, state, {
            dockSize: size
        });
    }
    case STORE_ADVANCED_SEARCH_FILTER : {
        return Object.assign({}, state, {advancedFilters: Object.assign({}, state.advancedFilters, {[state.selectedLayer]: action.filterObj})});
    }
    case GRID_QUERY_RESULT: {
        return Object.assign({}, state, {features: action.features || [], pages: action.pages || []});
    }
    case TOGGLE_SHOW_AGAIN_FLAG: {
        return Object.assign({}, state, {showAgain: !state.showAgain});
    }
    case SET_TIME_SYNC: {
        return Object.assign({}, state, {timeSync: action.value});
    }
    case SET_VIEWPORT_FILTER: {
        return Object.assign({}, state, {viewportFilter: action.value});
    }
    case MAP_CONFIG_LOADED: {
        return {...state, ...get(action, 'config.featureGrid', {})};
    }
    default:
        return state;
    }
}

export default featuregrid;
