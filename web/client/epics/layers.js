/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import Api from '../api/WMS';

import {
    REFRESH_LAYERS,
    UPDATE_LAYERS_DIMENSION,
    UPDATE_SETTINGS_PARAMS,
    LAYER_LOAD,
    layersRefreshed,
    updateNode,
    updateSettings,
    layersRefreshError,
    changeLayerParams
} from '../actions/layers';

import { getLayersWithDimension, layerSettingSelector, getLayerFromId } from '../selectors/layers';
import { setControlProperty } from '../actions/controls';
import { initialSettingsSelector, originalSettingsSelector } from '../selectors/controls';
import { basicError } from '../utils/NotificationUtils';
import LayersUtils from '../utils/LayersUtils';
import assign from 'object-assign';
import { isArray, head } from 'lodash';

export const getUpdates = (updates, options) => {
    return Object.keys(options).filter((opt) => options[opt]).reduce((previous, current) => {
        return assign(previous, {
            [current]: updates[current]
        });
    }, {});
};

export const removeWorkspace = (layer) => {
    if (layer.indexOf(':') !== -1) {
        return layer.split(':')[1];
    }
    return layer;
};

/**
 * Runs refresh requests for all requested layers and accumulates results
 * @memberof epics.layers
 * @param {external:Observable} action$ manages `REFRESH_LAYERS`
 * @return {external:Observable}
 */

export const refresh = action$ =>
    action$.ofType(REFRESH_LAYERS)
        .debounce(({debounceTime = 500} = {}) => Rx.Observable.timer(debounceTime) )
        .switchMap(action => {
            return Rx.Observable.from(
                action.layers.map((layer) =>
                    Rx.Observable.forkJoin(
                        Api.getCapabilities(LayersUtils.getCapabilitiesUrl(layer), true)
                            .then( (json) => {
                                const root = (json.WMS_Capabilities || json.WMT_MS_Capabilities).Capability;
                                const layersObj = Api.flatLayers(root);
                                const layers = isArray(layersObj) ? layersObj : [layersObj];
                                return head(layers.filter((l) => l.Name === removeWorkspace(layer.name) || l.Name === layer.name));
                            }).catch((e) => ({layer: layer.id, fullLayer: layer, error: e})),
                        Api.describeLayer(layer.url, layer.name)
                            .then( (result) => {
                                if (result && result.name === layer.name && result.owsType === 'WFS') {
                                    return {
                                        url: result.owsURL,
                                        type: 'wfs'
                                    };
                                }
                                return null;
                            }).catch((e) => ({layer: layer.id, fullLayer: layer, error: e}))
                    ).concatMap(([caps, describe]) => {
                        if (!caps) {
                            return Rx.Observable.of({layer: layer.id, fullLayer: layer, error: 'Missing layer'});
                        }
                        if (caps.error) {
                            return Rx.Observable.of(caps.error && caps);
                        }
                        return Rx.Observable.of(assign({layer: layer.id, title: LayersUtils.getLayerTitleTranslations(caps), bbox: Api.getBBox(caps, true), dimensions: Api.getDimensions(caps)}, (describe && !describe.error) ? {search: describe} : {}));
                    })
                )
            )
                .mergeAll()
                .map((layer) => {
                    if (layer.error) {
                        return Rx.Observable.of(layersRefreshError([layer], layer.error.message));
                    }
                    return Rx.Observable.from([layersRefreshed([layer]), updateNode(layer.layer, "id", getUpdates({
                        bbox: layer.bbox,
                        search: layer.search,
                        title: layer.title,
                        dimensions: layer.dimensions
                    }, action.options))]);
                })
                .mergeAll();
        });

/**
 * Update dimension to all layers that have that dimension set, or for the layers indicated in the action.
 * @memberof epics.layers
 * @param {external:Observable} action$ manages `UPDATE_LAYERS_DIMENSION`
 * @return {external:Observable}
 */
export const updateDimension = (action$, {getState = () => {}} = {}) =>
    action$.ofType(UPDATE_LAYERS_DIMENSION)
        .map(({ layers, dimension, ...other }) => ({ ...other, dimension, layers: layers || getLayersWithDimension(getState(), dimension)}))
        .switchMap(({layers, dimension, value}) =>
            Rx.Observable.of(
                changeLayerParams(
                    layers.map(l => l.id),
                    {
                        [dimension]: value
                    }
                )
            )
        );

/**
 * Update original and initial state of layer settings.
 * Initial settings is the layer object before settings session started.
 * Original settings contains only changed properties keys with initial value stored during settings session.
 * Action performed: updateSettings, setControlProperty and updateNode (updateNode only if action.update is true)
 * @memberof epics.layers
 * @param {external:Observable} action$ manages `UPDATE_SETTINGS_PARAMS`
 * @return {external:Observable}
 */
export const updateSettingsParamsEpic = (action$, store) =>
    action$.ofType(UPDATE_SETTINGS_PARAMS)
        .switchMap(({ newParams = {}, update }) => {

            const state = store.getState();
            const settings = layerSettingSelector(state);
            const initialSettings = initialSettingsSelector(state);
            const orig = originalSettingsSelector(state);
            const layer = settings?.nodeType === 'layers' ? getLayerFromId(state, settings?.node) : null;

            let originalSettings = { ...(orig || {}) };
            // TODO one level only storage of original settings for the moment
            Object.keys(newParams).forEach((key) => {
                originalSettings[key] = initialSettings && initialSettings[key];
            });

            return Rx.Observable.of(
                updateSettings(newParams),
                // update changed keys to verify only modified values (internal state)
                setControlProperty('layersettings', 'originalSettings', originalSettings),
                ...(update ? [updateNode(
                    settings.node,
                    settings.nodeType,
                    { ...settings.options, ...newParams }
                )] : [])
            // this handles errors due to name changes
            ).concat(newParams.name && layer && layer.name !== newParams.name ?
                action$.ofType(LAYER_LOAD).filter(({layerId}) => layerId === layer?.id).take(1).flatMap(({error}) => error ?
                    Rx.Observable.of(basicError({
                        title: 'layerNameChangeError.title',
                        message: 'layerNameChangeError.message',
                        autoDismiss: 5
                    })) :
                    Rx.Observable.empty()) :
                Rx.Observable.empty());
        });

export default {
    refresh,
    updateDimension,
    updateSettingsParamsEpic
};
