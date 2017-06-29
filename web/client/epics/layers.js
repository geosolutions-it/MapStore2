/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const Api = require('../api/WMS');
const {REFRESH_LAYERS, layersRefreshed, updateNode, layersRefreshError, BACKGROUND_HAS_ERROR, changeLayerProperties} = require('../actions/layers');
const {currentBackgroundLayerSelector, allBackgroundLayerSelector} = require('../selectors/layers');

const LayersUtils = require('../utils/LayersUtils');
const {setControlProperty} = require('../actions/controls');
const {warning} = require('../actions/notifications');

const assign = require('object-assign');
const {isArray, head} = require('lodash');

const getUpdates = (updates, options) => {
    return Object.keys(options).filter((opt) => options[opt]).reduce((previous, current) => {
        return assign(previous, {
            [current]: updates[current]
        });
    }, {});
};

const removeWorkspace = (layer) => {
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

const refresh = action$ =>
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
                        return Rx.Observable.of(assign({layer: layer.id, title: caps.Title, bbox: Api.getBBox(caps, true), dimensions: Api.getDimensions(caps)}, (describe && !describe.error) ? {search: describe} : {}));
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

const handleBackgroundError = (action$, store) =>
    action$.ofType(BACKGROUND_HAS_ERROR)
    .filter(a => a.options.id === currentBackgroundLayerSelector(store.getState()).id)
    .switchMap(() => {
        const Layers = require('../utils/' + store.getState().maptype.mapType + '/Layers');
        const firstSupportedBackgroundLayer = head(allBackgroundLayerSelector(store.getState()).filter(l => {
            if (l.type === "mapquest" || l.type === "bing" ) {
                return Layers.isSupported(l.type) && l.apiKey && l.apiKey !== "__API_KEY_MAPQUEST__";
            }
            return Layers.isSupported(l.type);
        }));
        return !!firstSupportedBackgroundLayer ?
        Rx.Observable.from([
            changeLayerProperties(firstSupportedBackgroundLayer.id, {visibility: true}),
            setControlProperty('backgroundSelector', 'currentLayer', firstSupportedBackgroundLayer),
            setControlProperty('backgroundSelector', 'tempLayer', firstSupportedBackgroundLayer),
            warning({
                title: "warning",
                message: "notification.backgroundLayerNotSupported",
                action: {
                    label: "close"
                },
                position: "tc"
            })
        ]) : Rx.Observable.of(warning({
            title: "warning",
            message: "notification.noBackgroundLayerSupported",
            action: {
                label: "close"
            },
            position: "tc"
        }));
    });

module.exports = {
    refresh,
    handleBackgroundError
};
