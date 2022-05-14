/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { head, findIndex, castArray, isArray, find, values, isEmpty, isUndefined, get } from 'lodash';
import assign from 'object-assign';
import axios from 'axios';
import uuidv1 from 'uuid/v1';
import { saveAs } from 'file-saver';

import { MAP_CONFIG_LOADED } from '../actions/config';
import { TOGGLE_CONTROL, toggleControl, setControlProperty } from '../actions/controls';
import { addLayer, updateNode, removeLayer, CHANGE_LAYER_PROPERTIES, CHANGE_GROUP_PROPERTIES } from '../actions/layers';
import { changeMeasurement } from '../actions/measurement';
import { error } from '../actions/notifications';
import { closeFeatureGrid } from '../actions/featuregrid';
import { hideMapinfoMarker, purgeMapInfoResults, closeIdentify, PURGE_MAPINFO_RESULTS } from '../actions/mapInfo';
import {
    updateAnnotationGeometry,
    setStyle,
    toggleStyle,
    cleanHighlight,
    toggleAdd,
    showAnnotation,
    editAnnotation,
    setDefaultStyle,
    setErrorSymbol,
    loading,
    CONFIRM_REMOVE_ANNOTATION,
    SAVE_ANNOTATION,
    EDIT_ANNOTATION,
    CANCEL_EDIT_ANNOTATION,
    SET_STYLE,
    RESTORE_STYLE,
    HIGHLIGHT,
    CLEAN_HIGHLIGHT,
    CONFIRM_CLOSE_ANNOTATIONS,
    START_DRAWING,
    DOWNLOAD,
    LOAD_ANNOTATIONS,
    CHANGED_SELECTED,
    RESET_COORD_EDITOR,
    CHANGE_RADIUS,
    ADD_NEW_FEATURE,
    SET_EDITING_FEATURE,
    CHANGE_TEXT,
    NEW_ANNOTATION,
    TOGGLE_STYLE,
    CONFIRM_DELETE_FEATURE,
    OPEN_EDITOR,
    TOGGLE_ANNOTATION_VISIBILITY,
    LOAD_DEFAULT_STYLES,
    GEOMETRY_HIGHLIGHT,
    UNSELECT_FEATURE,
    toggleVisibilityAnnotation
} from '../actions/annotations';
import { FEATURES_SELECTED, GEOMETRY_CHANGED, DRAWING_FEATURE, changeDrawingStatus } from '../actions/draw';

import { set } from '../utils/ImmutableUtils';
import { reprojectGeoJson } from '../utils/CoordinatesUtils';
import {
    ANNOTATION_TYPE,
    normalizeAnnotation,
    removeDuplicate,
    validateCoordsArray,
    getStartEndPointsForLinestring,
    modifySelectedInEdited,
    DEFAULT_ANNOTATIONS_STYLES,
    STYLE_POINT_MARKER,
    STYLE_POINT_SYMBOL,
    DEFAULT_SHAPE,
    DEFAULT_PATH, ANNOTATIONS
} from '../utils/AnnotationsUtils';
import { MEASURE_TYPE } from '../utils/MeasurementUtils';
import { createSvgUrl } from '../utils/VectorStyleUtils';

import { isFeatureGridOpen } from '../selectors/featuregrid';
import { queryPanelSelector } from '../selectors/controls';
import { annotationsLayerSelector, multiGeometrySelector, symbolErrorsSelector, editingSelector } from '../selectors/annotations';
import { mapNameSelector } from '../selectors/map';
import { groupsSelector } from '../selectors/layers';


import symbolMissing from '../product/assets/symbols/symbolMissing.svg';
import {isActiveSelector} from "../selectors/measurement";
/**
    * Epics for annotations
    * @name epics.annotations
    * @type {Object}
    */

/**
 * TODO test this and move it into utils
*/
const validateFeatureCollection = (feature) => {
    let features = feature.features.map(f => {
        let coords = [];
        if (!f.geometry ) {
            return f;
        }
        if (f.geometry.type === "LineString" || f.geometry.type === "MultiPoint") {
            coords = f.geometry.coordinates.filter(validateCoordsArray);
        } else if (f.geometry.type === "Polygon") {
            coords = f.geometry.coordinates[0] ? [f.geometry.coordinates[0].filter(validateCoordsArray)] : [[]];
        } else {
            coords = [f.geometry.coordinates].filter(validateCoordsArray);
            coords = coords.length ? coords[0] : [];
        }
        return set("geometry.coordinates", coords, f);
    });
    return set("features", features, feature);
};

/**
 * Get geodesic property from the annotation config
 * @param state
 * @param drawMethod
 * @return {boolean}
 */
const getGeodesicProperty = (state, drawMethod = "Circle") => {
    return drawMethod === "Circle" && get(state.annotations, "config.geodesic", false);
};

const getSelectDrawStatus = (state) => {
    let feature = state.annotations.editing;
    const multiGeom = multiGeometrySelector(state);
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: !multiGeom,
        editEnabled: false,
        selectEnabled: true,
        drawEnabled: false,
        translateEnabled: false,
        transformToFeatureCollection: true,
        geodesic: getGeodesicProperty(state, state.draw.drawMethod)
    };

    feature = validateFeatureCollection(feature);
    return changeDrawingStatus("drawOrEdit", state.draw.drawMethod, ANNOTATIONS, [feature], drawOptions, assign({}, feature.style, {highlight: false}));
};
const getReadOnlyDrawStatus = (state) => {
    let feature = state.annotations.editing;
    const multiGeom = multiGeometrySelector(state);
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: !multiGeom,
        editEnabled: false,
        selectEnabled: false,
        translateEnabled: false,
        drawEnabled: false,
        transformToFeatureCollection: true,
        geodesic: getGeodesicProperty(state, state.draw.drawMethod)
    };
    feature = validateFeatureCollection(feature);
    return changeDrawingStatus("drawOrEdit", state.draw.drawMethod, ANNOTATIONS, [feature], drawOptions, feature.style);
};
const getEditingGeomDrawStatus = (state) => {
    let feature = state.annotations.editing;
    const multiGeom = multiGeometrySelector(state);
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: !multiGeom,
        editEnabled: true,
        selectEnabled: false,
        drawEnabled: false,
        editFilter: (f) => f.getProperties().canEdit,
        translateEnabled: false,
        addClickCallback: true,
        useSelectedStyle: true,
        transformToFeatureCollection: true,
        geodesic: getGeodesicProperty(state, state.draw.drawMethod)
    };
    feature = validateFeatureCollection(feature);
    return changeDrawingStatus("drawOrEdit", state.draw.drawMethod, ANNOTATIONS, [feature], drawOptions, feature.style);
};
const mergeGeometry = (features) => {
    if (features[0].type === "FeatureCollection") {
        return features[0];
    }
    return features.reduce((previous, feature) => {
        if (previous.type === 'Empty') {
            if (feature.type === "FeatureCollection") {
                return mergeGeometry(feature.features);
            }
            return feature.geometry;
        }
        if (previous.type === 'Point') {
            return {
                type: 'MultiPoint',
                coordinates: [previous.coordinates, feature.geometry.coordinates]
            };
        }
        return {
            type: 'MultiPoint',
            coordinates: previous.coordinates.concat([feature.geometry.coordinates]) // TODO missing a wrapper [ ] ?
        };
    }, {
        type: 'Empty'
    });
};


const createNewFeature = (action) => {
    return {
        type: "FeatureCollection",
        properties: assign({}, action.properties, action.fields, {id: action.id}, {visibility: true}),
        features: action.geometry,
        style: assign({}, action.style, {highlight: false})
    };
};


export default {
    addAnnotationsLayerEpic: (action$, store) => action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() => {
            const annotationsLayer = annotationsLayerSelector(store.getState());
            if (annotationsLayer) {
                const {visibility = false, features: annotationFeatures = []} = annotationsLayer;
                // parsing old style structure
                let features = annotationFeatures.map(ftColl => {
                    return {...ftColl, style: {}, features: (ftColl.features || []).map(ft => {
                        let styleType = ft.properties.isCircle && "Circle" || ft.properties.isText && "Text" || ft.geometry.type;
                        let extraStyles = [];
                        if (styleType === "Circle") {
                            // Default style object for circle's center style
                            extraStyles.push({...DEFAULT_ANNOTATIONS_STYLES.Point, iconAnchor: [0.5, 0.5], type: "Point", title: "Center Style", filtering: false, geometry: "centerPoint"});
                        }
                        if (styleType === "LineString") {
                            // Default style object for linestring's start and end point
                            extraStyles.push(getStartEndPointsForLinestring());
                        }
                        // Update style object of the annotation
                        return {...ft,
                            style: isArray(ft.style) ? ft.style.map(ftStyle => {
                                const {symbolUrlCustomized, ...filteredStyle} = ftStyle;
                                return filteredStyle;
                            }) : [{...ftColl.style[styleType], id: ftColl.style[styleType].id || uuidv1(), symbolUrlCustomized: undefined}].concat(extraStyles)}; // Update feature with old style structure
                    })};
                });

                return Rx.Observable.of(updateNode(ANNOTATIONS, 'layer', {
                    features,
                    style: {},
                    visibility
                }));
            }
            return Rx.Observable.empty();
        }),
    editAnnotationEpic: (action$, store) => action$.ofType(EDIT_ANNOTATION)
        .switchMap(() => {
            const state = store.getState();
            const feature = state.annotations.editing;
            const type = state.annotations.featureType;
            const multiGeom = multiGeometrySelector(state);
            const drawOptions = {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeom,
                editEnabled: false,
                selectEnabled: true,
                drawEnabled: false,
                transformToFeatureCollection: true,
                geodesic: getGeodesicProperty(state, type)
            };
            const isMeasureType = feature.properties?.type === MEASURE_TYPE || false;
            let actions = [
                toggleVisibilityAnnotation(feature?.properties?.id, false),
                changeDrawingStatus("drawOrEdit", type, ANNOTATIONS, [feature], drawOptions, assign({}, feature.style, {
                    highlight: false
                })),
                hideMapinfoMarker()
            ];
            actions = isMeasureType ? actions.concat(changeMeasurement({geomType: null})) : actions;
            // parsing styles searching for missing symbols, therefore updating it with a missing symbol
            return Rx.Observable.from(actions);
        }),
    newAnnotationEpic: (action$) => action$.ofType(NEW_ANNOTATION)
        .switchMap(() => {
            return Rx.Observable.from([
                hideMapinfoMarker()
            ]);
        }),
    addAnnotationEpic: (action$, store) => action$.ofType(ADD_NEW_FEATURE)
        .switchMap(() => {
            const state = store.getState();
            const feature = state.annotations.editing;
            return Rx.Observable.from([
                toggleVisibilityAnnotation(feature?.properties?.id, false),
                getSelectDrawStatus(store.getState()),
                hideMapinfoMarker()
            ]);
        }),
    setEditingFeatureEpic: (action$, store) => action$.ofType(SET_EDITING_FEATURE)
        .switchMap((action) => {
            const {properties, visibility} = action.feature || {};
            return Rx.Observable.of(
                toggleVisibilityAnnotation(properties.id, visibility),
                getSelectDrawStatus(store.getState()),
                hideMapinfoMarker()
            );
        }),
    disableInteractionsEpic: (action$, store) => action$.ofType(TOGGLE_STYLE)
        .switchMap(() => {
            const isStylingActive = store.getState() && store.getState().annotations && store.getState().annotations.styling;
            return Rx.Observable.from([
                isStylingActive ? getReadOnlyDrawStatus(store.getState()) : getEditingGeomDrawStatus(store.getState())
            ]);
        }),
    removeAnnotationEpic: (action$, store) => action$.ofType(CONFIRM_REMOVE_ANNOTATION)
        .switchMap((action) => {
            if (action.attribute === 'geometry') {
                let state = store.getState();
                let { editing: feature } = modifySelectedInEdited(state.annotations.selected, state.annotations.editing);
                const type = state.annotations.featureType;
                const multiGeom = multiGeometrySelector(state);
                const drawOptions = {
                    featureProjection: "EPSG:4326",
                    stopAfterDrawing: !multiGeom,
                    editEnabled: true,
                    drawEnabled: false,
                    selectEnabled: true,
                    editFilter: (f) => f.getProperties().canEdit,
                    useSelectedStyle: true,
                    transformToFeatureCollection: true,
                    addClickCallback: true,
                    geodesic: getGeodesicProperty(state, type)
                };

                return Rx.Observable.from([
                    changeDrawingStatus("replace", type, ANNOTATIONS, [feature], {}),
                    changeDrawingStatus("drawOrEdit", type, ANNOTATIONS, [feature], drawOptions, assign({}, feature.style, {highlight: false}))
                ]);
            }
            const newFeatures = annotationsLayerSelector(store.getState()).features.filter(f => f.properties.id !== action.id);
            return Rx.Observable.from([
                updateNode(ANNOTATIONS, 'layer', {
                    features: newFeatures
                }),
                hideMapinfoMarker(),
                // TODO: not sure if necessary to purge also results. closeIdentify may purge automatically if annotations are disabled
                purgeMapInfoResults(),
                closeIdentify()
            ].concat(newFeatures.length === 0 ? [removeLayer(ANNOTATIONS)] : []));
        }),
    openEditorEpic: action$ => action$.ofType(OPEN_EDITOR)
        .switchMap((action) => {
            return Rx.Observable.from([
                closeIdentify(),
                setControlProperty(ANNOTATIONS, "enabled", true),
                showAnnotation(action.id),
                editAnnotation(action.id)
            ]);
        }),
    saveAnnotationEpic: (action$, store) => action$.ofType(SAVE_ANNOTATION)
        .switchMap((action) => {
            const annotationsLayer = head(store.getState().layers.flat.filter(l => l.id === ANNOTATIONS));
            const featureCollection = action.geometry;
            return Rx.Observable.from((annotationsLayer ? [updateNode(ANNOTATIONS, 'layer', {
                features: annotationsLayerSelector(store.getState()).features.map(f => assign({}, f, {
                    properties: f.properties.id === action.id ? assign({}, f.properties, action.properties, action.fields) : f.properties,
                    features: f.properties.id === action.id ? featureCollection : f.features,
                    style: f.properties.id === action.id ? action.style : f.style
                })).concat(action.newFeature ? [createNewFeature(action)] : []),
                visibility: !isUndefined(action?.properties?.visibility) ? action.properties.visibility : false
            })] : [
                addLayer({
                    type: 'vector',
                    visibility: true,
                    id: ANNOTATIONS,
                    name: "Annotations",
                    hideLoading: true,
                    style: action.style,
                    features: [createNewFeature(action)],
                    handleClickOnLayer: true
                })
            ]).concat([
                changeDrawingStatus("clean", store.getState().annotations.featureType || '', ANNOTATIONS, [], {}),
                ...(action.newFeature ? [toggleVisibilityAnnotation(action.id, true)] : [])
            ]));
        }),
    cancelEditAnnotationEpic: (action$, store) => action$.ofType(CANCEL_EDIT_ANNOTATION)
        .switchMap((action) => {
            const {id, visibility} = action?.properties || {};
            return Rx.Observable.from([
                changeDrawingStatus("clean", store.getState().annotations.featureType || '', ANNOTATIONS, [], {}),
                toggleVisibilityAnnotation(id, visibility)
            ]);
        }),
    purgeMapInfoEpic: (action$, store) => action$.ofType( PURGE_MAPINFO_RESULTS)
        .switchMap(() => {
            return Rx.Observable.from([
                changeDrawingStatus("clean", store.getState().annotations.featureType || '', ANNOTATIONS, [], {})
            ]);
        }),
    startDrawingMultiGeomEpic: (action$, store) => action$.ofType(START_DRAWING)
        .filter(() => store.getState().annotations.editing.features && !!store.getState().annotations.editing.features.length || store.getState().annotations.featureType === "Circle")
        .switchMap( () => {
            const state = store.getState();
            const feature = state.annotations.editing;
            const type = state.annotations.featureType;
            const defaultTextAnnotation = state.annotations.defaultTextAnnotation;
            const drawOptions = {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometrySelector,
                editEnabled: type !== "Circle",
                translateEnabled: false,
                drawEnabled: type === "Circle",
                useSelectedStyle: true,
                editFilter: (f) => f.getProperties().canEdit,
                defaultTextAnnotation,
                transformToFeatureCollection: true,
                addClickCallback: true,
                geodesic: getGeodesicProperty(state, type)
            };
            return Rx.Observable.of(changeDrawingStatus("drawOrEdit", type, ANNOTATIONS, [feature], drawOptions, assign({}, feature.style, {highlight: false})));
        }),
    endDrawGeomEpic: (action$, store) => action$.ofType(GEOMETRY_CHANGED)
        .filter(action => action.owner === ANNOTATIONS)
        .switchMap( (action) => {
            return Rx.Observable.from([
                updateAnnotationGeometry(mergeGeometry(action.features), action.textChanged, action.circleChanged)
            ].concat(!multiGeometrySelector(store.getState()) && store.getState().annotations.drawing ? [toggleAdd()] : []));
        }),
    setAnnotationStyleEpic: (action$, store) => action$.ofType(SET_STYLE)
        .switchMap( () => {
            // TODO verify if we need to override the style here or in the store
            let feature = validateFeatureCollection(store.getState().annotations.editing);
            const features = feature.features;
            const selected = store.getState().annotations.selected;
            let ftChanged = find(features, f => f.properties.id === selected.properties.id); // can use also selected.style

            let projectedFeature = reprojectGeoJson(ftChanged, "EPSG:4326", "EPSG:3857");
            return Rx.Observable.from([
                changeDrawingStatus("updateStyle", store.getState().annotations.featureType, ANNOTATIONS, [projectedFeature], {}, assign({}, selected.style, {highlight: false}))
            ]
            );
        }),
    restoreStyleEpic: (action$, store) => action$.ofType(RESTORE_STYLE)
        .switchMap( () => {
            const {styling, editing} = store.getState().annotations;
            const {style, ...feature} = editing;
            return Rx.Observable.from([
                changeDrawingStatus("replace", store.getState().annotations.featureType, ANNOTATIONS, [feature], {}, style),
                setStyle(store.getState().annotations.originalStyle),
                getSelectDrawStatus(store.getState()),
                toggleStyle(!styling)
            ]
            );
        }),
    highlightAnnotationEpic: (action$, store) => action$.ofType(HIGHLIGHT)
        .switchMap((action) => {
            return Rx.Observable.of(
                updateNode(ANNOTATIONS, 'layer', {
                    features: annotationsLayerSelector(store.getState()).features.map(f => f.properties.id === action.id ? assign({}, f, {
                        features: f.features && f.features.length && f.features.map(highlightedFt => assign({}, highlightedFt, {
                            style: castArray(highlightedFt.style).map(s => assign({}, s, {
                                highlight: true
                            }))
                        })) || []
                    }) : f)
                })
            );
        }),
    showHideAnnotationEpic: (action$, store) => action$.ofType(TOGGLE_ANNOTATION_VISIBILITY, CHANGE_LAYER_PROPERTIES)
        .filter(action=>
            (action.type === CHANGE_LAYER_PROPERTIES && action.layer === ANNOTATIONS && !isUndefined(action.newProperties.visibility))
            || (action.type === TOGGLE_ANNOTATION_VISIBILITY))
        .switchMap((action) => {
            const feature = (f, visibility = false) => assign({}, f, {
                properties: {...f.properties, visibility}
            });
            const state = store.getState();
            let isLayerPropertyChange = action.layer === ANNOTATIONS;
            const annotationLayers = annotationsLayerSelector(state);
            const isAnnotationEditing =  !isEmpty(editingSelector(state));

            // Update visibility of annotations from TOC or annotation panel
            if (!isEmpty(annotationLayers)) {
                // Update any missing visibility properties of the annotation (Happens with old annotation)
                let features = (annotationLayers.features || []).map(ft=> ({...ft, properties: {...ft.properties, visibility: isUndefined(ft.properties.visibility) ? true : ft.properties.visibility}}));
                features = features.map(f => isLayerPropertyChange ? feature(f, action?.newProperties?.visibility)
                    : (f.properties.id === action.id)
                        ? feature(f, !isUndefined(action.visibility) ? action.visibility : !f.properties.visibility) : f);
                const layerVisibility = !!features?.filter(f => f.properties.visibility)?.length;
                return Rx.Observable.of(updateNode(ANNOTATIONS, 'layer', {features,
                    // Update visibility of the layer when not in edit mode
                    ...(!isAnnotationEditing && {visibility: layerVisibility})
                }));
            }
            return Rx.Observable.empty();
        }),
    hideAnnotationGroupEpic: (action$, store) => action$.ofType(CHANGE_GROUP_PROPERTIES)
        .filter(action=> {
            const groupUpdated = head((groupsSelector(store.getState()) || []).filter(group => group.id === action.group));
            return findIndex(groupUpdated.nodes, node => node.id === ANNOTATIONS) !== -1 && !isUndefined(action.newProperties.visibility);
        }).switchMap(action=> {
            const state = store.getState();
            const annotationLayers = annotationsLayerSelector(state);
            if (!isEmpty(annotationLayers) && !isEmpty(annotationLayers.features)) {
                const features = annotationLayers.features.map(ft=> ({...ft, properties: {...ft.properties, visibility: action.newProperties.visibility}}));
                return Rx.Observable.of(updateNode(ANNOTATIONS, 'layer', {features}));
            }
            return Rx.Observable.empty();
        }),
    cleanHighlightAnnotationEpic: (action$, store) => action$.ofType(CLEAN_HIGHLIGHT)
        .switchMap(() => {
            const annotationsLayer = annotationsLayerSelector(store.getState());
            if (annotationsLayer && annotationsLayer.features && annotationsLayer.features.length) {
                return Rx.Observable.of(
                    updateNode(ANNOTATIONS, 'layer', {
                        features: annotationsLayer.features.map(f => assign({}, f, {
                            features: f.features && f.features.length && f.features.map(highlightedFt => assign({}, highlightedFt, {
                                style: castArray(highlightedFt.style).map(s => assign({}, s, {
                                    highlight: false
                                }))
                            })) || []
                        }))
                    })
                );
            }
            return Rx.Observable.empty();
        }),
    /**
        this epic closes the measure tool becasue can conflict with the draw interaction in others
        */
    closeMeasureToolEpic: (action$, store) => action$.ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === ANNOTATIONS && store.getState().controls.annotations.enabled)
        .switchMap(() => {
            const state = store.getState();
            let actions = [];
            if (queryPanelSelector(state)) { // if query panel is open, close it
                actions.push(setControlProperty('queryPanel', "enabled", false));
            }
            if (isFeatureGridOpen(state)) { // if FeatureGrid is open, close it
                actions.push(closeFeatureGrid());
            }
            if (isActiveSelector(state)) { // if measure is open, close it
                actions.push(setControlProperty('measure', "enabled", false));
            }
            return actions.length ? Rx.Observable.from(actions) : Rx.Observable.empty();
        }),
    closeAnnotationsEpic: (action$, store) => action$.ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === ANNOTATIONS && !store.getState().controls.annotations.enabled)
        .switchMap(() => {
            return Rx.Observable.from([
                cleanHighlight(),
                changeDrawingStatus("clean", store.getState().annotations?.featureType || '', ANNOTATIONS, [], {})
            ]);
        }),
    confirmCloseAnnotationsEpic: (action$, store) => action$.ofType(CONFIRM_CLOSE_ANNOTATIONS)
        .switchMap((action) => {
            const {id, visibility} = action?.properties || {};
            return Rx.Observable.from((
                store.getState().controls.annotations && store.getState().controls.annotations.enabled ?
                    [toggleControl(ANNOTATIONS), toggleVisibilityAnnotation(id, visibility)] : [])
                .concat([purgeMapInfoResults()]));
        }),
    downloadAnnotations: (action$, {getState}) => action$.ofType(DOWNLOAD)
        .switchMap(({annotation}) => {
            try {
                const annotations = annotation && [annotation] || (annotationsLayerSelector(getState())).features;
                const mapName = mapNameSelector(getState());
                saveAs(new Blob([JSON.stringify({features: annotations, type: ANNOTATION_TYPE})], {type: "application/json;charset=utf-8"}), `${ mapName.length > 0 && mapName || "Annotations"}.json`);
                return Rx.Observable.empty();
            } catch (e) {
                return Rx.Observable.of(error({
                    title: "annotations.title",
                    message: "annotations.downloadError",
                    autoDismiss: 5,
                    position: "tr"
                }));
            }
        }),
    onLoadAnnotations: (action$, {getState}) => action$.ofType(LOAD_ANNOTATIONS)
        .switchMap(({features, override}) => {
            const annotationsLayer = annotationsLayerSelector(getState());
            const {messages = {}} = (getState()).locale || {};
            const oldFeature = annotationsLayer && annotationsLayer.features || [];
            const normFeatures = features.map((a) => normalizeAnnotation(a, messages));
            const newFeatures = override ? normFeatures : oldFeature.concat(normFeatures);
            const action = annotationsLayer ? updateNode(ANNOTATIONS, 'layer', {
                features: removeDuplicate(newFeatures)}) : addLayer({
                type: 'vector',
                visibility: true,
                id: ANNOTATIONS,
                name: "Annotations",
                hideLoading: true,
                features: newFeatures,
                handleClickOnLayer: true
            });
            return Rx.Observable.of(action);
        }),
    onChangedSelectedFeatureEpic: (action$, {getState}) => action$.ofType(CHANGED_SELECTED )
        .switchMap(({}) => {
            const state = getState();
            let { selected, editing: feature } = modifySelectedInEdited(state.annotations.selected, state.annotations.editing);

            let method = selected.geometry.type;
            if (selected.properties?.isCircle) method = "Circle";
            if (selected.properties?.isText) method = "Text";

            const multiGeometry = multiGeometrySelector(state);
            const style = feature.style;
            const action = changeDrawingStatus("drawOrEdit", method, ANNOTATIONS, [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                useSelectedStyle: true,
                drawEnabled: false,
                transformToFeatureCollection: true,
                addClickCallback: true,
                geodesic: getGeodesicProperty(state, method)
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        }),
    onBackToEditingFeatureEpic: (action$, {getState}) => action$.ofType( RESET_COORD_EDITOR, CONFIRM_DELETE_FEATURE, UNSELECT_FEATURE )
        .switchMap(({}) => {
            const state = getState();
            const feature = state.annotations.editing;
            const multiGeometry = multiGeometrySelector(state);
            const style = feature.style;

            const action = changeDrawingStatus("drawOrEdit", "", ANNOTATIONS, [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: false,
                drawEnabled: false,
                selectEnabled: true,
                transformToFeatureCollection: true
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        }),
    redrawOnChangeTextEpic: (action$, {getState}) => action$.ofType( CHANGE_TEXT )
        .switchMap(() => {
            const state = getState();
            let feature = state.annotations.editing;
            let selected = state.annotations.selected;
            const multiGeometry = multiGeometrySelector(state);
            const style = feature.style;

            selected = set("geometry.coordinates", [selected.geometry.coordinates].filter(validateCoordsArray)[0] || [], selected);
            selected = set("geometry.type", "Point", selected);
            let selectedIndex = findIndex(feature.features, (f) => f.properties.id === selected.properties.id);
            if (validateCoordsArray(selected.geometry.coordinates) ) {
                // if it has at least the coords valid draw the small circle for the text,
                // text will be drawn if present
                if (selectedIndex === -1) {
                    feature = set(`features`, feature.features.concat([selected]), feature);
                } else {
                    feature = set(`features[${selectedIndex}]`, selected, feature);
                }
            } else {
                // if coords ar not valid do not draw anything
                selected = set("geometry", null, selected);
                if (selectedIndex !== -1) {
                    feature = set(`features[${selectedIndex}]`, selected, feature);
                } else {
                    feature = set(`features`, feature.features.concat([selected]), feature);
                }
            }
            const action = changeDrawingStatus("drawOrEdit", "Text", ANNOTATIONS, [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                drawEnabled: false,
                useSelectedStyle: true,
                transformToFeatureCollection: true,
                addClickCallback: true
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        }),
    redrawOnChangeRadiusEpic: (action$, {getState}) => action$.ofType( CHANGE_RADIUS )
        .switchMap(() => {
            const state = getState();
            let feature = state.annotations.editing;
            let selected = state.annotations.selected;
            const multiGeometry = multiGeometrySelector(state);
            const style = feature.style;

            // selected = set("geometry.coordinates", [selected.geometry.coordinates].filter(validateCoordsArray)[0] || [], selected);
            // selected = set("geometry.type", "Polygon", selected);
            let selectedIndex = findIndex(feature.features, (f) => f.properties.id === selected.properties.id);
            if (!selected.properties.isValidFeature) {
                selected = set("geometry", {
                    type: "Polygon",
                    coordinates: [[]]
                }, selected);
            } else {
                selected = set("geometry", selected.properties.polygonGeom, selected);
            }
            if (selectedIndex === -1) {
                feature = set(`features`, feature.features.concat([selected]), feature);
            } else {
                feature = set(`features[${selectedIndex}]`, selected, feature);
            }
            // this should run only if the feature has a valid geom
            const action = changeDrawingStatus("drawOrEdit", "Circle", ANNOTATIONS, [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                drawEnabled: false,
                useSelectedStyle: true,
                transformToFeatureCollection: true,
                addClickCallback: true,
                geodesic: getGeodesicProperty(state)
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        }),
    editSelectedFeatureEpic: (action$, {getState}) => action$.ofType(FEATURES_SELECTED)
        .switchMap(() => {
            const state = getState();
            const feature = state.annotations.editing;
            const selected = state.annotations.selected;
            const multiGeometry = multiGeometrySelector(state);
            const style = feature.style;
            let method = selected.geometry.type;
            if (selected.properties.isCircle) {
                method = "Circle";
            }
            if (selected.properties.isText) {
                method = "Text";
            }
            const action = changeDrawingStatus("drawOrEdit", method, ANNOTATIONS, [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                drawEnabled: false,
                useSelectedStyle: true,
                transformToFeatureCollection: true,
                addClickCallback: true,
                geodesic: getGeodesicProperty(state, method)
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of( changeDrawingStatus("clean"), action);
        }),
    highlightGeometryEpic: (action$, {getState}) => action$.ofType(GEOMETRY_HIGHLIGHT)
        .switchMap(({id = '', state: highlight = true}) => {
            const state = getState();
            const {editing, featureType: type} = state.annotations;
            const ftChangedIndex = findIndex(editing.features, (f) => f.properties.id === id);
            const selectedGeoJSON = editing.features[ftChangedIndex];
            const styleChanged = castArray(selectedGeoJSON.style).map(s => ({...s, highlight}));
            const action = changeDrawingStatus("updateStyle", type, ANNOTATIONS, [
                set(`features[${ftChangedIndex}]`, set("style", styleChanged, selectedGeoJSON), editing)], {transformToFeatureCollection: true}, assign({}, editing.style, {highlight: false}));
            return Rx.Observable.of( changeDrawingStatus("clean"), action);
        }),
    editCircleFeatureEpic: (action$, {getState}) => action$.ofType(DRAWING_FEATURE)
        .filter(a => a.features[0].properties && a.features[0].properties.isCircle)
        .delay(300)
        .switchMap(() => {
            const state = getState();
            const feature = state.annotations.editing;
            const multiGeometry = multiGeometrySelector(state);
            const style = feature.style;

            const action = changeDrawingStatus("drawOrEdit", "Circle", ANNOTATIONS, [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                drawEnabled: false,
                useSelectedStyle: true,
                transformToFeatureCollection: true,
                addClickCallback: true,
                geodesic: getGeodesicProperty(state)
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        }),
    /**
     * Fetches style information from server and sets default styles using specified parameters.
     * Currently handles symbol and marker point type styles.
     */
    loadDefaultAnnotationsStylesEpic: (action$, store) => action$.ofType(LOAD_DEFAULT_STYLES)
        .switchMap(({shape = DEFAULT_SHAPE, size = 64, fillColor = '#000000', strokeColor = '#000000', symbolsPath = DEFAULT_PATH}) => {
            const symbolErrors = symbolErrorsSelector(store.getState()) || [];

            const pointTypesFlows = {
                symbol: () => {
                    const defaultSymbolStyle = {
                        ...STYLE_POINT_SYMBOL,
                        shape,
                        size,
                        fillColor,
                        color: strokeColor,
                        symbolUrl: symbolsPath + shape + ".svg"
                    };
                    return Rx.Observable.defer(() => axios.get(defaultSymbolStyle.symbolUrl)
                        .then(() => createSvgUrl(defaultSymbolStyle, defaultSymbolStyle.symbolUrlCustomized || defaultSymbolStyle.symbolUrl)))
                        .map((symbolUrlCustomized) => setDefaultStyle('POINT.symbol', {...defaultSymbolStyle, symbolUrlCustomized}))
                        .catch(() => {
                            return Rx.Observable.of(
                                setErrorSymbol(symbolErrors.concat(['loading_symbol' + shape])),
                                setDefaultStyle('POINT.symbol', {
                                    ...defaultSymbolStyle,
                                    symbolUrlCustomized: symbolMissing,
                                    symbolUrl: symbolsPath + shape + ".svg",
                                    shape
                                })
                            );
                        });
                },
                marker: () => {
                    return Rx.Observable.of(setDefaultStyle('POINT.marker', STYLE_POINT_MARKER));
                }
            };

            return Rx.Observable.merge(...values(pointTypesFlows).map(flowFunc => flowFunc()))
                .startWith(loading(true))
                .concat(Rx.Observable.of(loading(false)));
        })

};
