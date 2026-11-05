/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from "rxjs";

import { isEqual } from 'lodash';
import { ADD_LAYER, changeLayerProperties, refreshLayerVersion } from '../../../actions/layers';
import { INSERT, UPDATE_PROPERTY, REPLACE, updateWidgetLayerProperties } from '../../../actions/widgets';
import { MAP_CONFIG_LOADED } from '../../../actions/config';
import { DASHBOARD_LOADED } from '../../../actions/dashboard';
import { AUTOREFRESH_NOW, AUTOREFRESH_SET_INTERVAL, autoRefreshNow, autoRefreshUpdated } from '../actions/autorefresh';
import { isActiveRefreshSelector, isPausedSelector, eligibleLayersSelector, layerInstancesSelector, canConfigureSelector, refreshableLayersSelector } from '../selectors/autorefresh';
import { isValidInterval } from '../utils';
import { AUTOREFRESH_MINIMUM_REFRESH_INTERVAL } from '../constants';

const updateInstances = (instances, properties, refresh = false) => {
    const ids = instances.filter(instance => instance.mapLayer).map(instance => instance.layer.id);
    const updates = instances.filter(instance => !instance.mapLayer).map(({ target, widgetId, path }) => ({
        target, widgetId, path, properties
    }));
    if (ids.length) return [refresh ? refreshLayerVersion(ids, properties._v_, updates) : changeLayerProperties(ids, properties, updates)];
    return updates.length ? [updateWidgetLayerProperties(updates)] : [];
};

// New widget/map instances inherit the dataset's saved interval atomically.
export const synchronizeAutoRefreshEpic = (action$, { getState }) => action$
    .ofType(ADD_LAYER, INSERT, UPDATE_PROPERTY, REPLACE, MAP_CONFIG_LOADED, DASHBOARD_LOADED)
    .mergeMap(() => {
        const state = getState();
        const instances = layerInstancesSelector(state);
        return Rx.Observable.from(refreshableLayersSelector(state).reduce((actions, layer) => [
            ...actions,
            ...updateInstances(instances.filter(instance => instance.key === layer.id
                && instance.layer.autoRefreshInterval !== layer.autoRefreshInterval), { autoRefreshInterval: layer.autoRefreshInterval })
        ], []));
    });

export const configureAutoRefreshEpic = (action$, { getState }) => action$.ofType(AUTOREFRESH_SET_INTERVAL)
    .filter(() => canConfigureSelector(getState()))
    .mergeMap(({ key, interval }) => {
        const state = getState();
        const minimum = state.autorefresh?.minimumRefreshInterval || AUTOREFRESH_MINIMUM_REFRESH_INTERVAL;
        const value = isValidInterval(interval) ? Math.max(minimum, interval) : undefined;
        return Rx.Observable.from(updateInstances(layerInstancesSelector(state).filter(instance => instance.key === key), {
            autoRefreshInterval: value
        }));
    });

export const refreshAutoRefreshEpic = (action$, { getState }) => action$.ofType(AUTOREFRESH_NOW)
    .mergeMap(({ key }) => {
        const state = getState();
        if (isPausedSelector(state)) return Rx.Observable.empty();
        const keys = new Set(eligibleLayersSelector(state).filter(layer => !key || layer.id === key).map(layer => layer.id));
        const instances = layerInstancesSelector(state).filter(instance => keys.has(instance.key) && instance.visible);
        if (!instances.length) return Rx.Observable.empty();
        const time = Date.now();
        return Rx.Observable.from([...updateInstances(instances, { _v_: time }, true), autoRefreshUpdated(time)]);
    });

export const layersAutoRefreshEpic = (action$, store, { scheduler = Rx.Scheduler.async } = {}) => {
    const getLayersMap = () => isPausedSelector(store.getState()) || !isActiveRefreshSelector(store.getState()) ?
        {} :
        eligibleLayersSelector(store.getState()).reduce((acc, l) => ({ ...acc, [l.id]: l.autoRefreshInterval }), {});

    // Re-evaluate after map, widget, editor and layout changes. The derived schedule
    // ignores versions, so ticks never restart existing timers.
    const active$ = action$
        .map(getLayersMap)
        .startWith(getLayersMap())
        .distinctUntilChanged(isEqual) // if some of the layer interval changed (or list change) triggers
        .publishReplay(1).refCount(); // activate multicast

    return active$
        .mergeMap(m => Object.keys(m).map(id => ({ id, interval: m[id] })))
        // durationSelector completes (and deregisters) the group when the layer is removed,
        // so groupBy can create a brand new group if the same id reappears later
        .groupBy(d => d.id, d => d, group$ => active$.filter(m => !m[group$.key]))
        // this merges N stream actions, 1 for each layer that needs a refresh, each one with its own timer
        .mergeMap(group$ => {
            const id = group$.key;
            const removed$ = active$.filter(m => !m[id]);   // this intercepts when a layer is not in the map anymore
            return group$
                .map(d => d.interval)
                .distinctUntilChanged()                     // if change interval, rebuild the timer
                .switchMap(interval =>
                    Rx.Observable.timer(interval, interval, scheduler).map(() => autoRefreshNow(id))
                )
                .takeUntil(removed$);
        });
};
