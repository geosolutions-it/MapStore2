/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {transformLineToArcs} = require('../utils/CoordinatesUtils');

const circle = require('@turf/circle').default;

const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');
const {TOGGLE_CONTROL} = require('../actions/controls');
const {FEATURES_SELECTED, DRAWING_FEATURE} = require('../actions/draw');
const {REMOVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION, CANCEL_REMOVE_ANNOTATION, CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS, CANCEL_CLOSE_ANNOTATIONS,
    EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION, SAVE_ANNOTATION, TOGGLE_ADD, VALIDATION_ERROR, REMOVE_ANNOTATION_GEOMETRY,
    TOGGLE_STYLE, SET_STYLE, NEW_ANNOTATION, SHOW_ANNOTATION, CANCEL_SHOW_ANNOTATION, FILTER_ANNOTATIONS,
    UNSAVED_CHANGES, TOGGLE_GEOMETRY_MODAL, TOGGLE_CHANGES_MODAL, CHANGED_PROPERTIES, TOGGLE_STYLE_MODAL, UNSAVED_STYLE,
    ADD_TEXT, CHANGED_SELECTED, RESET_COORD_EDITOR, CHANGE_RADIUS, CHANGE_TEXT,
    ADD_NEW_FEATURE, SET_EDITING_FEATURE, SET_INVALID_SELECTED, TOGGLE_DELETE_FT_MODAL, CONFIRM_DELETE_FEATURE, HIGHLIGHT_POINT,
    CHANGE_FORMAT, UPDATE_SYMBOLS, ERROR_SYMBOLS, SET_DEFAULT_STYLE, LOADING, CHANGE_GEOMETRY_TITLE, FILTER_MARKER
} = require('../actions/annotations');

const {validateCoordsArray, getAvailableStyler, convertGeoJSONToInternalModel, addIds, validateFeature,
    getComponents, updateAllStyles, getBaseCoord} = require('../utils/AnnotationsUtils');
const {set} = require('../utils/ImmutableUtils');
const {head, findIndex, isNil, slice, castArray} = require('lodash');

const uuid = require('uuid');

const fixCoordinates = (coords, type) => {
    switch (type) {
    case "Polygon": return [coords];
    case "LineString": case "MultiPoint": return coords;
    default: return coords[0];
    }
};

function annotations(state = { validationErrors: {} }, action) {
    switch (action.type) {
    case CHANGED_SELECTED: {
        let newState = set(`unsavedGeometry`, true, state);
        let {coordinates, radius, text} = action;
        let validCoordinates;
        let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
        let ftChanged = ftChangedIndex === -1 ? {type: "Feature", geometry: {
            type: state.selected.geometry.type
        }, properties: {...state.selected.properties}} : assign({}, state.editing.features[ftChangedIndex]);
        if (ftChanged.geometry && !ftChanged.geometry.type || !ftChanged.geometry) {
            ftChanged = set("geometry.type", state.selected.geometry.type, ftChanged);
        }
        if (!isNil(coordinates)) {

            validCoordinates = coordinates;// .filter(validateCoordsArray);
            switch (ftChanged.geometry.type) {
            case "Polygon": ftChanged = assign({}, ftChanged, {
                geometry: assign({}, ftChanged.geometry, {
                    coordinates: fixCoordinates(validCoordinates, ftChanged.geometry.type)
                })
            }); break;
            case "LineString": case "MultiPoint": ftChanged = assign({}, ftChanged, {
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
            let centerCoords = !isNil(coordinates) ? validCoordinates[0] : state.selected.properties.center;

            selected = assign({}, {...selected, properties: {
                ...state.selected.properties, center: centerCoords, radius: !isNil(radius) ? radius : selected.properties.radius
            }});
            features = state.editing.features.map(f => {
                return f.properties.id === state.selected.properties.id ? selected : f;
            });
            selected = { ...selected, geometry: { coordinates: centerCoords, type: "Circle"}};
            let center;
            let c = {
                type: 'Polygon',
                coordinates: [[[]]]
            };
                // polygonGeom setting
            if (validateCoordsArray(selected.properties.center)) {
                center = selected.properties.center;
                // turf/circle by default use km unit hence we divide by 1000 the radius(in meters)
                c = circle(
                    center,
                    action.crs === "EPSG:4326" ? action.radius : action.radius / 1000,
                    { steps: 100, units: action.crs === "EPSG:4326" ? "degrees" : "kilometers" }
                ).geometry;
            } else {
                selected = set("properties.center", [], selected);
            }

            selected = set("properties.polygonGeom", c, selected);
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
        return assign({}, newState, {
            editing: {...newState.editing, features},
            selected,
            unsavedChanges: true
        });
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
        newState = set(`editing.tempFeatures`, newState.editing.features, newState);
        newState = set(`editing`, updateAllStyles(newState.editing, {highlight: false}), newState);
        if (ftChangedIndex === -1) {

            newState = set("editing.features", newState.editing.features.concat([selectedGeoJSON]), newState);
        } else {
            selectedGeoJSON = set("style", castArray(newState.editing.features[ftChangedIndex].style).map(s => ({...s, highlight: true})), selectedGeoJSON);
            newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
            selected = set("style", newState.editing.features[ftChangedIndex].style, selected);
        }
        return assign({}, newState, {
            selected,
            coordinateEditorEnabled: !!selected,
            featureType: selected.geometry.type
        });
    }
    case DRAWING_FEATURE: {
        let selected = head(action.features) || null;
        selected = set("style", state.selected.style, selected);
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
        newState = set(`editing.features`, state.editing.features.map(f => {
            return set("properties.canEdit", false, f);
        }), state);

        let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === selected.properties.id);
        let selectedGeoJSON = selected;
        if (selected && selected.properties && selected.properties.isCircle) {
            selectedGeoJSON = set("geometry", selected.properties.polygonGeom, selectedGeoJSON);
        } else if (selected && selected.properties && selected.properties.isText) {
            selectedGeoJSON = set("geometry.type", "Point", selectedGeoJSON);
        }

        newState = set(`unsavedGeometry`, true, newState);
        if (ftChangedIndex === -1) {
            newState = set("editing.features", newState.editing.features.concat([selectedGeoJSON]), newState);
        } else {
            newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
        }

        return assign({}, newState, {
            selected,
            unsavedChanges: true,
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
        if (action.components.length === 0 || action.radius === null) {
            selected = set("properties.isValidFeature", false, selected);
            return assign({}, state, {
                selected,
                unsavedChanges: true
            });
        }
        selected = set("properties.isValidFeature", validateFeature({
            properties: selected.properties,
            components: getComponents({coordinates: action.components[0] || [], type: "Circle"}),
            type: "Circle"
        }), selected);
        selected = set("properties.center", action.components[0], selected);
        selected = set("geometry.coordinates", action.components[0], selected);

        // need to change the polygon coords after radius changes
        // but this implementation is ugly. is using openlayers to do that and maybe we need to refactor this

        let feature = circle(
            selected.properties.center,
            action.crs === "EPSG:4326" ? action.radius : action.radius / 1000,
            { steps: 100, units: action.crs === "EPSG:4326" ? "degrees" : "kilometers" }
        );
        selected = set("properties.polygonGeom", feature.geometry, selected);

        let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
        const selectedGeoJSON = set("geometry", selected.properties.polygonGeom, selected);
        newState = set(`editing.features`, state.editing.features.map(f => {
            return set("properties.canEdit", false, f);
        }), state);

        newState = set(`unsavedGeometry`, true, newState);
        if (ftChangedIndex === -1) {
            newState = set("editing.features", newState.editing.features.concat([selectedGeoJSON]), newState);
        } else {
            newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
        }
        return assign({}, newState, {
            selected,
            unsavedChanges: true
        });
    }
    case CHANGE_TEXT: {
        let newState;
        let selected = set("properties.valueText", action.text, state.selected);
        selected = set("style[0].label", action.text, selected);
        selected = set("properties.isValidFeature", validateFeature({
            properties: selected.properties,
            components: getComponents({coordinates: action.components[0] || [], type: "Text"}),
            type: "Text"
        }), selected);
        selected = set("properties.isText", true, selected);
        selected = set("geometry.coordinates", action.components[0] || [[]], selected);

        let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
        const selectedGeoJSON = set("geometry.type", "Point", selected);
        newState = set(`editing.features`, state.editing.features.map(f => {
            return set("properties.canEdit", false, f);
        }), state);

        newState = set(`unsavedGeometry`, true, newState);
        if (ftChangedIndex === -1) {
            newState = set("editing.features", newState.editing.features.concat([selectedGeoJSON]), newState);
        } else {
            newState = set(`editing.features[${ftChangedIndex}]`, selectedGeoJSON, newState);
        }
        return assign({}, newState, {
            selected,
            unsavedChanges: true
        });
    }
    case RESET_COORD_EDITOR: {
        let newState = set(`editing.features`, state.editing.features.map(f => {
            return set("properties.canEdit", false, f);
        }), state);
        const newfeatures = newState.editing.features;
        // only for the circles the feature is not being added

        let features = newState.editing.tempFeatures;
        if (state.featureType !== "Circle" && state.drawing) {
            features = slice(newfeatures, 0, newfeatures.length - 1);
        }
        return assign({}, newState, {
            editing: {
                ...newState.editing,
                features
            },
            drawing: false,
            coordinateEditorEnabled: false,
            unsavedGeometry: false,
            selected: null,
            showUnsavedGeometryModal: false
        });
    }
    case ADD_NEW_FEATURE: {
        let selected = state.selected;
        let newState = state;
        if (selected.properties && selected.properties.isCircle ) {
            // verify this condition
            selected = set("geometry", selected.properties.polygonGeom, selected);
        }
        if (selected.properties && selected.properties.isText) {
            selected = set("geometry.type", "Point", selected);
        }
        if (selected.properties && selected.properties.useGeodesicLines) {
            selected = set("properties.geometryGeodesic", {type: "LineString", coordinates: transformLineToArcs(selected.geometry.coordinates)}, selected);
        }
        selected = set("properties.canEdit", false, selected);

        let ftChangedIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
        if (ftChangedIndex === -1) {
            newState = set("editing.features", newState.editing.features.concat([selected]), newState);
        } else {
            selected = set("style", castArray(newState.editing.features[ftChangedIndex].style).map(s => ({...s, highlight: false})), selected);
            newState = set(`editing.features[${ftChangedIndex}]`, selected, newState);
        }
        newState = set(`editing.tempFeatures`, newState.editing.features, newState);
        newState = {...newState, editing: {...newState.editing, properties: {...newState.editing.properties, ...newState.editedFields}}};

        return assign({}, newState, {
            coordinateEditorEnabled: false,
            drawing: false,
            unsavedGeometry: false,
            selected: null,
            config: {...newState.config, filter: ''}
        });
    }
    case SET_EDITING_FEATURE: {
        if (!action.feature || action.feature.type !== 'FeatureCollection') {
            return state;
        }
        const feature = set('features', action.feature.features.map(x => set('properties.canEdit', false, x)), action.feature);
        const newFeature = set('newFeature', true, set('properties.canEdit', false, set('tempFeatures', feature.features, feature)));
        const newState = set('editing', newFeature, state);
        return assign({}, newState, {
            coordinateEditorEnabled: false,
            drawing: false,
            unsavedGeometry: false,
            selected: null,
            config: {...newState.config, filter: ''}
        });
    }
    case TOGGLE_DELETE_FT_MODAL: {
        return set("showDeleteFeatureModal", !state.showDeleteFeatureModal, state);
    }
    case CONFIRM_DELETE_FEATURE: {
        let newState = set("editing.features", state.editing.features.filter(f => f.properties.id !== state.selected.properties.id), state);
        newState = set("unsavedChanges", true, newState);
        newState = set("drawing", false, newState);
        newState = set("coordinateEditorEnabled", false, newState);
        return newState;
    }
    case ADD_TEXT: {
        return assign({}, state, {
            drawingText: {
                ...state.drawingText,
                drawing: true
            }
        });
    }
    case SET_INVALID_SELECTED: {
        let selected = set("properties.isValidFeature", false, state.selected);
        switch (action.errorFrom) {
        case "text": selected = set("properties.valueText", undefined, selected); break;
        case "radius": selected = set("properties.radius", undefined, selected); break;
        case "coords": selected = set("geometry.coordinates", fixCoordinates(action.coordinates, selected.geometry.type), selected); break;
        default: break;
        }
        return assign({}, state, {selected});
    }

    case REMOVE_ANNOTATION_GEOMETRY:
        return assign({}, state, {
            removing: action.id,
            unsavedChanges: true
        });
    case EDIT_ANNOTATION: {
        const features = addIds(action.feature.features);
        const selected = head(action.feature.features);
        let featureType = selected && selected.geometry && selected.geometry.type;
        if (selected && selected.properties && selected.properties.isCircle) {
            featureType = "Circle";
        }
        if (selected && selected.properties && selected.properties.isText) {
            featureType = "Text";
        }
        return assign({}, state, {
            editing: updateAllStyles(assign({}, action.feature, {features}), {highlight: false}),
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
        const features = state.editing?.features?.filter(feature=> feature.properties.id !== action.id) || [];
        const delSelectedFeature = state?.selected?.properties?.id === action.id || false;
        return assign({}, state, {
            removing: null,
            stylerType: "",
            current: null,
            ...(delSelectedFeature && {selected: null}),
            editing: state.editing ? assign({}, state.editing, {
                features,
                style: {
                    type: state.featureType
                }
            }) : null
        });
    case CHANGE_GEOMETRY_TITLE: {
        let newState = state;
        const ftIndex = findIndex(state.editing.features, (f) => f.properties.id === state.selected.properties.id);
        const editingFt = set("properties.geometryTitle", action.title, state.editing.features[ftIndex]);
        const selectedFt = set("properties.geometryTitle", action.title, state.selected);
        newState = set(`editing.features[${ftIndex}]`, editingFt, newState);
        return {...newState, selected: selectedFt};
    }
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
    case CONFIRM_CLOSE_ANNOTATIONS: {
        return assign({}, state, {
            closing: false,
            coordinateEditorEnabled: false
        });
    }
    case CANCEL_CLOSE_ANNOTATIONS:
        return assign({}, state, {
            closing: false
        });
    case TOGGLE_CHANGES_MODAL:
        return assign({}, state, {
            showUnsavedChangesModal: !state.showUnsavedChangesModal
        });
    case TOGGLE_GEOMETRY_MODAL:
        return assign({}, state, {
            showUnsavedGeometryModal: !!state.unsavedGeometry && !state.showUnsavedGeometryModal
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
            current: null,
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
            selected: null,
            filter: null,
            unsavedChanges: false,
            editedFields: {}
        });
    case TOGGLE_ADD: {
        const type = action.featureType || state.featureType;
        let properties = {
            id: uuid.v1(),
            isValidFeature: false,
            canEdit: true
        };
        if (type === "Text") {
            properties = set("isText", true, properties);
        }
        if (type === "Circle") {
            properties = set("isCircle", true, properties);
            properties = set("isDrawing", true, properties);
        }
        let selected = {type: "Feature", geometry: {type, coordinates: getBaseCoord(type)}, properties,
            style: {...(state.config?.defaultPointType === 'symbol' ? state.defaultStyles?.POINT?.symbol : state.defaultStyles?.POINT.marker), id: uuid.v1()}};

        let geojsonFt = set("geometry.type", type === "Text" ? "Point" : type === "Circle" ? "Polygon" : type, selected);
        geojsonFt = set("geometry.coordinates", type === "Circle" ? [[]] : [], geojsonFt);
        geojsonFt = set("geometry", type === "Point" || type === "Text" ? null : geojsonFt.geometry, geojsonFt);
        let newState = set(`editing.tempFeatures`, state.editing.features, state);
        return assign({}, state, {
            drawing: !newState.drawing,
            featureType: type,
            drawingText: {
                show: false,
                drawing: false
            },
            validationErrors: {},
            coordinateEditorEnabled: true,
            editing: assign({}, newState.editing, {
                features: newState.editing.features.map(f => {
                    return set("properties.canEdit", false, f);
                }).concat([geojsonFt])
            }),
            stylerType: head(getAvailableStyler(convertGeoJSONToInternalModel(selected.geometry))),
            selected
        });
    }
    case TOGGLE_STYLE:
        // removing highlight when the styler is opened
        const newStyling = !state.styling;
        return {
            ...state,
            styling: newStyling,
            originalStyle: newStyling ? state.selected && state.selected.style : state.originalStyle,
            selected: set("style", castArray(state.selected && state.selected.style).map(s => ({...s, highlight: !newStyling})), state.selected),
            editing: set("features", (state.editing && state.editing.features || []).map(f => ({...f, style: castArray(f.style).map(s => ({...s, highlight: !newStyling ? f.properties.id === (state.selected && state.selected.properties.id) : false}))})), state.editing)
        };
    case VALIDATION_ERROR:
        return assign({}, state, {
            validationErrors: action.errors
        });
    case SET_STYLE: {
        let selected = set("style", action.style, state.selected);
        let originalFeatureIndex = findIndex(state.editing && state.editing.features, ftTemp => ftTemp.properties.id === state.selected.properties.id);
        if (originalFeatureIndex !== -1) {
            let editing = set(`features[${originalFeatureIndex}].style`, action.style, state.editing);
            return assign({}, state, { selected, editing });
        }
        return assign({}, state, { selected });
    }
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
                coordinateEditorEnabled: false,
                filter: null,
                editedFields: {},
                originalStyle: null,
                selected: null
            });
        }
        return state;
    case HIGHLIGHT_POINT: {
        return !action.point ?
            {...state, clickPoint: null, showMarker: false} :
            assign({}, state, {
                clickPoint: {latlng: {lat: action.point.lat, lng: action.point.lon }},
                showMarker: true
            });
    }
    case CHANGE_FORMAT: {
        return {...state, format: action.format};
    }
    case UPDATE_SYMBOLS: {
        return {...state, symbolList: action.symbols || []};
    }
    case FILTER_ANNOTATIONS:
        return assign({}, state, {
            filter: action.filter
        });
    case ERROR_SYMBOLS:
        return {...state, symbolErrors: action.symbolErrors};
    case SET_DEFAULT_STYLE:
        return set(`defaultStyles.${action.path}`, action.style, state);
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    case FILTER_MARKER: {
        return {...state, config: {...state.config, filter: action.filter}};
    }
    default:
        return state;

    }
}

module.exports = annotations;
