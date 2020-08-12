/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { keys, findIndex, pick, castArray, find, isObject } from 'lodash';

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
import { layersSelector as mapLayersSelector } from '../selectors/layers';

import { getLayerCapabilities } from '../observables/wms';
import CSWApi from '../api/CSW';
import WMTSApi from '../api/WMTS';

const extractLayerData = layer => pick(layer, 'id', 'name', 'title', 'description', 'type');

export const layerInfoSetupLayersEpic = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
    .filter(({type, control, property, properties = []}) =>
        !!layerInfoControlEnabledSelector(store.getState()) &&
        control === 'layerinfo' &&
        (property === 'enabled' || findIndex(keys(properties), prop => prop === 'enabled') > -1 || type === TOGGLE_CONTROL))
    .switchMap(() => {
        const state = store.getState();
        const layers = mapLayersSelector(state);

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
            loading(true, 'syncingLayers'),
            setError(),
            ...layersSelector(store.getState()).map(layer => updateLayer({id: layer.id, syncStatus: 'none'})),
            ...layers.map(layer => updateLayer({id: layer.id, selected: false, syncStatus: 'updating'}))
        ).concat(
            Observable.merge(
                ...layers.map(({layerObj}) => getCapabilities[layerObj.type](layerObj)
                    .map(caps => {
                        const title = caps.title ?? caps.dc?.title;

                        return ['success', {
                            ...layerObj,
                            title: isObject(layerObj.title) ? {
                                ...layerObj.title,
                                'default': title
                            } : title,
                            description: caps._abstract ?? caps.dc?.abstract ?? caps.dc?.description
                        }];
                    })
                    .catch(() => Observable.of(['error', layerObj])))
            )
                .flatMap(([syncStatus, layerObj]) => Observable.of(updateLayer({
                    layerObj,
                    ...extractLayerData(layerObj),
                    syncStatus
                }), updateNode(layerObj.id, 'layer', pick(layerObj, 'title', 'description')), updateSyncStatus()))
                .concat(Observable.of(loading(false, 'syncingLayers')))
                .catch(() => Observable.of(setError({
                    title: 'layerInfo.syncingLayersGeneralError.title',
                    message: 'layerInfo.syncingLayersGeneralError.message'
                }), loading(false, 'syncingLayers')))
        );
    });
