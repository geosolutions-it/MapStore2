/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {addLayer, updateNode, changeLayerProperties} = require('../actions/layers');
const {hideMapinfoMarker, purgeMapInfoResults} = require('../actions/mapInfo');

const {updateAnnotationGeometry, setStyle, toggleStyle,
    CONFIRM_REMOVE_ANNOTATION, SAVE_ANNOTATION, EDIT_ANNOTATION, CANCEL_EDIT_ANNOTATION,
    TOGGLE_ADD, SET_STYLE, RESTORE_STYLE} = require('../actions/annotations');

const {GEOMETRY_CHANGED} = require('../actions/draw');
const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');

const {head} = require('lodash');
const assign = require('object-assign');

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
    const drawOptions = {
        featureProjection: "EPSG:4326",
        stopAfterDrawing: false,
        editEnabled: !drawing,
        drawEnabled: drawing
    };
    return changeDrawingStatus("drawOrEdit", 'MultiPoint', "annotations", [feature], drawOptions, feature.style || annotationsStyle);
};

module.exports = (viewer) => ({
    addAnnotationsLayerEpic: (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() => {
            const annotationsLayer = head(store.getState().layers.flat.filter(l => l.id === 'annotations'));
            if (!annotationsLayer) {
                return Rx.Observable.of(addLayer({
                    type: 'vector',
                    visibility: true,
                    id: 'annotations',
                    name: "Annotations",
                    rowViewer: viewer,
                    hideLoading: true,
                    style: annotationsStyle,
                    features: [],
                    handleClickOnLayer: true
                }));
            }
            return Rx.Observable.of(updateNode(
                'annotations', 'layer', { rowViewer: viewer }
            ));
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
                return Rx.Observable.of(changeDrawingStatus("replace", 'MultiPoint', "annotations", [store.getState().annotations.editing], {}));
            }
            return Rx.Observable.from([
                updateNode('annotations', 'layer', {
                    features: head(store.getState().layers.flat.filter(l => l.id === 'annotations')).features.filter(f => f.properties.id !== action.id)
                }),
                hideMapinfoMarker(),
                purgeMapInfoResults()
            ]);
        }),
    saveAnnotationEpic: (action$, store) =>
        action$.ofType(SAVE_ANNOTATION)
        .switchMap((action) => {
            return Rx.Observable.from([
                updateNode('annotations', 'layer', {
                    features: head(store.getState().layers.flat.filter(l => l.id === 'annotations')).features.map(f => assign({}, f, {
                        properties: f.properties.id === action.id ? assign({}, f.properties, action.fields) : f.properties,
                        geometry: f.properties.id === action.id ? action.geometry : f.geometry,
                        style: f.properties.id === action.id ? action.style : f.style
                    }))
                }),
                changeDrawingStatus("clean", 'MultiPoint', "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]);
        }),
    cancelEditAnnotationEpic: (action$) =>
        action$.ofType(CANCEL_EDIT_ANNOTATION, PURGE_MAPINFO_RESULTS)
        .switchMap(() => {
            return Rx.Observable.from([
                changeDrawingStatus("clean", 'MultiPoint', "annotations", [], {}),
                changeLayerProperties('annotations', {visibility: true})
            ]);
        }),
    startDrawMarkerEpic: (action$, store) => action$.ofType(TOGGLE_ADD)
        .switchMap( () => {
            return Rx.Observable.of(toggleDrawOrEdit(store.getState()));
        }),
    endDrawMarkerEpic: (action$) => action$.ofType(GEOMETRY_CHANGED)
        .filter(action => action.owner === 'annotations')
        .switchMap( (action) => {
            return Rx.Observable.of(
                updateAnnotationGeometry(mergeGeometry(action.features))
            );
        }),
    setStyleEpic: (action$, store) => action$.ofType(SET_STYLE)
        .switchMap( () => {
            const {style, ...feature} = store.getState().annotations.editing;
            return Rx.Observable.from([
                changeDrawingStatus("replace", 'MultiPoint', "annotations", [feature], {}, style)]
            );
        }),
    restoreStyleEpic: (action$, store) => action$.ofType(RESTORE_STYLE)
        .switchMap( () => {
            const {style, ...feature} = store.getState().annotations.editing;
            return Rx.Observable.from([
                changeDrawingStatus("replace", 'MultiPoint', "annotations", [feature], {}, style),
                setStyle(store.getState().annotations.originalStyle),
                toggleStyle()
            ]
            );
        })
});
