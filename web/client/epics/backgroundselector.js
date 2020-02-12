/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');

const {head} = require('lodash');
const {ADD_BACKGROUND, ADD_BACKGROUND_PROPERTIES, SET_CURRENT_BACKGROUND_LAYER, BACKGROUND_ADDED, BACKGROUND_EDITED, REMOVE_BACKGROUND, createBackgroundsList, clearModalParameters,
    setBackgroundModalParams, setCurrentBackgroundLayer, allowBackgroundsDeletion} = require('../actions/backgroundselector');
const {setControlProperty} = require('../actions/controls');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {changeSelectedService} = require('../actions/catalog');
const {changeLayerProperties, removeNode} = require('../actions/layers');
const {getLayerFromId, currentBackgroundSelector} = require('../selectors/layers');
const {backgroundLayersSelector} = require('../selectors/backgroundselector');
const {getLayerCapabilities} = require('../observables/wms');
const {formatCapabitiliesOptions} = require('../utils/LayersUtils');

const accessMetadataExplorer = (action$) =>
    action$.ofType(ADD_BACKGROUND)
        .switchMap(() => Rx.Observable.of(
            setControlProperty('metadataexplorer', 'enabled', true),
            allowBackgroundsDeletion(false),
            changeSelectedService('default_map_backgrounds')
        ));

const addBackgroundPropertiesEpic = (action$) =>
    action$.ofType(ADD_BACKGROUND_PROPERTIES)
        .switchMap(({modalParams}) => {
            const defaultAction = Rx.Observable.of(setBackgroundModalParams({...modalParams, loading: false}));
            return modalParams.layer && modalParams.layer.type === 'wms' ?
                Rx.Observable.of(setBackgroundModalParams({...modalParams, loading: true}))
                    .concat(getLayerCapabilities(modalParams.layer)
                        .switchMap(capabilities => Rx.Observable.of(
                            setBackgroundModalParams({...modalParams, loading: false, capabilities: formatCapabitiliesOptions(capabilities)})
                        ))
                        .catch(() => defaultAction)
                    )
                : defaultAction;
        });

const backgroundsListInit = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(({config}) => {
            const backgrounds = config.map && config.map.backgrounds || [];
            const backgroundLayers = (config.map && config.map.layers || []).filter(layer => layer.group === 'background');
            const layerUpdateActions = backgrounds.filter(background => !!background.thumbnail).map(background => {
                const toBlob = (data) => {
                    const bytes = atob(data.split(',')[1]);
                    const mimeType = data.split(',')[0].split(':')[1].split(';')[0];
                    let buffer = new ArrayBuffer(bytes.length);
                    let byteArray = new Uint8Array(buffer);
                    for (let i = 0; i < bytes.length; ++i) {
                        byteArray[i] = bytes.charCodeAt(i);
                    }
                    return URL.createObjectURL(new Blob([buffer], {type: mimeType}));
                };
                return changeLayerProperties(background.id, {thumbURL: toBlob(background.thumbnail)});
            });
            const currentBackground = head(backgroundLayers.filter(layer => layer.visibility));
            return Rx.Observable.of(...layerUpdateActions.concat(createBackgroundsList(backgrounds)),
                ...(currentBackground ? [setCurrentBackgroundLayer(currentBackground.id)] : []));
        });

const setCurrentBackgroundLayerEpic = (action$, store) =>
    action$.ofType(SET_CURRENT_BACKGROUND_LAYER)
        .switchMap(({layerId}) => {
            const state = store.getState();
            const layer = getLayerFromId(state, layerId);

            return Rx.Observable.of(...(layer && layer.group === 'background' ? [
                setControlProperty('backgroundSelector', 'tempLayer', layer),
                setControlProperty('backgroundSelector', 'currentLayer', layer)
            ] : []));
        });

const backgroundAddedEpic = (action$, store) =>
    action$.ofType(BACKGROUND_ADDED)
        .mergeMap(({layerId}) => {
            const state = store.getState();
            const addedLayer = getLayerFromId(state, layerId);
            return addedLayer ? Rx.Observable.of(
                changeLayerProperties(addedLayer.id, {visibility: true}),
                setCurrentBackgroundLayer(addedLayer.id),
                clearModalParameters()
            ) : Rx.Observable.empty();
        });

const backgroundEditedEpic = (action$, store) =>
    action$.ofType(BACKGROUND_EDITED)
        .mergeMap(({layerId}) => {
            const state = store.getState();
            const editedLayer = getLayerFromId(state, layerId);
            return editedLayer ? Rx.Observable.of(
                clearModalParameters()
            ) : Rx.Observable.empty();
        });

const backgroundRemovedEpic = (action$, store) =>
    action$.ofType(REMOVE_BACKGROUND)
        .mergeMap(({backgroundId}) => {
            const state = store.getState();
            const layerToRemove = getLayerFromId(state, backgroundId);
            const backgroundLayers = backgroundLayersSelector(state) || [];
            const currentLayer = currentBackgroundSelector(state) || {};
            const nextLayer = backgroundId === currentLayer.id ?
                head(backgroundLayers.filter(laa => laa.id !== backgroundId && !laa.invalid)) :
                currentLayer;
            return layerToRemove ? Rx.Observable.of(
                removeNode(backgroundId, 'layers'),
                changeLayerProperties(nextLayer.id, {visibility: true}),
                setCurrentBackgroundLayer(nextLayer.id)
            ) : Rx.Observable.empty();
        });

module.exports = {
    accessMetadataExplorer,
    addBackgroundPropertiesEpic,
    backgroundsListInit,
    setCurrentBackgroundLayerEpic,
    backgroundAddedEpic,
    backgroundEditedEpic,
    backgroundRemovedEpic
};
