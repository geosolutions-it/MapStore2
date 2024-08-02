/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';

import { head } from 'lodash';

import {
    ADD_BACKGROUND,
    ADD_BACKGROUND_PROPERTIES,
    SET_CURRENT_BACKGROUND_LAYER,
    BACKGROUND_ADDED,
    BACKGROUND_EDITED,
    REMOVE_BACKGROUND,
    SYNC_CURRENT_BACKGROUND_LAYER,
    UPDATE_BACKGROUND_THUMBNAIL,
    clearModalParameters,
    setBackgroundModalParams,
    setCurrentBackgroundLayer,
    allowBackgroundsDeletion,
    backgroundAdded
} from '../actions/backgroundselector';

import { setControlProperty } from '../actions/controls';
import { changeSelectedService } from '../actions/catalog';
import { UPDATE_NODE, ADD_LAYER, changeLayerProperties, removeNode} from '../actions/layers';
import { getLayerFromId, currentBackgroundSelector } from '../selectors/layers';
import { backgroundLayersSelector } from '../selectors/backgroundselector';
import { getLayerCapabilities } from '../observables/wms';
import { getCustomTileGridProperties, getLayerOptions } from '../utils/WMSUtils';
import { getLayerTileMatrixSetsInfo } from '../api/WMTS';
import { generateGeoServerWMTSUrl } from '../utils/WMTSUtils';

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
            const isTileGridNeeded = (!modalParams.editing && modalParams?.layer?.remoteTileGrids);
            return modalParams.layer && modalParams.layer.type === 'wms' ?
                Rx.Observable.of(setBackgroundModalParams({...modalParams, loading: true}))
                    .concat(Rx.Observable.forkJoin(getLayerCapabilities(modalParams.layer), (!isTileGridNeeded) ?
                        Rx.Observable.of(null) :
                        Rx.Observable.defer(() => getLayerTileMatrixSetsInfo(generateGeoServerWMTSUrl(modalParams.layer), modalParams.layer.name, modalParams.layer))
                            .catch(() => Rx.Observable.of(null)))

                        .switchMap(([capabilities, tileGridData]) => {
                            const tileGridProperties = tileGridData ? getCustomTileGridProperties(tileGridData) : {};
                            return Rx.Observable.of(
                                setBackgroundModalParams({...modalParams, layer: {...modalParams.layer, ...tileGridProperties}, loading: false, capabilities: getLayerOptions(capabilities)})
                            );
                        })
                        .catch(() => defaultAction)
                    )
                : defaultAction;
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

const updateTempBackgroundLayerEpic = (action$, store) =>
    action$.ofType(UPDATE_BACKGROUND_THUMBNAIL)
        .take(1)
        .switchMap(({ id }) =>
            action$.ofType(UPDATE_NODE)
                .switchMap(() => {
                    const state = store.getState();
                    const layer = getLayerFromId(state, id);
                    const currentLayer = currentBackgroundSelector(state);

                    return currentLayer.id === layer.id ? Rx.Observable.of(...(layer && layer.group === 'background' ? [
                        setControlProperty('backgroundSelector', 'tempLayer', layer),
                        setControlProperty('backgroundSelector', 'currentLayer', layer)
                    ] : [])) : Rx.Observable.of(setControlProperty('backgroundSelector', 'tempLayer', layer));
                })
        );


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

/**
 * Helper epic to properly update selected background icon/item whenever background is added via query parameters
 * @param {external:Observable} action$ manages `SYNC_CURRENT_BACKGROUND_LAYER` and `ADD_LAYER`.
 * @return {external:Observable}
 */
const syncSelectedBackgroundEpic = (action$) =>
    action$.ofType(SYNC_CURRENT_BACKGROUND_LAYER)
        .take(1)
        .switchMap(({ id }) =>
            action$.ofType(ADD_LAYER)
                .filter(({layer}) => layer.id === id)
                .switchMap(() => {
                    return Rx.Observable.of(backgroundAdded(id));
                })
                .takeUntil(action$.ofType(BACKGROUND_ADDED)));

export default {
    accessMetadataExplorer,
    addBackgroundPropertiesEpic,
    setCurrentBackgroundLayerEpic,
    updateTempBackgroundLayerEpic,
    backgroundAddedEpic,
    backgroundEditedEpic,
    backgroundRemovedEpic,
    syncSelectedBackgroundEpic
};
