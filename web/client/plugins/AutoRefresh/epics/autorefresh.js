/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';

import { AUTOREFRESH_TICK,
    AUTOREFRESH_START,
    AUTOREFRESH_STOP,
    autorefreshUpdateActiveLayer,
    autorefreshDeleteActiveLayer,
    autorefreshStart,
    autorefreshStop,
    AUTOREFRESH_UPDATE_ACTIVE_LAYER,
    AUTOREFRESH_DELETE_ACTIVE_LAYER,
    autorefreshUpdateAvailableLayers,
    autorefreshUpdateActiveLayers
} from "../actions/autorefresh";
import { REMOVE_NODE, UPDATE_NODE } from '../../../actions/layers';
import { hasAutoRefreshCapability, NodeTypes } from '../../../utils/LayersUtils';
import { VISUALIZATION_MODE_CHANGED } from '../../../actions/maptype';
import { layersSelector } from '../../../selectors/layers';
import { mapTypeSelector } from '../../../selectors/maptype';

export const autorefreshStartEpicCreation = (action$, store) => action$
    .ofType(AUTOREFRESH_START)
    .switchMap(() => {
        const ticks = {};
        const activeLayers = store.getState()?.autorefresh.activeLayers || {};
        Object.values(activeLayers).forEach(layer => {
            const interval = layer.autorefreshInterval || -1;
            if (interval > 0) {
                ticks[interval] = {
                    ...(ticks[interval] || {}),
                    [layer.id]: Date.now()
                };
            }
        });

        return Observable.from(
            Object.keys(ticks).map(interval =>
                Observable.interval(interval * 1000)
                    .map(() => ({
                        type: AUTOREFRESH_TICK,
                        ticks: Object.keys(ticks[interval]).reduce((acc, layerId) => {
                            acc[layerId] = Date.now();
                            return acc;
                        }, {})
                    }))
                    .takeUntil(action$.ofType(AUTOREFRESH_STOP))
            )
        ).mergeAll();
    });

export const autorefreshActiveLayerChangeEpicCreation = (action$, store) => action$
    .ofType(AUTOREFRESH_UPDATE_ACTIVE_LAYER, AUTOREFRESH_DELETE_ACTIVE_LAYER)
    .debounceTime(200)
    .switchMap(() => store.getState().autorefresh.enabled ? Observable.of(
        autorefreshStop(),
        autorefreshStart()
    ) : Observable.of(autorefreshStop()));

/**
 * Follow update on nodes (layers) to update the AutoRefresh plugin accordingly
 * (add/update layer on AutoRefresh)
 * @param {*} action$
 * @param {*} store
 * @returns
 */
export const autorefreshUpdateNodeEpicCreation = (action$, store) => action$
    .ofType(UPDATE_NODE)
    .filter(nodeConfig => nodeConfig.nodeType === NodeTypes.LAYER)
    .filter(nodeConfig => {
        const activeLayers = store.getState()?.autorefresh.activeLayers || {};
        const isActiveLayer = activeLayers[nodeConfig.node] !== undefined;
        const isAutorefreshIntervalChange = 'autorefreshInterval' in nodeConfig.options;

        return isActiveLayer && isAutorefreshIntervalChange;
    })
    .switchMap((nodeConfig) => {
        const autorefreshInterval = 'autorefreshInterval' in nodeConfig.options ?
            nodeConfig.options.autorefreshInterval :
            layersSelector(store.getState())
                .find(l => l.id === nodeConfig.node)?.autorefreshInterval || -1;

        return Observable.of(
            autorefreshUpdateActiveLayer({
                id: nodeConfig.node,
                autorefreshInterval
            })
        );
    });

/**
 * Follow removal of nodes (layers) to update the AutoRefresh plugin accordingly
 * (remove layer on AutoRefresh)
 * @param {*} action$
 * @returns
 */
export const autorefreshRemoveNodeEpicCreation = (action$) => action$
    .ofType(REMOVE_NODE)
    .filter(nodeConfig => nodeConfig.nodeType === NodeTypes.LAYER)
    .switchMap((nodeConfig) => {
        return Observable.of(
            autorefreshDeleteActiveLayer(nodeConfig.node)
        );
    });

/**
 * Follow changes in the map visualization mode (2D/3D) to update the AutoRefresh plugin accordingly
 * (update available and active layers on AutoRefresh)
 * @param {*} action$
 * @param {*} store
 * @returns
 */
export const autorefreshMapVisualisationModeChangeEpicCreation = (action$, store) => action$
    .ofType(VISUALIZATION_MODE_CHANGED)
    .switchMap(() => {
        const layers = layersSelector(store.getState());
        const mapType = mapTypeSelector(store.getState());

        const availableLayers = layers.filter(l => hasAutoRefreshCapability(l.type, mapType));
        const activeLayers = availableLayers.filter(l => l.autorefreshInterval > 0).reduce((acc, layer) => {
            acc[layer.id] = {
                id: layer.id,
                autorefreshInterval: layer.autorefreshInterval
            };
            return acc;
        }, {});

        return Observable.of(
            autorefreshStop(),
            autorefreshUpdateActiveLayers(activeLayers),
            autorefreshUpdateAvailableLayers(availableLayers.reduce((acc, layer) => {
                acc[layer.id] = layer;
                return acc;
            }, {}))
        );
    });
