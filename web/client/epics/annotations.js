/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {TOGGLE_CONTROL, toggleControl} = require('../actions/controls');
const {addLayer, updateNode, changeLayerProperties, removeLayer} = require('../actions/layers');
const {hideMapinfoMarker, purgeMapInfoResults} = require('../actions/mapInfo');

const {updateAnnotationGeometry, setStyle, toggleStyle, cleanHighlight, toggleAdd,
    CONFIRM_REMOVE_ANNOTATION, SAVE_ANNOTATION, EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION,
    TOGGLE_ADD, SET_STYLE, RESTORE_STYLE, HIGHLIGHT, CLEAN_HIGHLIGHT, CONFIRM_CLOSE_ANNOTATIONS} = require('../actions/annotations');

const {GEOMETRY_CHANGED} = require('../actions/draw');
const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');

const {head} = require('lodash');
const assign = require('object-assign');

const {annotationsLayerSelector} = require('../selectors/annotations');

const annotationsStyle = {
    iconGlyph: 'comment',
    iconShape: 'square',
    iconColor: 'blue'
};

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
            coordinates: previous.coordinates.concat([feature.geometry.coordinates])
        };
    }, {
        type: 'Empty'
    });
};

const toggleDrawOrEdit = (state) => {
    const drawing = state.annotations.drawing;
    const feature = state.annotations.editing;
    const type = state.annotations.featureType;
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: type === 'Point',
        editEnabled: !drawing,
        drawEnabled: drawing
    };
    return changeDrawingStatus("drawOrEdit", type, "annotations", [feature], drawOptions, assign({}, feature.style, {
        highlight: false
    }) || annotationsStyle);
};

const createNewFeature = (action) => {
    return {
        type: "Feature",
        properties: assign({}, action.fields, {id: action.id}),
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
                    properties: f.properties.id === action.id ? assign({}, f.properties, action.fields) : f.properties,
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
                    style: annotationsStyle,
                    features: [createNewFeature(action)],
                    handleClickOnLayer: true
                })
            ]).concat([
                changeDrawingStatus("clean", store.getState().annotations.featureType, "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]));
        }),
    cancelEditAnnotationEpic: (action$, store) =>
        action$.ofType(CANCEL_EDIT_ANNOTATION, PURGE_MAPINFO_RESULTS)
        .switchMap(() => {
            return Rx.Observable.from([
                changeDrawingStatus("clean", store.getState().annotations.featureType, "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]);
        }),
    startDrawMarkerEpic: (action$, store) => action$.ofType(TOGGLE_ADD)
        .switchMap( () => {
            return Rx.Observable.of(toggleDrawOrEdit(store.getState()));
        }),
    endDrawMarkerEpic: (action$, store) => action$.ofType(GEOMETRY_CHANGED)
        .filter(action => action.owner === 'annotations')
        .switchMap( (action) => {
            return Rx.Observable.from([
                updateAnnotationGeometry(mergeGeometry(action.features))
            ].concat(store.getState().annotations.featureType === 'Point' && store.getState().annotations.drawing ? [toggleAdd()] : []));
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
                changeDrawingStatus("clean", store.getState().annotations.featureType, "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]);
        }),
    confirmCloseAnnotationsEpic: (action$, store) => action$.ofType(CONFIRM_CLOSE_ANNOTATIONS)
    .switchMap(() => {
        return Rx.Observable.from((store.getState().controls.annotations && store.getState().controls.annotations.enabled ? [toggleControl('annotations')] : []).concat([purgeMapInfoResults()]));
    })
});
