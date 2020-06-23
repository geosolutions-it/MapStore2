/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { keys, findIndex, pick, castArray, find } from 'lodash';

import {
    SYNC_LAYERS,
    setLayers,
    resetSyncStatus,
    updateSyncStatus,
    setError,
    loading,
    updateLayer
} from '../actions/layerinfo';
import { SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL } from '../actions/controls';
import { updateNode } from '../actions/layers';

import {
    layerInfoControlEnabledSelector,
    layersSelector
} from '../selectors/layerinfo';
import { mapIdSelector } from '../selectors/map';

import { getLayerCapabilities } from '../observables/wms';
import GeoStoreApi from '../api/GeoStoreDAO';
import CSWApi from '../api/CSW';
import WMTSApi from '../api/WMTS';

import { set } from '../utils/ImmutableUtils';

const extractLayerData = layer => pick(layer, 'id', 'name', 'title', 'description', 'type');

export const layerInfoSetupLayersEpic = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
    .filter(({type, control, property, properties = []}) =>
        !!layerInfoControlEnabledSelector(store.getState()) &&
        control === 'layerinfo' &&
        (property === 'enabled' || findIndex(keys(properties), prop => prop === 'enabled') > -1 || type === TOGGLE_CONTROL))
    .switchMap(() => {
        const state = store.getState();
        const mapConfigRawData = state.mapConfigRawData;
        const layers = mapConfigRawData?.map?.layers;

        return Observable.of(
            loading(true),
            setError(),
            setLayers(layers.filter(({type}) => type === 'wms' || type === 'wmts').map(layer => ({
                layerObj: layer,
                ...extractLayerData(layer),
                selected: false,
                syncStatus: 'none'
            }))),
            loading(false)
        );
    });

export const layerInfoSyncLayersEpic = (action$, store) => action$
    .ofType(SYNC_LAYERS)
    .switchMap(({layers}) => {
        const saveMapConfig = () => {
            const state = store.getState();
            const mapConfigRawData = state.mapConfigRawData;
            const initialLayers = mapConfigRawData.map.layers;
            const layerInfoLayers = layersSelector(state);
            const mapId = mapIdSelector(state);

            let resultLayers = [];
            let curLayerIndex = 0;

            initialLayers.forEach(layer => {
                if (layer.type === 'wms' || layer.type === 'wmts') {
                    resultLayers.push(layerInfoLayers[curLayerIndex++].layerObj);
                } else {
                    resultLayers.push(layer);
                }
            });

            const updatedMapConfig = set('map.layers', resultLayers, mapConfigRawData);

            return Observable.of(loading(true, 'savingToServer', 'syncingLayers')).concat(
                Observable.defer(() => GeoStoreApi.putResource(mapId, updatedMapConfig))
                    .mapTo(loading(false, null, 'syncingLayers'))
                    .catch(() => Observable.of(setError({
                        title: 'layerInfo.syncingLayersSavingToServerError.title',
                        message: 'layerInfo.syncingLayersSavingToServerError.message'
                    }), loading(false, null, 'syncingLayers')))
            );
        };

        const getCapabilities = {
            wms: layer => layer.catalogURL ? Observable.defer(() => CSWApi.getRecordById(layer.catalogURL)) : getLayerCapabilities(layer),
            wmts: layer => Observable.defer(() => WMTSApi.getCapabilities(layer.capabilitiesURL || layer.url)).map(result => {
                const capLayers = castArray(result.Capabilities?.Contents?.Layer ?? []);
                const targetLayer = find(capLayers, {'ows:Identifier': layer.name});
                return {
                    title: targetLayer?.['ows:Title'],
                    _abstract: targetLayer?.['ows:Abstract']
                };
            })
        };

        return Observable.of(
            resetSyncStatus(layers.length),
            loading(true, 'updatingLayers', 'syncingLayers'),
            setError(),
            ...layersSelector(store.getState()).map(layer => updateLayer({id: layer.id, syncStatus: 'none'})),
            ...layers.map(layer => updateLayer({id: layer.id, selected: false, syncStatus: 'updating'}))
        ).concat(
            Observable.merge(
                ...layers.map(({layerObj}) => getCapabilities[layerObj.type](layerObj)
                    .map(caps => ['success', {
                        ...layerObj,
                        title: caps.title ?? caps.dc?.title,
                        description: caps._abstract ?? caps.dc?.abstract ?? caps.dc?.description
                    }])
                    .catch(() => Observable.of(['error', layerObj])))
            )
                .flatMap(([syncStatus, layerObj]) => Observable.of(updateLayer({
                    layerObj,
                    ...extractLayerData(layerObj),
                    syncStatus
                }), updateSyncStatus()))
                .concat(Observable.defer(() => Observable.of(
                    ...layersSelector(store.getState()).map(({layerObj}) => updateNode(layerObj.id, 'layer', pick(layerObj, 'title', 'description')))
                )))
                .concat(Observable.defer(saveMapConfig))
                .catch(() => Observable.of(setError({
                    title: 'layerInfo.syncingLayersGeneralError.title',
                    message: 'layerInfo.syncingLayersGeneralError.message'
                }), loading(false, null, 'syncingLayers')))
        );
    });
