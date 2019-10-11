/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');

const {head} = require('lodash');
const {ADD_BACKGROUND, ADD_BACKGROUND_PROPERTIES, SET_CURRENT_BACKGROUND_LAYER, BACKGROUND_ADDED, BACKGROUND_EDITED, REMOVE_BACKGROUND, createBackgroundsList, clearModalParameters,
    setBackgroundModalParams, setCurrentBackgroundLayer} = require('../actions/backgroundselector');
const {setControlProperty, toggleControl} = require('../actions/controls');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {changeSelectedService, catalogClose} = require('../actions/catalog');
const {changeLayerProperties, removeNode} = require('../actions/layers');
const {allBackgroundLayerSelector, getLayerFromId} = require('../selectors/layers');
const {backgroundLayersSelector} = require('../selectors/backgroundselector');
const {getLayerCapabilities} = require('../observables/wms');
const {formatCapabitiliesOptions} = require('../utils/LayersUtils');

const accessMetadataExplorer = (action$) =>
    action$.ofType(ADD_BACKGROUND)
        .switchMap(() => Rx.Observable.of(
            setControlProperty('metadataexplorer', 'enabled', true),
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

const backgroundsListInit = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() => {
            const state = store.getState();
            const backgrounds = allBackgroundLayerSelector(state);
            return Rx.Observable.of(createBackgroundsList(backgrounds));
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
                clearModalParameters(),
                catalogClose(),
                toggleControl('backgroundSelector', null)
            ) : Rx.Observable.empty();
        });

const backgroundEditedEpic = (action$, store) =>
    action$.ofType(BACKGROUND_EDITED)
        .mergeMap(({layerId}) => {
            const state = store.getState();
            const editedLayer = getLayerFromId(state, layerId);
            return editedLayer ? Rx.Observable.of(
                setCurrentBackgroundLayer(editedLayer.id),
                clearModalParameters()
            ) : Rx.Observable.empty();
        });

const backgroundRemovedEpic = (action$, store) =>
    action$.ofType(REMOVE_BACKGROUND)
        .mergeMap(({backgroundId}) => {
            const state = store.getState();
            const layerToRemove = getLayerFromId(state, backgroundId);
            const backgroundLayers = backgroundLayersSelector(state);
            const nextLayer = head(backgroundLayers.filter(laa => laa.id !== backgroundId && !laa.invalid));
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
