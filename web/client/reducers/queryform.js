/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    ADD_FILTER_FIELD,
    REMOVE_FILTER_FIELD,
    UPDATE_FILTER_FIELD,
    UPDATE_EXCEPTION_FIELD,
    ADD_GROUP_FIELD,
    UPDATE_LOGIC_COMBO,
    REMOVE_GROUP_FIELD,
    CHANGE_CASCADING_VALUE,
    EXPAND_ATTRIBUTE_PANEL,
    EXPAND_SPATIAL_PANEL,
    EXPAND_CROSS_LAYER,
    SET_CROSS_LAYER_PARAMETER,
    SELECT_SPATIAL_METHOD,
    SELECT_SPATIAL_OPERATION,
    CHANGE_SPATIAL_ATTRIBUTE,
    CHANGE_SPATIAL_FILTER_VALUE,
    REMOVE_SPATIAL_SELECT,
    SHOW_SPATIAL_DETAILS,
    QUERY_FORM_RESET,
    SHOW_GENERATED_FILTER,
    CHANGE_DWITHIN_VALUE,
    ZONE_FILTER,
    ZONE_SEARCH,
    UPDATE_GEOMETRY,
    // OPEN_MENU,
    ZONE_CHANGE,
    ZONES_RESET,
    ZONE_SEARCH_ERROR,
    SIMPLE_FILTER_FIELD_UPDATE,
    ADD_SIMPLE_FILTER_FIELD,
    REMOVE_SIMPLE_FILTER_FIELD,
    REMOVE_ALL_SIMPLE_FILTER_FIELDS,
    UPDATE_FILTER_FIELD_OPTIONS,
    LOADING_FILTER_FIELD_OPTIONS,
    ADD_CROSS_LAYER_FILTER_FIELD,
    UPDATE_CROSS_LAYER_FILTER_FIELD,
    REMOVE_CROSS_LAYER_FILTER_FIELD,
    RESET_CROSS_LAYER_FILTER,
    SET_AUTOCOMPLETE_MODE,
    TOGGLE_AUTOCOMPLETE_MENU,
    LOAD_FILTER
} = require('../actions/queryform');

const {
    END_DRAWING,
    CHANGE_DRAWING_STATUS
} = require('../actions/draw');

const assign = require('object-assign');

const union = require('turf-union');
const bbox = require('turf-bbox');
const {get} = require('lodash');
const {set, arrayUpsert, arrayDelete} = require('../utils/ImmutableUtils');

const initialState = {
    searchUrl: null,
    featureTypeConfigUrl: null,
    showGeneratedFilter: false,
    attributePanelExpanded: true,
    spatialPanelExpanded: true,
    crossLayerExpanded: true,
    showDetailsPanel: false,
    groupLevels: 5,
    useMapProjection: false,
    toolbarEnabled: true,
    groupFields: [
        {
            id: 1,
            logic: "OR",
            index: 0
        }
    ],
    maxFeaturesWPS: 5,
    filterFields: [],
    spatialField: {
        method: null,
        attribute: "the_geom",
        operation: "INTERSECTS",
        geometry: null
    },
    simpleFilterFields: []
};

const updateFilterField = (field = {}, action = {}) => {
    let f = assign({}, field, {[action.fieldName]: action.fieldValue, type: action.fieldType}, {fieldOptions: assign({}, {...field.fieldOptions}, {currentPage: action.fieldOptions.currentPage === undefined ? 1 : action.fieldOptions.currentPage})});
    if (action.fieldName === "attribute") {
        f.value = action.fieldType === "string" ? '' : null;
        f.operator = "=";
    }
    if (action.fieldName === "operator") {
        f.value = null;
    }
    return f;
};

function queryform(state = initialState, action) {
    switch (action.type) {
    case ADD_FILTER_FIELD: {
        //
        // Calculate the key number, this should be different for each new element
        //
        const newFilterField = {
            rowId: new Date().getTime(),
            groupId: action.groupId,
            attribute: null,
            operator: "=",
            value: null,
            type: null,
            fieldOptions: {
                valuesCount: 0,
                currentPage: 1
            },
            exception: null
        };

        return assign({}, state, {filterFields: (state.filterFields ? [...state.filterFields, newFilterField] : [newFilterField])});
    }
    case REMOVE_FILTER_FIELD: {
        return assign({}, state, {filterFields: state.filterFields.filter((field) => field.rowId !== action.rowId)});
    }
    case UPDATE_FILTER_FIELD: {
        return assign({}, state, {filterFields: state.filterFields.map((field) => {
            if (field.rowId === action.rowId) {
                return updateFilterField(field, action);
            }
            return field;
        })});
    }
    case UPDATE_FILTER_FIELD_OPTIONS: {
        return assign({}, state, {filterFields: state.filterFields.map((field) => {
            if (field.rowId === action.filterField.rowId) {
                return assign({}, field, {options: assign({}, {...field.options}, {[field.attribute]: action.options} )}, {fieldOptions: assign({}, {...field.fieldOptions}, {valuesCount: action.valuesCount})});
            }
            return field;
        })});
    }
    case TOGGLE_AUTOCOMPLETE_MENU: {
        return assign({}, state, {filterFields: state.filterFields.map((field) => {
            if (field.rowId === action.rowId) {
                return assign({}, field, {openAutocompleteMenu: action.status} );
            }
            return field;
        })});
    }
    case SET_AUTOCOMPLETE_MODE: {
        return assign({}, state, {autocompleteEnabled: action.status});
    }
    case LOADING_FILTER_FIELD_OPTIONS: {
        return assign({}, state, {filterFields: state.filterFields.map((field) => {
            if (field.rowId === action.filterField.rowId) {
                return assign({}, field, {loading: action.status});
            }
            return field;
        })});
    }
    case UPDATE_EXCEPTION_FIELD: {
        return assign({}, state, {filterFields: state.filterFields.map((field) => {
            if (field.rowId === action.rowId) {
                return assign({}, field, {exception: action.exceptionMessage});
            }
            return field;
        })});
    }
    case ADD_GROUP_FIELD: {
        const newGroupField = {
            id: new Date().getTime(),
            logic: "OR",
            groupId: action.groupId,
            index: action.index + 1
        };
        return assign({}, state, {groupFields: (state.groupFields ? [...state.groupFields, newGroupField] : [newGroupField])});
    }
    case UPDATE_LOGIC_COMBO: {
        return assign({}, state, {groupFields: state.groupFields.map((field) => {
            if (field.id === action.groupId) {
                return assign({}, field, {logic: action.logic});
            }
            return field;
        })});
    }
    case REMOVE_GROUP_FIELD: {
        return assign({}, state, {
            filterFields: state.filterFields.filter((field) => field.groupId !== action.groupId),
            groupFields: state.groupFields.filter((group) => group.id !== action.groupId)
        });
    }
    case CHANGE_CASCADING_VALUE: {
        return assign({}, state, {filterFields: state.filterFields.map((field) => {
            for (let i = 0; i < action.attributes.length; i++) {
                if (field.attribute === action.attributes[i].id) {
                    return assign({}, field, {value: null});
                }
            }
            return field;
        })});
    }
    case EXPAND_ATTRIBUTE_PANEL: {
        return assign({}, state, {
            attributePanelExpanded: action.expand
        });
    }
    case EXPAND_SPATIAL_PANEL: {
        return assign({}, state, {
            spatialPanelExpanded: action.expand
        });
    }
    case EXPAND_CROSS_LAYER: {
        return assign({}, state, {
            crossLayerExpanded: action.expand
        });
    }
    case SET_CROSS_LAYER_PARAMETER: {
        return assign({}, state, {
            crossLayerFilter: set(action.key, action.value, state.crossLayerFilter)
        });
    }
    case ADD_CROSS_LAYER_FILTER_FIELD: {
        return arrayUpsert(`crossLayerFilter.collectGeometries.queryCollection.filterFields`, {
            rowId: action.rowId,
            groupId: action.groupId,
            attribute: null,
            operator: "=",
            value: null,
            type: null,
            fieldOptions: {
                valuesCount: 0,
                currentPage: 1
            },
            exception: null
        }, {
            rowId: action.rowId
        }, state);
    }
    case UPDATE_CROSS_LAYER_FILTER_FIELD: {
        return set(
            `crossLayerFilter.collectGeometries.queryCollection.filterFields`,
            (get(state, 'crossLayerFilter.collectGeometries.queryCollection.filterFields') || [])
                .map((field) => {
                    if (field.rowId === action.rowId) {
                        return updateFilterField(field, action);
                    }
                    return field;
                })
            , state);
    }
    case REMOVE_CROSS_LAYER_FILTER_FIELD: {
        return arrayDelete('crossLayerFilter.collectGeometries.queryCollection.filterFields', {
            rowId: action.rowId
        }, state);
    }
    case RESET_CROSS_LAYER_FILTER: {
        return assign({}, state, {
            crossLayerFilter: {
                attribute: state.crossLayerFilter && state.crossLayerFilter.attribute
            }
        });
    }
    case SELECT_SPATIAL_METHOD: {
        return assign({}, state, {spatialField: assign({}, state.spatialField, {[action.fieldName]: action.method, geometry: null})});
    }
    case UPDATE_GEOMETRY: {
        return assign({}, state, {spatialField: assign({}, state.spatialField, {geometry: action.geometry})}, {toolbarEnabled: true});
    }
    case SELECT_SPATIAL_OPERATION: {
        return assign({}, state, {spatialField: assign({}, state.spatialField, {[action.fieldName]: action.operation})});
    }
    case CHANGE_SPATIAL_ATTRIBUTE: {
        return assign({}, state, {
            spatialField: assign({}, state.spatialField, {attribute: action.attribute}),
            crossLayerFilter: assign({}, state.crossLayerFilter, {attribute: action.attribute})
        });
    }
    case CHANGE_DRAWING_STATUS: {
        if (action.owner === "queryform" && action.status === "start") {
            return assign({}, state, {toolbarEnabled: false});
        }

        return state;
    }
    case CHANGE_SPATIAL_FILTER_VALUE: {
        return assign({}, state, {toolbarEnabled: true, spatialField: assign({}, state.spatialField, {
            value: action.value,
            collectGeometries: action.collectGeometries,
            geometry: action.srsName ? {...action.geometry, projection: action.srsName} : action.geometry
        })});
    }
    case END_DRAWING: {
        let newState;
        if (action.owner === "queryform") {
            newState = assign({}, state, {toolbarEnabled: true, spatialField: assign({}, state.spatialField, {
                collectGeometries: action.collectGeometries,
                geometry: action.geometry
            })});
        } else {
            newState = state;
        }

        return newState;
    }
    case REMOVE_SPATIAL_SELECT: {
        let spatialField = assign({}, initialState.spatialField, { attribute: state.spatialField.attribute, value: undefined });
        return assign({}, state, {spatialField: assign({}, state.spatialField, spatialField)});
    }
    case SHOW_SPATIAL_DETAILS: {
        return assign({}, state, {showDetailsPanel: action.show});
    }
    case QUERY_FORM_RESET: {
        let spatialField = assign({}, initialState.spatialField, { attribute: state.spatialField.attribute, value: undefined });
        let crossLayerFilter = { attribute: state.crossLayerFilter && state.crossLayerFilter.attribute };
        return assign({}, state, initialState, {
            spatialField,
            crossLayerFilter
        });
    }
    case SHOW_GENERATED_FILTER: {
        return assign({}, state, {showGeneratedFilter: action.data});
    }
    case CHANGE_DWITHIN_VALUE: {
        return assign({}, state, {spatialField: assign({}, state.spatialField, {geometry: assign({}, state.spatialField.geometry, {distance: action.distance})})});
    }
    case ZONE_FILTER: {
        return assign({}, state, {spatialField: assign({}, state.spatialField, {zoneFields: state.spatialField.zoneFields.map((field) => {
            if (field.id === action.id && action.data.features && action.data.features.length > 0) {
                return assign({}, field, {
                    values: action.data.features,
                    open: true,
                    error: null
                });
            }
            return field;
        })})});
    }
    case ZONE_SEARCH: {
        return assign({}, state, {spatialField: assign({}, state.spatialField, {zoneFields: state.spatialField.zoneFields.map((field) => {
            if (field.id === action.id) {
                return assign({}, field, {
                    busy: action.active
                });
            }
            return field;
        })})});
    }
    case ZONE_CHANGE: {
        let value; let geometry;
        const zoneFields = state.spatialField.zoneFields.map((field) => {
            if (field.id === action.id) {
                value = field.multivalue ? action.value.value : action.value.value[0];

                if (action.value.feature[0]) {
                    let f = action.value.feature[0];
                    let geometryName = f.geometry_name;
                    if (field.multivalue && action.value.feature.length > 1) {
                        for (let i = 1; i < action.value.feature.length; i++) {
                            let feature = action.value.feature[i];
                            if (feature) {
                                f = union(f, feature);
                            }
                        }

                        geometry = {coordinates: f.geometry.coordinates, geometryName: geometryName, geometryType: f.geometry.type};
                    } else {
                        geometry = {coordinates: f.geometry.coordinates, geometryName: geometryName, geometryType: f.geometry.type};
                    }
                }

                return assign({}, field, {
                    value: value,
                    open: false,
                    geometryName: geometry ? geometry.geometryName : null
                });
            }

            if (field.dependson && action.id === field.dependson.id) {
                return assign({}, field, {
                    disabled: false,
                    values: null,
                    value: null,
                    open: false,
                    dependson: assign({}, field.dependson, {value: value})
                });
            }

            return field;
        });

        let extent = bbox({
            type: "FeatureCollection",
            features: action.value.feature
        });

        return assign({}, state, {spatialField: assign({}, state.spatialField, {
            zoneFields: zoneFields,
            geometry: extent && geometry ? {
                extent: extent,
                type: geometry.geometryType,
                coordinates: geometry.coordinates
            } : null
        })});
    }
    case ZONES_RESET: {
        return assign({}, state, {spatialField: assign({}, state.spatialField, {
            zoneFields: state.spatialField.zoneFields.map((field) => {
                let f = assign({}, field, {
                    values: null,
                    value: null,
                    open: false,
                    error: null
                });

                if (field.dependson) {
                    return assign({}, f, {
                        disabled: true,
                        open: false,
                        value: null,
                        dependson: assign({}, field.dependson, {value: null})
                    });
                }

                return f;
            }),
            geometry: null
        })});
    }
    case ZONE_SEARCH_ERROR: {
        let error;
        return assign({}, state, {spatialField: assign({}, state.spatialField, {zoneFields: state.spatialField.zoneFields.map((field) => {
            if (field.id === action.id) {
                if (typeof action.error !== "object") {
                    if (action.error.status && action.error.statusText && action.error.data) {
                        error = {
                            status: action.error.status,
                            statusText: action.error.statusText,
                            data: action.error.data
                        };
                    } else {
                        error = {
                            message: action.error.message || "unknown error"
                        };
                    }
                } else {
                    error = action.error;
                }
                return assign({}, field, {
                    error: error,
                    busy: false
                });
            }
            return field;
        })})});
    }
    case SIMPLE_FILTER_FIELD_UPDATE: {
        const newSimpleFilterFields = state.simpleFilterFields.reduce((pr, f) => {
            if (f.fieldId === action.id) {
                pr.push({...f, ...action.properties});
            } else {
                pr.push(f);
            }
            return pr;
        }, []);
        return {...state, simpleFilterFields: newSimpleFilterFields};
    }
    case ADD_SIMPLE_FILTER_FIELD: {
        const field = ( action.properties.fieldId) ? action.properties : {...action.properties, fieldId: new Date().getTime()};
        const newSimpleFilterFields = (state.simpleFilterFields) ? [...state.simpleFilterFields, field] : [field];
        return {...state, simpleFilterFields: newSimpleFilterFields};
    }
    case REMOVE_SIMPLE_FILTER_FIELD: {
        return {...state, simpleFilterFields: state.simpleFilterFields.filter((f) => { return f.fieldId !== action.id; })};
    }
    case REMOVE_ALL_SIMPLE_FILTER_FIELDS: {
        return {...state, simpleFilterFields: []};
    }
    case LOAD_FILTER:
        const {attribute, ...other} = initialState.spatialField;
        const cleanInitialState = assign({}, initialState, {spatialField: {...other}});
        const {spatialField, filterFields, groupFields, crossLayerFilter, attributePanelExpanded, spatialPanelExpanded, crossLayerExpanded} = (action.filter || cleanInitialState);
        return {...state,
            ...{
                attributePanelExpanded,
                spatialPanelExpanded,
                crossLayerExpanded,
                spatialField: {
                    ...spatialField,
                    // This prevents an empty filter to override attribute settings made before from previous CHANGE_SPATIAL_ATTRIBUTE
                    attribute: spatialField && spatialField.attribute || state.spatialField && state.spatialField.attribute

                },
                filterFields,
                groupFields,
                crossLayerFilter: {
                    // TODO:: Improve the restore
                    ...crossLayerFilter,
                    // This prevents an empty filter to override attribute settings made before from previous CHANGE_SPATIAL_ATTRIBUTE
                    attribute: crossLayerFilter && crossLayerFilter.attribute || state.crossLayerFilter && state.crossLayerFilter.attribute
                }
            }
        };
    default:
        return state;
    }
}

module.exports = queryform;
