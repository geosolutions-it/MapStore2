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

const {error} = require('../actions/notifications');

const {updateAnnotationGeometry, setStyle, toggleStyle, cleanHighlight, toggleAdd, showTextArea,
    CONFIRM_REMOVE_ANNOTATION, SAVE_ANNOTATION, EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION,
    TOGGLE_ADD, SET_STYLE, RESTORE_STYLE, HIGHLIGHT, CLEAN_HIGHLIGHT, CONFIRM_CLOSE_ANNOTATIONS, STOP_DRAWING,
    CANCEL_CLOSE_TEXT, SAVE_TEXT, DOWNLOAD, LOAD_ANNOTATIONS} = require('../actions/annotations');
const {CLICK_ON_MAP} = require('../actions/map');

const {GEOMETRY_CHANGED} = require('../actions/draw');
const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');

const {head} = require('lodash');
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

const mergeGeometry = (features) => {
    return features.reduce((previous, feature) => {
        if (previous.type === 'Empty') {
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
    const drawing = state.annotations.drawing;
    const feature = state.annotations.editing;
    const type = featureType || state.annotations.featureType;
    const multiGeom = state.annotations.config.multiGeometry;
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: !multiGeom,
        editEnabled: !drawing,
        drawEnabled: drawing
    };
    return changeDrawingStatus("drawOrEdit", type, "annotations", [feature], drawOptions, feature.style/* || {[type]: DEFAULT_ANNOTATIONS_STYLES[type]}*/);
};

const createNewFeature = (action) => {
    return {
        type: "Feature",
        properties: assign({}, action.fields, {id: action.id}, action.properties ),
        geometry: action.geometry,
        style: action.style
    };
};

module.exports = (viewer) => ({
    addAnnotationsLayerEpic: (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() => {
            const annotationsLayer = annotationsLayerSelector(store.getState());
            if (annotationsLayer) {
                return Rx.Observable.of(updateNode('annotations', 'layer', {
                    rowViewer: viewer
                }));
            }
            return Rx.Observable.empty();
        }),
    editAnnotationEpic: (action$, store) =>
        action$.ofType(EDIT_ANNOTATION)
        .switchMap(() => {
            return Rx.Observable.from([
                changeLayerProperties('annotations', {visibility: false}),
                toggleDrawOrEdit(store.getState()),
                hideMapinfoMarker()
            ]);
        }),
    removeAnnotationEpic: (action$, store) =>
        action$.ofType(CONFIRM_REMOVE_ANNOTATION)
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
    saveAnnotationEpic: (action$, store) =>
        action$.ofType(SAVE_ANNOTATION)
        .switchMap((action) => {
            const annotationsLayer = head(store.getState().layers.flat.filter(l => l.id === 'annotations'));
            return Rx.Observable.from((annotationsLayer ? [updateNode('annotations', 'layer', {
                features: annotationsLayerSelector(store.getState()).features.map(f => assign({}, f, {
                    properties: f.properties.id === action.id ? assign({}, f.properties, action.properties, action.fields) : f.properties,
                        geometry: f.properties.id === action.id ? action.geometry : f.geometry,
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
    cancelEditAnnotationEpic: (action$, store) =>
        action$.ofType(CANCEL_EDIT_ANNOTATION, PURGE_MAPINFO_RESULTS)
        .switchMap(() => {
            return Rx.Observable.from([
                changeDrawingStatus("clean", store.getState().annotations.featureType || '', "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]);
        }),
    startDrawMarkerEpic: (action$, store) => action$.ofType(TOGGLE_ADD)
        .switchMap( (a) => {
            return Rx.Observable.of(toggleDrawOrEdit(store.getState(), a.featureType));
        }),
    stopDrawingMultiGeomEpic: (action$, store) => action$.ofType(STOP_DRAWING)
        .filter(() => !!store.getState().annotations.editing.geometry)
        .switchMap( () => {
            return Rx.Observable.of(toggleDrawOrEdit(store.getState()));
        }),
    addTextEpic: (action$, store) => action$.ofType(CLICK_ON_MAP)
        .filter(() => store.getState().annotations && store.getState().annotations.drawingText && store.getState().annotations.drawingText.drawing)
        .switchMap( () => {
            return Rx.Observable.of(showTextArea());
        }),
    endDrawGeomEpic: (action$, store) => action$.ofType(GEOMETRY_CHANGED)
        .filter(action => action.owner === 'annotations')
        .switchMap( (action) => {
            return Rx.Observable.from([
                updateAnnotationGeometry(mergeGeometry(action.features), action.textChanged)
            ].concat(!store.getState().annotations.config.multiGeometry && store.getState().annotations.drawing ? [toggleAdd()] : []));
        }),
    endDrawTextEpic: (action$, store) => action$.ofType(SAVE_TEXT)
        .switchMap( () => {
            const feature = store.getState().annotations.editing;
            const style = feature.style;
            return Rx.Observable.from([
                changeDrawingStatus("replace", store.getState().annotations.featureType, "annotations", [feature], {featureProjection: "EPSG:4326"}, assign({}, style, {highlight: false}))
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
            return Rx.Observable.from([
                changeDrawingStatus("replace", store.getState().annotations.featureType, "annotations", [feature], {}, assign({}, style, {highlight: false})),
                toggleDrawOrEdit(store.getState())
            ]
            );
        }),
    restoreStyleEpic: (action$, store) => action$.ofType(RESTORE_STYLE)
        .switchMap( () => {
            const {style, ...feature} = store.getState().annotations.editing;
            return Rx.Observable.from([
                changeDrawingStatus("replace", store.getState().annotations.featureType, "annotations", [feature], {}, style),
                toggleDrawOrEdit(store.getState()),
                setStyle(store.getState().annotations.originalStyle),
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
        return Rx.Observable.from((store.getState().controls.annotations && store.getState().controls.annotations.enabled ? [toggleControl('annotations')] : []).concat([purgeMapInfoResults()]));
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
        })

});

// .filter(f => f.type === "Feature" && !isEmpty(f.geometry) && !isEmpty(f.properties) && !isEmpty(f.style))
