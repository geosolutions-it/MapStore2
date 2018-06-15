/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {saveAs} = require('file-saver');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {TOGGLE_CONTROL, toggleControl} = require('../actions/controls');
const {addLayer, updateNode, changeLayerProperties, removeLayer} = require('../actions/layers');
const {hideMapinfoMarker, purgeMapInfoResults} = require('../actions/mapInfo');
const {set} = require('../utils/ImmutableUtils');
const {validateCoordsArray} = require('../utils/AnnotationsUtils');
const {reprojectGeoJson} = require('../utils/CoordinatesUtils');
const {error} = require('../actions/notifications');

const {updateAnnotationGeometry, setStyle, toggleStyle, cleanHighlight, toggleAdd,
    CONFIRM_REMOVE_ANNOTATION, SAVE_ANNOTATION, EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION,
    SET_STYLE, RESTORE_STYLE, HIGHLIGHT, CLEAN_HIGHLIGHT, CONFIRM_CLOSE_ANNOTATIONS, START_DRAWING,
    CANCEL_CLOSE_TEXT, SAVE_TEXT, DOWNLOAD, LOAD_ANNOTATIONS, CHANGED_SELECTED, RESET_COORD_EDITOR, CHANGE_RADIUS,
    ADD_NEW_FEATURE, CHANGE_TEXT, NEW_ANNOTATION, TOGGLE_STYLE, CONFIRM_DELETE_FEATURE} = require('../actions/annotations');

const {FEATURES_SELECTED, GEOMETRY_CHANGED, DRAWING_FEATURE} = require('../actions/draw');
const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');

const {head, findIndex} = require('lodash');
const assign = require('object-assign');

const {annotationsLayerSelector} = require('../selectors/annotations');

const {normalizeAnnotation, removeDuplicate} = require('../utils/AnnotationsUtils');

const { mapNameSelector} = require('../selectors/map');

const {changeDrawingStatus} = require('../actions/draw');

   /**
    * Epics for annotations
    * @name epics.annotations
    * @type {Object}
    */

const getSelectDrawStatus = (state) => {
    const feature = state.annotations.editing;
    const multiGeom = state.annotations.config.multiGeometry;
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: !multiGeom,
        editEnabled: false,
        selectEnabled: true,
        drawEnabled: false,
        transformToFeatureCollection: true
    };
    return changeDrawingStatus("drawOrEdit", feature.type, "annotations", [feature], drawOptions, feature.style);
};
const getReadOnlyDrawStatus = (state) => {
    const feature = state.annotations.editing;
    const multiGeom = state.annotations.config.multiGeometry;
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: !multiGeom,
        editEnabled: false,
        selectEnabled: false,
        drawEnabled: false,
        transformToFeatureCollection: true
    };
    return changeDrawingStatus("drawOrEdit", feature.type, "annotations", [feature], drawOptions, feature.style);
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

const toggleDrawOrEdit = (state, featureType) => {
    const feature = state.annotations.editing;
    const drawing = state.annotations.drawing;
    const type = featureType || state.annotations.featureType;
    const multiGeom = state.annotations.config.multiGeometry;
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: !multiGeom,
        editEnabled: type !== "Circle",
        drawing,
        drawEnabled: type === "Circle",
        transformToFeatureCollection: true
    };
    return changeDrawingStatus("drawOrEdit", type, "annotations", [feature], drawOptions, assign({}, feature.style, {highlight: false})/* || {[type]: DEFAULT_ANNOTATIONS_STYLES[type]}*/);
};

const createNewFeature = (action) => {
    return {
        type: "FeatureCollection",
        properties: assign({}, action.fields, {id: action.id}, action.properties ),
        features: action.geometry,
        style: action.style
    };
};

module.exports = (viewer) => ({
    addAnnotationsLayerEpic: (action$, store) => action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() => {
            const annotationsLayer = annotationsLayerSelector(store.getState());
            if (annotationsLayer) {
                return Rx.Observable.of(updateNode('annotations', 'layer', {
                    rowViewer: viewer
                }));
            }
            return Rx.Observable.empty();
        }),
    editAnnotationEpic: (action$, store) => action$.ofType(EDIT_ANNOTATION)
        .switchMap(() => {
            const state = store.getState();
            const feature = state.annotations.editing;
            const type = state.annotations.featureType;
            const multiGeom = state.annotations.config.multiGeometry;
            const drawOptions = {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeom,
                editEnabled: false,
                selectEnabled: true,
                drawEnabled: false,
                transformToFeatureCollection: true
            };
            return Rx.Observable.from([
                changeLayerProperties('annotations', {visibility: false}),
                changeDrawingStatus("drawOrEdit", type, "annotations", [feature], drawOptions, feature.style),
                hideMapinfoMarker()
            ]);
        }),
    newAnnotationEpic: (action$) => action$.ofType(NEW_ANNOTATION)
        .switchMap(() => {
            return Rx.Observable.from([
                changeLayerProperties('annotations', {visibility: false}),
                hideMapinfoMarker()
            ]);
        }),
    addAnnotationEpic: (action$, store) => action$.ofType(ADD_NEW_FEATURE)
        .switchMap(() => {
            return Rx.Observable.from([
                changeLayerProperties('annotations', {visibility: false}),
                getSelectDrawStatus(store.getState()),
                hideMapinfoMarker()
            ]);
        }),
    disableInteractionsEpic: (action$, store) => action$.ofType(TOGGLE_STYLE)
        .switchMap(() => {
            const isStylingActive = store.getState() && store.getState().annotations && store.getState().annotations.styling;
            return Rx.Observable.from([
                isStylingActive ? getReadOnlyDrawStatus(store.getState()) : getSelectDrawStatus(store.getState())
            ]);
        }),
    removeAnnotationEpic: (action$, store) => action$.ofType(CONFIRM_REMOVE_ANNOTATION)
        .switchMap((action) => {
            if (action.id === 'geometry') {
                return Rx.Observable.from([
                    changeDrawingStatus("replace", store.getState().annotations.featureType, "annotations", [store.getState().annotations.editing], {}),
                    toggleDrawOrEdit(store.getState())
            ]);
            }
            const newFeatures = annotationsLayerSelector(store.getState()).features.filter(f => f.properties.id !== action.id);
            return Rx.Observable.from([
                updateNode('annotations', 'layer', {
                    features: newFeatures
                }),
                hideMapinfoMarker(),
                purgeMapInfoResults()
            ].concat(newFeatures.length === 0 ? [removeLayer('annotations')] : []));
        }),
    saveAnnotationEpic: (action$, store) => action$.ofType(SAVE_ANNOTATION)
        .switchMap((action) => {
            const annotationsLayer = head(store.getState().layers.flat.filter(l => l.id === 'annotations'));
            const featureCollection = action.geometry;
            return Rx.Observable.from((annotationsLayer ? [updateNode('annotations', 'layer', {
                features: annotationsLayerSelector(store.getState()).features.map(f => assign({}, f, {
                    properties: f.properties.id === action.id ? assign({}, f.properties, action.properties, action.fields) : f.properties,
                    features: f.properties.id === action.id ? featureCollection : f.features,
                    style: f.properties.id === action.id ? action.style : f.style
                })).concat(action.newFeature ? [createNewFeature(action)] : [])
            })] : [
                addLayer({
                    type: 'vector',
                    visibility: true,
                    id: 'annotations',
                    name: "Annotations",
                    rowViewer: viewer,
                    hideLoading: true,
                    style: action.style,
                    features: [createNewFeature(action)],
                    handleClickOnLayer: true
                })
            ]).concat([
                changeDrawingStatus("clean", store.getState().annotations.featureType || '', "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]));
        }),
    cancelEditAnnotationEpic: (action$, store) => action$.ofType(CANCEL_EDIT_ANNOTATION, PURGE_MAPINFO_RESULTS)
        .switchMap(() => {
            return Rx.Observable.from([
                changeDrawingStatus("clean", store.getState().annotations.featureType || '', "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]);
        }),
    startDrawingMultiGeomEpic: (action$, store) => action$.ofType(START_DRAWING)
        .filter(() => store.getState().annotations.editing.features && !!store.getState().annotations.editing.features.length || store.getState().annotations.featureType === "Circle")
        .switchMap( () => {
            const state = store.getState();
            const feature = state.annotations.editing;
            const type = state.annotations.featureType;
            const defaultTextAnnotation = state.annotations.defaultTextAnnotation;
            const multiGeom = state.annotations.config.multiGeometry;
            const drawOptions = {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeom,
                editEnabled: type !== "Circle",
                translateEnabled: false,
                drawEnabled: type === "Circle",
                useSelectedStyle: true,
                editFilter: (f) => f.getProperties().canEdit,
                defaultTextAnnotation,
                transformToFeatureCollection: true
            };
            return Rx.Observable.of(changeDrawingStatus("drawOrEdit", type, "annotations", [feature], drawOptions, assign({}, feature.style, {highlight: false})));
        }),
    endDrawGeomEpic: (action$, store) => action$.ofType(GEOMETRY_CHANGED)
        .filter(action => action.owner === 'annotations')
        .switchMap( (action) => {
            return Rx.Observable.from([
                updateAnnotationGeometry(mergeGeometry(action.features), action.textChanged, action.circleChanged)
            ].concat(!store.getState().annotations.config.multiGeometry && store.getState().annotations.drawing ? [toggleAdd()] : []));
        }),
    endDrawTextEpic: (action$, store) => action$.ofType(SAVE_TEXT)
        .switchMap( () => {
            const feature = store.getState().annotations.selected;
            // let reprojected = reprojectGeoJson(feature, "EPSG:4326", "EPSG:3857");
            const style = store.getState().annotations.editing.style;
            return Rx.Observable.from([
                changeDrawingStatus("replace", store.getState().annotations.featureType, "annotations", [feature], {featureProjection: "EPSG:3857",
                transformToFeatureCollection: true}, assign({}, style, {highlight: false}))
            ].concat(!store.getState().annotations.config.multiGeometry ? [toggleAdd()] : []));
        }),
    cancelTextAnnotationsEpic: (action$, store) => action$.ofType(CANCEL_CLOSE_TEXT)
        .switchMap( () => {
            const state = store.getState();
            const feature = state.annotations.editing;
            const multiGeometry = state.annotations.config.multiGeometry;
            const style = feature.style;
            return Rx.Observable.from([
                changeDrawingStatus("drawOrEdit", "Text", "annotations", [feature], {
                    featureProjection: "EPSG:4326",
                    stopAfterDrawing: !multiGeometry,
                    editEnabled: false,
                    drawEnabled: true
                }, assign({}, style, {highlight: false}))
            ]);
        }),
    setStyleEpic: (action$, store) => action$.ofType(SET_STYLE)
        .switchMap( () => {
            const {style, ...feature} = store.getState().annotations.editing;
            let projectedFeature = reprojectGeoJson(feature, "EPSG:4326", "EPSG:3857");
            return Rx.Observable.from([
                changeDrawingStatus("replace", store.getState().annotations.featureType, "annotations", [projectedFeature], {}, assign({}, style, {highlight: false}))
            ]
            );
        }),
    restoreStyleEpic: (action$, store) => action$.ofType(RESTORE_STYLE)
        .switchMap( () => {
            const {style, ...feature} = store.getState().annotations.editing;
            return Rx.Observable.from([
                changeDrawingStatus("replace", store.getState().annotations.featureType, "annotations", [feature], {}, style),
                setStyle(store.getState().annotations.originalStyle),
                getSelectDrawStatus(store.getState()),
                toggleStyle()
            ]
            );
        }),
    highlighAnnotationEpic: (action$, store) => action$.ofType(HIGHLIGHT)
        .switchMap((action) => {
            return Rx.Observable.of(
                updateNode('annotations', 'layer', {
                    features: annotationsLayerSelector(store.getState()).features.map(f => f.properties.id === action.id ? assign({}, f, {
                        style: assign({}, f.style, {
                            highlight: true
                        })
                    }) : f)
                })
            );
        }),
    cleanHighlightAnnotationEpic: (action$, store) => action$.ofType(CLEAN_HIGHLIGHT)
        .switchMap(() => {
            const annotationsLayer = annotationsLayerSelector(store.getState());
            if (annotationsLayer && annotationsLayer.features) {
                return Rx.Observable.of(
                    updateNode('annotations', 'layer', {
                        features: annotationsLayer.features.map(f =>
                        assign({}, f, {
                            style: assign({}, f.style, {
                                highlight: false
                            })
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
        .filter((action) => action.control === 'annotations' && store.getState().controls.annotations.enabled)
        .switchMap(() => {
            const state = store.getState();
            return state.controls.measure && state.controls.measure.enabled ? Rx.Observable.from([toggleControl("measure")]) : Rx.Observable.empty();
        }),
    closeAnnotationsEpic: (action$, store) => action$.ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'annotations' && !store.getState().controls.annotations.enabled)
        .switchMap(() => {
            return Rx.Observable.from([
                cleanHighlight(),
                changeDrawingStatus("clean", store.getState().annotations.featureType || '', "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]);
        }),
    confirmCloseAnnotationsEpic: (action$, store) => action$.ofType(CONFIRM_CLOSE_ANNOTATIONS)
        .switchMap(() => {
            return Rx.Observable.from((
                store.getState().controls.annotations && store.getState().controls.annotations.enabled ?
                [toggleControl('annotations')] : [])
                .concat([purgeMapInfoResults()]));
        }),
    downloadAnnotations: (action$, {getState}) => action$.ofType(DOWNLOAD)
        .switchMap(({annotation}) => {
            try {
                const annotations = annotation && [annotation] || (annotationsLayerSelector(getState())).features;
                const mapName = mapNameSelector(getState());
                saveAs(new Blob([JSON.stringify({features: annotations, type: "ms2-annotations"})], {type: "application/json;charset=utf-8"}), `${ mapName.length > 0 && mapName || "Annotations"}.json`);
                return Rx.Observable.empty();
            }catch (e) {
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
            const action = annotationsLayer ? updateNode('annotations', 'layer', {
                features: removeDuplicate(newFeatures)}) : addLayer({
                    type: 'vector',
                    visibility: true,
                    id: 'annotations',
                    name: "Annotations",
                    rowViewer: viewer,
                    hideLoading: true,
                    features: newFeatures,
                    handleClickOnLayer: true
                });
            return Rx.Observable.of(action);
        }),
    onChangedSelectedFeatureEpic: (action$, {getState}) => action$.ofType(CHANGED_SELECTED )
        .switchMap(({}) => {
            const state = getState();
            let feature = state.annotations.editing;
            let selected = state.annotations.selected;
            switch (selected.geometry.type) {
                case "Polygon": {
                    selected = set("geometry.coordinates", [selected.geometry.coordinates[0].filter(validateCoordsArray)], selected);
                    break;
                }
                case "LineString": {
                    selected = set("geometry.coordinates", selected.geometry.coordinates.filter(validateCoordsArray), selected);
                    break;
                }
                // point
                default: {
                    selected = set("geometry.coordinates", [selected.geometry.coordinates].filter(validateCoordsArray)[0], selected);
                }
            }
            if (selected.properties && selected.properties.isCircle) {
                selected = set("geometry", selected.properties.polygonGeom, selected);
            }
            let method = selected.properties.isCircle ? "Circle" : selected.geometry.type;

            // TODO update selected feature in editing features

            let selectedIndex = findIndex(feature.features, (f) => f.properties.id === selected.properties.id);
            feature = set(`features[${selectedIndex}]`, selected, feature);
            const multiGeometry = state.annotations.config.multiGeometry;
            const style = feature.style;
            const action = changeDrawingStatus("drawOrEdit", method, "annotations", [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                useSelectedStyle: true,
                drawEnabled: false,
                transformToFeatureCollection: true
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        }),
    onBackToEditingFeatureEpic: (action$, {getState}) => action$.ofType( RESET_COORD_EDITOR, CONFIRM_DELETE_FEATURE )
        .switchMap(({}) => {
            const state = getState();
            const feature = state.annotations.editing;
            const multiGeometry = state.annotations.config.multiGeometry;
            const style = feature.style;

            const action = changeDrawingStatus("drawOrEdit", "", "annotations", [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: false,
                drawEnabled: false,
                selectEnabled: true,
                transformToFeatureCollection: true
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        }),
    redrawOnChangeRadiusTextEpic: (action$, {getState}) => action$.ofType( CHANGE_RADIUS, CHANGE_TEXT )
        .switchMap((a) => {
            const state = getState();
            const feature = state.annotations.editing;
            const multiGeometry = state.annotations.config.multiGeometry;
            const style = feature.style;

            // this should run only if the feature has a valid geom
            const action = changeDrawingStatus("drawOrEdit", a.type === CHANGE_TEXT ? "Text" : "Circle", "annotations", [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                drawEnabled: false,
                useSelectedStyle: true,
                transformToFeatureCollection: true
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        }),
    editSelectedFeatureEpic: (action$, {getState}) => action$.ofType(FEATURES_SELECTED)
        .switchMap(() => {
            const state = getState();
            const feature = state.annotations.editing;
            const selected = state.annotations.selected;
            const multiGeometry = state.annotations.config.multiGeometry;
            const style = feature.style;
            let method = selected.geometry.type;
            if (selected.properties.isCircle) {
                method = "Circle";
            }
            if (selected.properties.isText) {
                method = "Text";
            }

            const action = changeDrawingStatus("drawOrEdit", method, "annotations", [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                drawEnabled: false,
                useSelectedStyle: true,
                transformToFeatureCollection: true
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of( changeDrawingStatus("clean"), action);
        }),
    editCircleFeatureEpic: (action$, {getState}) => action$.ofType(DRAWING_FEATURE)
        .filter(a => a.features[0].properties && a.features[0].properties.isCircle)
        .delay(300)
        .switchMap(() => {
            const state = getState();
            const feature = state.annotations.editing;
            const multiGeometry = state.annotations.config.multiGeometry;
            const style = feature.style;

            const action = changeDrawingStatus("drawOrEdit", "Circle", "annotations", [feature], {
                featureProjection: "EPSG:4326",
                stopAfterDrawing: !multiGeometry,
                editEnabled: true,
                translateEnabled: false,
                editFilter: (f) => f.getProperties().canEdit,
                drawEnabled: false,
                useSelectedStyle: true,
                transformToFeatureCollection: true
            }, assign({}, style, {highlight: false}));
            return Rx.Observable.of(action);
        })

});
