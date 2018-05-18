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
const {FEATURES_SELECTED, DRAWING_FEATURE} = require('../actions/draw');
const {REMOVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION, CANCEL_REMOVE_ANNOTATION, CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS, CANCEL_CLOSE_ANNOTATIONS,
    EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION, SAVE_ANNOTATION, TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY, VALIDATION_ERROR, REMOVE_ANNOTATION_GEOMETRY, TOGGLE_STYLE,
    SET_STYLE, NEW_ANNOTATION, SHOW_ANNOTATION, CANCEL_SHOW_ANNOTATION, FILTER_ANNOTATIONS, STOP_DRAWING,
    CHANGE_STYLER, UNSAVED_CHANGES, TOGGLE_CHANGES_MODAL, CHANGED_PROPERTIES, TOGGLE_STYLE_MODAL, UNSAVED_STYLE,
    ADD_TEXT, CANCEL_CLOSE_TEXT, SHOW_TEXT_AREA, SAVE_TEXT, CHANGED_SELECTED, RESET_COORD_EDITOR, CHANGE_RADIUS, CHANGE_TEXT,
    ADD_NEW_FEATURE} = require('../actions/annotations');

const {getAvailableStyler, DEFAULT_ANNOTATIONS_STYLES, convertGeoJSONToInternalModel, addIds, validateCoordsArray} = require('../utils/AnnotationsUtils');
const {head, includes, slice, findIndex, isNil} = require('lodash');

const uuid = require('uuid');

const fixCoordinates = (coords, type) => {
    switch (type) {
        case "Polygon": return [coords];
        case "LineString": return coords;
        default: return coords[0];
    }
};
/*
const getBaseCoord = (type) => {
    switch (type) {
        case "Polygon": return [[[], [], [], []]];
        case "LineString": return [[], []];
        default: return [];
    }
};
*/
const updateFeatures = (state, geom) => {
    let {coordinates, radius, text} = geom;
    let validCoordinates;
    let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
    /*if (ftChangedIndex === -1) {
        return state;
    }*/
    /*let ftChanged = ftChangedIndex === -1 ? {type: "Feature", geometry: {
        type: state.selected.geometry.type
    }, properties: state.selected.properties} : assign({}, state.editing.features[ftChangedIndex]);*/
    let ftChanged = ftChangedIndex === -1 ? {type: "Feature", geometry: {
        type: state.selected.geometry.type
    }, properties: {...state.selected.properties, allValidPoints: coordinates.filter(validateCoordsArray).length === coordinates.length}} : assign({}, state.editing.features[ftChangedIndex]);

    if (!isNil(coordinates)) {

        validCoordinates = coordinates;// .filter(validateCoordsArray);
        switch (ftChanged.geometry.type) {
            case "Polygon": ftChanged = assign({}, ftChanged, {
                    geometry: assign({}, ftChanged.geometry, {
                        coordinates: fixCoordinates(validCoordinates, ftChanged.geometry.type)
                    })
                }); break;
            case "LineString": ftChanged = assign({}, ftChanged, {
                geometry: assign({}, ftChanged.geometry, {
                     coordinates: fixCoordinates(validCoordinates, ftChanged.geometry.type)
                })
            }); break;
            default: ftChanged = assign({}, ftChanged, {
                geometry: assign({}, ftChanged.geometry, {
                    coordinates: fixCoordinates(validCoordinates, ftChanged.geometry.type)
                })
            });
        }
    }
    let selected = assign({}, ftChanged);
    let features;
    if (selected.properties.isCircle) {
        let center = !isNil(coordinates) ? validCoordinates[0] : state.selected.properties.center;

        selected = assign({}, {...selected, properties: {
            ...state.selected.properties, center, radius: !isNil(radius) ? radius : selected.properties.radius
        }});
        features = state.editing.features.map(f => {
            return f.properties.id === state.selected.properties.id ? selected : f;
        });
        selected = {...selected, geometry: {coordinates: center, type: "Circle"}};
    } else if (selected.properties.isText) {
        let center = !isNil(coordinates) ? validCoordinates[0] : state.selected.geometry.coordinates;
        selected = assign({}, {...selected,
            properties: {
            ...state.selected.properties,
            valueText: !isNil(text) ? text : state.selected.properties.valueText
        }});
        features = state.editing.features.map(f => {
            return f.properties.id === state.selected.properties.id ? selected : f;
        });
        selected = {...selected, geometry: {coordinates: center, type: "Text"}};
    } else {
        features = state.editing.features.map(f => {
            return f.properties.id === state.selected.properties.id ? selected : f;
        });
        selected = {...selected, geometry: {...selected.geometry, coordinates: fixCoordinates(!isNil(coordinates) ? coordinates : selected.geometry.coordinates, selected.geometry.type)}};
    }
    return assign({}, state, {
        editing: {...state.editing, features},
        selected
    });
};

function annotations(state = { validationErrors: {} }, action) {
    switch (action.type) {
        case CHANGED_SELECTED: {

            // TODO MANAGE ALSO CHANGE OF RADIUS AND TEXT VALUE
            return updateFeatures(state, action);
        }
        case FEATURES_SELECTED: {
            let selected = head(action.features) || null;
            if (selected && selected.properties && (selected.properties.isCircle)) {
                selected = {...selected, geometry: {coordinates: selected.properties.center, type: "Circle"}, type: "Feature"};
            }
            if (selected && selected.properties && selected.properties.isText) {
                selected = {...selected, geometry: {coordinates: selected.geometry.coordinates, type: "Text"}, type: "Feature"};
            }
            return assign({}, state, { selected,
                coordinateEditorEnabled: !!selected
             });
        }
        case DRAWING_FEATURE: {
            let selected = head(action.features) || null;
            if (selected && selected.properties && (selected.properties.isCircle)) {
                selected = {...selected, geometry: {coordinates: selected.properties.center, type: "Circle"}, type: "Feature"};
            }
            if (selected && selected.properties && selected.properties.isText) {
                selected = {...selected, geometry: {coordinates: selected.geometry.coordinates, type: "Text"}, type: "Feature"};
            }
            return assign({}, state, { selected});
        }
        case REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: action.id
            });
        case CHANGE_RADIUS:
            return updateFeatures(state, action);
        case CHANGE_TEXT:
            return updateFeatures(state, action);
        case RESET_COORD_EDITOR: {
            /*let coordinates;
            switch (state.selected.geometry.type) {
                case "Polygon": coordinates = state.selected.geometry.coordinates[0]; break;
                case "LineString": coordinates = state.selected.geometry.coordinates; break;
                default : coordinates = [state.selected.geometry.coordinates]; break;
            }*/
            const features = state.editing.features.map(f => {
                return assign({}, f, {
                    properties: {...f.properties, selected: false}
                });
            });
            return assign({}, state, {
                editing: {
                    ...state.editing,
                    features
                },
                drawing: false,
                coordinateEditorEnabled: false,
                selected: null
            });

        }
        case ADD_NEW_FEATURE:
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    features: state.editing.features.concat(action.feature)
                }),
                coordinateEditorEnabled: false,
                drawing: false,
                selected: null
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
            let features = state.editing.features.map((f, i) => {
                if (i === state.editing.features.length - 1) {
                    return assign({}, f, {
                        properties: {...f.properties, valueText: action.value}
                    });
                }
                return f;
            });

            return assign({}, state, {
                editing: {
                    ...state.editing,
                    features
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
                        features: state.config && state.config.multiGeometry ? slice(state.editing.features, 0, state.editing.features.length - 1) : []
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
        case EDIT_ANNOTATION: {
            const features = addIds(action.feature.features);
            return assign({}, state, {
                editing: assign({}, action.feature, {features}),
                stylerType: head(getAvailableStyler(convertGeoJSONToInternalModel(action.feature.geometry || action.feature))),
                originalStyle: null,
                featureType: action.featureType
            });
        }
        case NEW_ANNOTATION:
            const id = uuid.v1();
            return assign({}, state, {
                editing: {
                    type: "FeatureCollection",
                    id,
                    geometry: null,
                    features: [],
                    newFeature: true,
                    properties: {
                        id
                    }
                },
                selected: {},
                originalStyle: null
            });
        case CONFIRM_REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: null,
                stylerType: "",
                current: null,
                editing: state.editing ? assign({}, state.editing, {
                    features: [],
                    style: {
                        [state.featureType]: {...state.editing.style[state.featureType]},
                        type: state.featureType
                    }
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
            const featureCollection = action.geometry;
            let availableStyler = getAvailableStyler(convertGeoJSONToInternalModel(featureCollection));
            if (featureCollection.type === "GeometryCollection") {
                stylerType = availableStyler.indexOf(state.stylerType) !== -1 ? state.stylerType : head(availableStyler);
            } else {
                stylerType = head(availableStyler);
            }

            return assign({}, state, {
                editing: assign({}, state.editing, {
                    ...featureCollection
                }),
                stylerType,
                drawingText: {
                    ...state.drawingText,
                    show: action.textChanged === true
                },
                unsavedChanges: true
            });
        }
        case TOGGLE_ADD: {
            const validValues = Object.keys(DEFAULT_ANNOTATIONS_STYLES);
            const styleProps = Object.keys(state.editing.style || {});
            const type = action.featureType || state.featureType;
            let newtype = styleProps.concat([action.featureType]).filter(s => includes(validValues, s)).length > 1 ? "FeatureCollection" : type;
            if (type === "Text") {
                newtype = "FeatureCollection";
            }
            return assign({}, state, {
                drawing: !state.drawing,
                featureType: type,
                drawingText: {
                    show: false,
                    drawing: false
                },
                coordinateEditorEnabled: true,
                editing: assign({}, state.editing, {
                        style: assign({}, state.editing.style, {
                            type: newtype,
                            [type]: state.editing.style && state.editing.style[type] || DEFAULT_ANNOTATIONS_STYLES[type]
                        })
                    }),
                    selected: {type: "Feature", geometry: {type, coordinates: []}, properties: {"new": true}}
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
                    editedFields: {},
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
