/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const ol = require('openlayers');
const {reproject, reprojectGeoJson} = require('../utils/CoordinatesUtils');

const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');
const {TOGGLE_CONTROL} = require('../actions/controls');
const {FEATURES_SELECTED, DRAWING_FEATURE} = require('../actions/draw');
const {REMOVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION, CANCEL_REMOVE_ANNOTATION, CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS, CANCEL_CLOSE_ANNOTATIONS,
    EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION, SAVE_ANNOTATION, TOGGLE_ADD,
    /*UPDATE_ANNOTATION_GEOMETRY,*/ VALIDATION_ERROR, REMOVE_ANNOTATION_GEOMETRY, TOGGLE_STYLE,
    SET_STYLE, NEW_ANNOTATION, SHOW_ANNOTATION, CANCEL_SHOW_ANNOTATION, FILTER_ANNOTATIONS, STOP_DRAWING,
    CHANGE_STYLER, UNSAVED_CHANGES, TOGGLE_CHANGES_MODAL, CHANGED_PROPERTIES, TOGGLE_STYLE_MODAL, UNSAVED_STYLE,
    ADD_TEXT, CANCEL_CLOSE_TEXT, SHOW_TEXT_AREA, SAVE_TEXT, CHANGED_SELECTED, RESET_COORD_EDITOR, CHANGE_RADIUS, CHANGE_TEXT,
    ADD_NEW_FEATURE, SET_INVALID_SELECTED} = require('../actions/annotations');

const {getAvailableStyler, DEFAULT_ANNOTATIONS_STYLES, convertGeoJSONToInternalModel, addIds, validateFeature, getComponents} = require('../utils/AnnotationsUtils');
const {set} = require('../utils/ImmutableUtils');
const {head, includes, slice, findIndex, isNil} = require('lodash');

const uuid = require('uuid');

const fixCoordinates = (coords, type) => {
    switch (type) {
        case "Polygon": return [coords];
        case "LineString": return coords;
        default: return coords[0];
    }
};

const {getBaseCoord} = require('../utils/AnnotationsUtils');

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
    }, properties: {...state.selected.properties}} : assign({}, state.editing.features[ftChangedIndex]);

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

        // polygonGeom setting
        let centerOL = reproject(selected.properties.center, "EPSG:4326", "EPSG:3857");

        // need to change the polygon coords after radius changes, but this implementation is ugly. is using ol to do that, maybe we need to refactor this
        let c = ol.geom.Polygon.fromCircle(new ol.geom.Circle([centerOL.x, centerOL.y], radius), 100).getCoordinates();
        let feature = {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: c
            }
        };
        let projFt = reprojectGeoJson(feature, "EPSG:3857", "EPSG:4326");
        selected = set("properties.polygonGeom", projFt.geometry, selected);
    } else if (selected.properties.isText) {
        let c = !isNil(coordinates) ? validCoordinates[0] : state.selected.geometry.coordinates;
        selected = assign({}, {...selected,
            properties: {
            ...state.selected.properties,
            valueText: !isNil(text) ? text : state.selected.properties.valueText
        }});
        features = state.editing.features.map(f => {
            return f.properties.id === state.selected.properties.id ? selected : f;
        });
        selected = {...selected, geometry: {coordinates: c, type: "Point"}};
    } else {
        features = state.editing.features.map(f => {
            return f.properties.id === state.selected.properties.id ? selected : f;
        });
        selected = {...selected, geometry: {...selected.geometry, coordinates: fixCoordinates(!isNil(coordinates) ? coordinates : selected.geometry.coordinates, selected.geometry.type)}};
    }
    selected = set("properties.isValidFeature", validateFeature({
        properties: selected.properties,
        components: getComponents(selected.geometry),
        type: selected.geometry.type
    }), selected);


    // let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === selected.properties.id);
    /*if (ftChangedIndex === -1) {
        newState = set("editing.features", state.editing.features.concat([selected]), state);
    } else {
        let selectedGeoJSON = selected;
        if (selected && selected.properties && selected.properties.isCircle) {
            selectedGeoJSON = set("geometry", selected.properties.polygonGeom, selectedGeoJSON);
        } else if (selected && selected.properties && selected.properties.isText) {
            selectedGeoJSON = set("geometry.type", "Point", selectedGeoJSON);
        }
        newState = set(`editing.features`, state.editing.features.map(f => {
            return set("properties.canEdit", false, f);
        }), state);

        newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
    }*/
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
            let newState = state;
            let selected = head(action.features) || null;
            if (!selected) {
                return state;
            }
            selected = set("properties.canEdit", true, selected);

            if (selected && selected.properties && selected.properties.isCircle) {
                selected = set("geometry.coordinates", selected.properties.center, selected);
                selected = set("geometry.type", "Circle", selected);
            }
            if (selected && selected.properties && selected.properties.isText) {
                selected = set("geometry.type", "Text", selected);
            }

            let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === selected.properties.id);
            let selectedGeoJSON = selected;
            if (selected && selected.properties && selected.properties.isCircle) {
                selectedGeoJSON = set("geometry", selected.properties.polygonGeom, selectedGeoJSON);
            } else if (selected && selected.properties && selected.properties.isText) {
                selectedGeoJSON = set("geometry.type", "Point", selectedGeoJSON);
            }
            newState = set(`editing.features`, state.editing.features.map(f => {
                return set("properties.canEdit", false, f);
            }), state);
            if (ftChangedIndex === -1) {
                newState = set("editing.features", newState.editing.features.concat([selectedGeoJSON]), newState);
            } else {
                newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
            }

            return assign({}, newState, {
                selected,
                coordinateEditorEnabled: !!selected,
                featureType: selected.geometry.type
            });
        }
        case DRAWING_FEATURE: {
            let selected = head(action.features) || null;
            let newState = state;
            if (selected && selected.properties && selected.properties.isCircle) {
                selected = set("properties.polygonGeom", selected.geometry, selected);
                selected = set("geometry", {coordinates: selected.properties.center, type: "Circle"}, selected);
            } else if (selected && selected.properties && selected.properties.isText) {
                selected = set("geometry.type", "Text", selected);
            }
            selected = set("properties.isValidFeature", validateFeature({
                properties: selected.properties,
                components: getComponents(selected.geometry),
                type: selected.geometry.type
            }), selected);
            selected = set("properties.canEdit", true, selected);

            let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === selected.properties.id);
            let selectedGeoJSON = selected;
            if (selected && selected.properties && selected.properties.isCircle) {
                selectedGeoJSON = set("geometry", selected.properties.polygonGeom, selectedGeoJSON);
            } else if (selected && selected.properties && selected.properties.isText) {
                selectedGeoJSON = set("geometry.type", "Point", selectedGeoJSON);
            }

            newState = set(`editing.features`, state.editing.features.map(f => {
                return set("properties.canEdit", false, f);
            }), state);
            if (ftChangedIndex === -1) {
                newState = set("editing.features", newState.editing.features.concat([selectedGeoJSON]), newState);
            } else {
                newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
            }

            return assign({}, newState, {
                selected,
                stylerType: head(getAvailableStyler(convertGeoJSONToInternalModel(selected.geometry)))
            });
        }
        case REMOVE_ANNOTATION:
            return assign({}, state, {
                removing: action.id
            });
        case CHANGE_RADIUS: {
            let newState;
            let selected = set("properties.radius", action.radius, state.selected);
            selected = set("properties.center", action.components[0], selected);
            selected = set("geometry.coordinates", action.components[0], selected);
            let center = reproject(selected.properties.center, "EPSG:4326", "EPSG:3857");

            // need to change the polygon coords after radius changes, but this implementation is ugly. is using ol to do that, maybe we need to refactor this
            let coordinates = ol.geom.Polygon.fromCircle(new ol.geom.Circle([center.x, center.y], action.radius), 100).getCoordinates();
            let feature = {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates
                }
            };
            let projFt = reprojectGeoJson(feature, "EPSG:3857", "EPSG:4326");
            selected = set("properties.polygonGeom", projFt.geometry, selected);

            let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
            const selectedGeoJSON = set("geometry", selected.properties.polygonGeom, selected);
            newState = set(`editing.features`, state.editing.features.map(f => {
                return set("properties.canEdit", false, f);
            }), state);
            if (ftChangedIndex === -1) {
                newState = set("editing.features", newState.editing.features.concat([selectedGeoJSON]), newState);
            } else {
                newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
            }
            return assign({}, newState, {selected});
        }
        case CHANGE_TEXT: {
            let newState;
            let selected = set("properties.valueText", action.text, state.selected);
            selected = set("properties.isValidFeature", validateFeature({
                properties: selected.properties,
                components: getComponents({coordinates: action.components[0], type: "Text"}),
                type: selected.geometry.type
            }), selected);
            selected = set("properties.isText", true, selected);
            selected = set("geometry.coordinates", action.components[0], selected);

            let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
            const selectedGeoJSON = set("geometry.type", "Point", selected);
            newState = set(`editing.features`, state.editing.features.map(f => {
                return set("properties.canEdit", false, f);
            }), state);
            if (ftChangedIndex === -1) {
                newState = set("editing.features", newState.editing.features.concat([selectedGeoJSON]), newState);
            } else {
                newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
            }
            return assign({}, newState, {selected});
        }
        case RESET_COORD_EDITOR: {
            let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
            const features = state.editing.features.map(f => {
                return assign({}, f, {
                    properties: {...f.properties, selected: false}
                });
            }).filter((f, i) => i !== ftChangedIndex);
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
        case ADD_NEW_FEATURE: {
            let selected = action.feature;
            let newState;
            if (action.feature.properties && action.feature.properties.isCircle ) {
                // verify this condition
                selected = set("geometry", action.feature.properties.polygonGeom, selected);
            }
            if (action.feature.properties && action.feature.properties.isText) {
                selected = set("geometry.type", "Point", selected);
            }

            let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
            newState = set(`editing.features`, state.editing.features.map(f => {
                return set("properties.canEdit", false, f);
            }), state);
            if (ftChangedIndex === -1) {
                newState = set("editing.features", newState.editing.features.concat([selected]), newState);
            } else {
                newState = set(`editing.features[${ftChangedIndex}]`, selected, newState);
            }

            return assign({}, newState, {
                coordinateEditorEnabled: false,
                drawing: false,
                selected: null
            });
        }
        case CHANGE_STYLER:
            return assign({}, state, {
                stylerType: action.stylerType
            });
        case STOP_DRAWING:
            return assign({}, state, {
                drawing: false
            });
        case ADD_TEXT: {
            return assign({}, state, {
                drawingText: {
                    ...state.drawingText,
                    drawing: true
                }
            });
        }
        case SAVE_TEXT: {
            let selected = set("properties.valueText", action.value, state.selected);

            /*let features = state.editing.features.map((f, i) => {
                if (i === state.editing.features.length - 1) {
                    return assign({}, f, {
                        properties: {...f.properties, valueText: action.value}
                    });
                }
                return f;
            });*/
            selected = set("properties.isValidFeature", validateFeature({
                properties: selected.properties,
                components: getComponents(selected.geometry),
                type: selected.geometry.type
            }), selected);

            return assign({}, state, {
                /*editing: {
                    ...state.editing,
                    features
                },*/
                selected,
                drawingText: {
                    show: false,
                    drawing: false
                }
            });
        }
        // TODO FIX THIS FOR SINGLE GEOM, to test if this works
        case CANCEL_CLOSE_TEXT:
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
        case SET_INVALID_SELECTED: {
            let selected = set("properties.isValidFeature", false, state.selected);
            switch (action.errorFrom) {
                case "text": selected = set("properties.valueText", undefined, selected); break;
                case "radius": selected = set("properties.radius", undefined, selected); break;
                case "coords": selected = set("geometry.coordinates", fixCoordinates(action.coordinates), selected); break;
                default: break;
            }
            return assign({}, state, {selected});
        }
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
            const selected = head(action.feature.features);
            let featureType = head(action.feature.features).geometry.type;
            if (selected && selected.properties && selected.properties.isCircle) {
                featureType = "Circle";
            }
            if (selected && selected.properties && selected.properties.isText) {
                featureType = "Text";
            }
            return assign({}, state, {
                editing: assign({}, action.feature, {features}),
                stylerType: head(getAvailableStyler(convertGeoJSONToInternalModel(action.feature.geometry || action.feature))),
                originalStyle: null,
                featureType
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
        /**case UPDATE_ANNOTATION_GEOMETRY: {
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
        }*/
        case TOGGLE_ADD: {
            const validValues = Object.keys(DEFAULT_ANNOTATIONS_STYLES);
            const styleProps = Object.keys(state.editing.style || {});
            const type = action.featureType || state.featureType;
            let newtype = styleProps.concat([action.featureType]).filter(s => includes(validValues, s)).length > 1 ? "FeatureCollection" : type;
            let properties = {
                id: uuid.v1(),
                /*"new": true,*/
                isValidFeature: false,
                canEdit: true
            };
            if (type === "Text") {
                newtype = "FeatureCollection";
                properties = set("isText", true, properties);
            }
            if (type === "Circle") {
                properties = set("isCircle", true, properties);
            }
            let selected = {type: "Feature", geometry: {type, coordinates: getBaseCoord(type)}, properties};

            let geojsonFt = set("geometry.type", type === "Text" ? "Point" : type === "Circle" ? "Polygon" : type, selected);
            geojsonFt = set("geometry.coordinates", type === "Circle" ? [[]] : [], geojsonFt);
            geojsonFt = set("geometry", type === "Point" || type === "Text" ? null : geojsonFt.geometry, geojsonFt);
            return assign({}, state, {
                drawing: !state.drawing,
                featureType: type,
                drawingText: {
                    show: false,
                    drawing: false
                },
                coordinateEditorEnabled: true,
                editing: assign({}, state.editing, {
                        features: type === "Circle" ? state.editing.features : state.editing.features.map(f => {
                            return set("properties.canEdit", false, f);
                        }).concat([geojsonFt]),
                        style: assign({}, state.editing.style, {
                            type: newtype,
                            [type]: state.editing.style && state.editing.style[type] || DEFAULT_ANNOTATIONS_STYLES[type]
                        })
                }),
                selected
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
