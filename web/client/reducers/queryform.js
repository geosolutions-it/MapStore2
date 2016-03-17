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
    SELECT_SPATIAL_METHOD,
    SELECT_SPATIAL_OPERATION,
    REMOVE_SPATIAL_SELECT,
    SHOW_SPATIAL_DETAILS,
    QUERY_FORM_RESET,
    SHOW_GENERATED_FILTER,
    CHANGE_DWITHIN_VALUE
} = require('../actions/queryform');

const {
    END_DRAWING,
    CHANGE_DRAWING_STATUS
} = require('../actions/draw');

const assign = require('object-assign');

const initialState = {
    searchUrl: null,
    featureTypeConfigUrl: null,
    showGeneratedFilter: false,
    attributePanelExpanded: true,
    spatialPanelExpanded: true,
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
    filterFields: [],
    spatialField: {
        method: null,
        attribute: "the_geom",
        operation: "INTERSECTS",
        geometry: null
    }
};

function queryform(state = initialState, action) {
    switch (action.type) {
        case ADD_FILTER_FIELD: {
            //
            // Calculate the key number, this should be different for each new element
            //
            const newFilterField = {
                rowId: new Date().getUTCMilliseconds(),
                groupId: action.groupId,
                attribute: null,
                operator: "=",
                value: null,
                type: null,
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
                    let f = assign({}, field, {[action.fieldName]: action.fieldValue, type: action.fieldType});
                    if (action.fieldName === "attribute") {
                        f.value = null;
                    }
                    return f;
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
                id: new Date().getUTCMilliseconds(),
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
        case SELECT_SPATIAL_METHOD: {
            return assign({}, state, {spatialField: assign({}, state.spatialField, {[action.fieldName]: action.method, geometry: null})});
        }
        case SELECT_SPATIAL_OPERATION: {
            return assign({}, state, {spatialField: assign({}, state.spatialField, {[action.fieldName]: action.operation})});
        }
        case CHANGE_DRAWING_STATUS: {
            if (action.owner === "queryform" && action.status === "start") {
                return assign({}, state, {toolbarEnabled: false});
            }

            return state;
        }
        case END_DRAWING: {
            let newState;
            if (action.owner === "queryform") {
                newState = assign({}, state, {toolbarEnabled: true, spatialField: assign({}, state.spatialField, {geometry: action.geometry})});
            } else {
                newState = state;
            }

            return newState;
        }
        case REMOVE_SPATIAL_SELECT: {
            return assign({}, state, {spatialField: assign({}, state.spatialField, initialState.spatialField)});
        }
        case SHOW_SPATIAL_DETAILS: {
            return assign({}, state, {showDetailsPanel: action.show});
        }
        case QUERY_FORM_RESET: {
            return assign({}, state, initialState);
        }
        case SHOW_GENERATED_FILTER: {
            return assign({}, state, {showGeneratedFilter: action.data});
        }
        case CHANGE_DWITHIN_VALUE: {
            return assign({}, state, {spatialField: assign({}, state.spatialField, {geometry: assign({}, state.spatialField.geometry, {distance: action.distance})})});
        }
        default:
            return state;
    }
}

module.exports = queryform;
