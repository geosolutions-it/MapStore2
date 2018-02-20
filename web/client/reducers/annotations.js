/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');

const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');
const {TOGGLE_CONTROL} = require('../actions/controls');
const {REMOVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION, CANCEL_REMOVE_ANNOTATION, CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS, CANCEL_CLOSE_ANNOTATIONS,
    EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION, SAVE_ANNOTATION, TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY, VALIDATION_ERROR, REMOVE_ANNOTATION_GEOMETRY, TOGGLE_STYLE,
    SET_STYLE, NEW_ANNOTATION, SHOW_ANNOTATION, CANCEL_SHOW_ANNOTATION, FILTER_ANNOTATIONS, STOP_DRAWING,
    CHANGE_STYLER, UNSAVED_CHANGES, TOGGLE_CHANGES_MODAL, CHANGED_PROPERTIES, TOGGLE_STYLE_MODAL, UNSAVED_STYLE,
    ADD_TEXT, CANCEL_CLOSE_TEXT, SHOW_TEXT_AREA, SAVE_TEXT} = require('../actions/annotations');

const {getAvailableStyler, DEFAULT_ANNOTATIONS_STYLES, convertGeoJSONToInternalModel} = require('../utils/AnnotationsUtils');
const {head, includes, slice} = require('lodash');

const uuid = require('uuid');

function annotations(state = { validationErrors: {} }, action) {
    switch (action.type) {
        case REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: action.id
            });
        case CHANGE_STYLER:
            return assign({}, state, {
                stylerType: action.stylerType
            });
        case STOP_DRAWING:
            return assign({}, state, {
                drawing: false
            });
        case ADD_TEXT:
            return assign({}, state, {
                drawingText: {
                    ...state.drawingText,
                    drawing: true
                }
            });
        case SAVE_TEXT: {
            const textValues = (state.editing && state.editing.properties && state.editing.properties.textValues || ["."]).map(v => {
                return v === "" ? action.value : v;
            });
            const textGeometriesIndexes = (state.editing && state.editing.properties && state.editing.properties.textGeometriesIndexes || [state.editing.geometry.geometries.length - 1]).map((v, i) => {
                return (i === state.editing.properties.textGeometriesIndexes.length) ? state.editing.geometry.geometries.length - 1 : v;
            });
            return assign({}, state, {
                editing: {
                    ...state.editing,
                    properties: assign({}, state.editing.properties, {
                            textValues,
                            textGeometriesIndexes
                        })
                },
                drawingText: {
                    show: false,
                    drawing: false
                }
            });
        }
        case CANCEL_CLOSE_TEXT:
        // TODO FIX THIS FOR SINGLE GEOM, to test if this works
            return assign({}, state, {
                drawingText: {
                    ...state.drawingText,
                    show: false
                },
                editing: assign({},
                    state.editing, {
                        geometry: state.config && state.config.multiGeometry ? assign({},
                            state.editing.geometry, {
                            geometries: state.editing.geometry.geometries.length === 1 ? [] : slice(state.editing.geometry.geometries, 0, state.editing.geometry.geometries.length - 1)}
                    ) : null,
                        properties: assign({}, state.editing.properties, {
                            textValues: (state.editing.properties.textValues || []).length ? slice(state.editing.properties.textValues, 0, state.editing.properties.textValues.length - 1) : [],
                            textGeometriesIndexes: (state.editing.properties.textGeometriesIndexes || []).length ? slice(state.editing.properties.textGeometriesIndexes, 0, state.editing.properties.textGeometriesIndexes.length - 1) : [] })
                    }
                )
            });
        case SHOW_TEXT_AREA:
            return assign({}, state, {
                drawingText: {
                    ...state.drawingText,
                    show: true
                }
            });
        case REMOVE_ANNOTATION_GEOMETRY:
            return assign({}, state, {
                removing: 'geometry',
                unsavedChanges: true
            });
        case EDIT_ANNOTATION:
            return assign({}, state, {
                editing: assign({}, action.feature),
                stylerType: head(getAvailableStyler(convertGeoJSONToInternalModel(action.feature.geometry, action.feature.properties && action.feature.properties.textValues || [] ))),
                originalStyle: null,
                featureType: action.featureType
            });
        case NEW_ANNOTATION:
            const id = uuid.v1();
            return assign({}, state, {
                editing: {
                    type: "Feature",
                    id,
                    geometry: null,
                    newFeature: true,
                    properties: {
                        id
                    }
                },
                originalStyle: null
            });
        case CONFIRM_REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: null,
                stylerType: "",
                current: null,
                editing: state.editing ? assign({}, state.editing, {
                    geometry: null,
                    style: {},
                    properties: assign({}, state.editing.properties, {
                            textValues: [],
                            textGeometriesIndexes: []
                        })
                }) : null
            });
        case CANCEL_REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: null
            });
        case CLOSE_ANNOTATIONS:
            return assign({}, state, {
                closing: true
            });
        case UNSAVED_CHANGES:
            return assign({}, state, {
                unsavedChanges: action.unsavedChanges
            });
        case UNSAVED_STYLE:
            return assign({}, state, {
                unsavedStyle: action.unsavedStyle
            });
        case CONFIRM_CLOSE_ANNOTATIONS:
        case CANCEL_CLOSE_ANNOTATIONS:
            return assign({}, state, {
                closing: false
            });
        case TOGGLE_CHANGES_MODAL:
            return assign({}, state, {
                showUnsavedChangesModal: !state.showUnsavedChangesModal
            });
        case TOGGLE_STYLE_MODAL:
            return assign({}, state, {
                showUnsavedStyleModal: !state.showUnsavedStyleModal
            });
        case CHANGED_PROPERTIES:
            return assign({}, state, {
                editedFields: assign({}, state.editedFields, {
                    [action.field]: action.value
                })
            });
        case CANCEL_EDIT_ANNOTATION:
            return assign({}, state, {
                editing: null,
                drawing: false,
                styling: false,
                originalStyle: null,
                validationErrors: {},
                editedFields: {},
                unsavedChanges: false
            });
        case SAVE_ANNOTATION:
            return assign({}, state, {
                editing: null,
                drawing: false,
                styling: false,
                originalStyle: null,
                validationErrors: {},
                editedFields: {},
                unsavedChanges: false
            });
        case PURGE_MAPINFO_RESULTS:
            return assign({}, state, {
                editing: null,
                removing: null,
                validationErrors: {},
                styling: false,
                drawing: false,
                originalStyle: null,
                filter: null,
                unsavedChanges: false
            });
        case UPDATE_ANNOTATION_GEOMETRY: {
            let stylerType;
            let availableStyler = getAvailableStyler(convertGeoJSONToInternalModel(action.geometry, typeof action.textChanged === "boolean" && action.textChanged ? state.editing.properties.textValues || ["v"] : [] ));
            if (action.geometry.type === "GeometryCollection") {
                stylerType = availableStyler.indexOf(state.stylerType) !== -1 ? state.stylerType : head(availableStyler);
            } else {
                stylerType = head(availableStyler);
            }
            let properties = state.editing.properties;
            if (typeof action.textChanged === "boolean" && action.textChanged) {
                properties = assign({}, state.editing.properties, {
                        textValues: (state.editing.properties.textValues || []).concat([""]),
                        textGeometriesIndexes: (state.editing.properties.textGeometriesIndexes || []).concat([action.geometry.geometries.length - 1])
                    });
            }
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    geometry: action.geometry,
                    properties
                }),
                stylerType,
                drawingText: {
                    ...state.drawingText,
                    show: typeof action.textChanged === "boolean" ? action.textChanged : false
                },
                unsavedChanges: true
            });
        }
        case TOGGLE_ADD: {
            const validValues = Object.keys(DEFAULT_ANNOTATIONS_STYLES);
            const styleProps = Object.keys(state.editing.style || {});
            const type = action.featureType || state.featureType;
            let newtype = styleProps.concat([action.featureType]).filter(s => includes(validValues, s)).length > 1 ? "GeometryCollection" : type;
            if (type === "Text") {
                newtype = "GeometryCollection";
            }
            return assign({}, state, {
                drawing: !state.drawing,
                featureType: type,
                drawingText: {
                    show: false,
                    drawing: false
                },
                editing: assign({}, state.editing, {
                        style: assign({}, state.editing.style, {
                            type: newtype,
                            [type]: state.editing.style && state.editing.style[type] || DEFAULT_ANNOTATIONS_STYLES[type]
                        })
                    })
                });
        }
        case TOGGLE_STYLE:
            return assign({}, state, {
                styling: !state.styling
            }, !state.styling ? {
                originalStyle: assign({}, state.editing.style, {
                    highlight: false
                })
            } : {});
        case VALIDATION_ERROR:
            return assign({}, state, {
                validationErrors: action.errors
            });
        case SET_STYLE:
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    style: assign({}, state.editing.style || {}, action.style,
                        {type: state.editing.style.type})
                })
            });
        case SHOW_ANNOTATION:
            return assign({}, state, {
                current: action.id
            });
        case CANCEL_SHOW_ANNOTATION:
            return assign({}, state, {
                current: null
            });
        case TOGGLE_CONTROL:
            if (action.control === 'annotations') {
                return assign({}, state, {
                    current: null,
                    editing: null,
                    removing: null,
                    validationErrors: {},
                    styling: false,
                    drawing: false,
                    filter: null,
                    originalStyle: null
                });
            }
            return state;
        case FILTER_ANNOTATIONS:
            return assign({}, state, {
                filter: action.filter
            });
        default:
            return state;

    }
}

module.exports = annotations;
