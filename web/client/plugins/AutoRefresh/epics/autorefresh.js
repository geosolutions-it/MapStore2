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
import { AUTOREFRESH_NOW, AUTOREFRESH_SET_INTERVAL, autoRefreshNow, autoRefreshUpdated, withWidgetLayerUpdates } from '../actions/autorefresh';
import { isActiveRefreshSelector, isPausedSelector, eligibleLayersSelector, layerInstancesSelector, canConfigureSelector, refreshableLayersSelector } from '../selectors/autorefresh';
import { isValidInterval } from '../utils';
import { AUTOREFRESH_MINIMUM_REFRESH_INTERVAL } from '../constants';

/**
 * Epics for synchronizing dataset intervals and scheduling refreshes across maps and widgets.
 * @name epics.autorefresh
 */

/**
 * Build actions that update map layers and widget copies together in one dispatch.
 * @param {object[]} instances Layer instances from layerInstancesSelector.
 * @param {object} properties Properties to merge into every instance.
 * @param {boolean} [refresh=false] Use refreshLayerVersion with properties._v_ for map instances.
 * @returns {object[]} One combined layer/widget action, a widget-only action, or no actions.
 * @private
 */
const updateInstances = (instances, properties, refresh = false) => {
    const ids = instances.filter(instance => instance.mapLayer).map(instance => instance.layer.id);
    const updates = instances.filter(instance => !instance.mapLayer).map(({ target, widgetId, path }) => ({
        target, widgetId, path, properties
    }));
    if (ids.length) {
        const action = refresh ? refreshLayerVersion(ids, properties._v_) : changeLayerProperties(ids, properties);
        return [withWidgetLayerUpdates(action, updates)];
    }
    return updates.length ? [updateWidgetLayerProperties(updates)] : [];
};

/**
 * Make new map/widget instances inherit their dataset's configured interval atomically.
 * @function synchronizeAutoRefreshEpic
 * @param {external:Observable} action$ Layer/widget changes and map/dashboard load actions.
 * @param {object} store Redux store.
 * @param {function} store.getState Return the current Redux state.
 * @returns {external:Observable} Actions aligning intervals on copies of each configured dataset.
 * @memberof epics.autorefresh
 */
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

/**
 * Apply interval edits to all instances of a dataset when the user can configure the resource.
 * Valid millisecond intervals are clamped to the minimum; invalid or absent intervals remove the setting.
 * @function configureAutoRefreshEpic
 * @param {external:Observable} action$ AUTOREFRESH_SET_INTERVAL actions.
 * @param {object} store Redux store.
 * @param {function} store.getState Return the current Redux state.
 * @returns {external:Observable} Layer/widget property update actions.
 * @memberof epics.autorefresh
 */
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

/**
 * Refresh visible instances of eligible datasets unless refreshes are paused.
 * A single timestamp is used for all `_v_` updates and the last-refresh status.
 * Automatic activation is not required, allowing manual refresh while timers are stopped.
 * @function refreshAutoRefreshEpic
 * @param {external:Observable} action$ AUTOREFRESH_NOW actions, optionally scoped to a dataset key.
 * @param {object} store Redux store.
 * @param {function} store.getState Return the current Redux state.
 * @returns {external:Observable} Layer/widget version updates followed by AUTOREFRESH_UPDATED, or no actions.
 * @memberof epics.autorefresh
 */
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

/**
 * Maintain one timer per eligible dataset while automatic refresh is enabled and not paused.
 * Timers restart when intervals change and stop when a dataset becomes ineligible; version updates
 * do not restart them. A dataset that becomes eligible again receives a new timer.
 * @function layersAutoRefreshEpic
 * @param {external:Observable} action$ Redux actions used to re-evaluate the active schedule.
 * @param {object} store Redux store.
 * @param {function} store.getState Return the current Redux state.
 * @param {object} [dependencies={}] Epic dependencies.
 * @param {object} [dependencies.scheduler=Rx.Scheduler.async] RxJS scheduler used for refresh timers.
 * @returns {external:Observable} AUTOREFRESH_NOW actions emitted at each dataset's millisecond interval.
 * @memberof epics.autorefresh
 */
export const layersAutoRefreshEpic = (action$, store, { scheduler = Rx.Scheduler.async } = {}) => {
    /**
     * Derive the active schedule without transient layer versions.
     * @returns {object} Dataset keys mapped to millisecond intervals, or an empty object when stopped/paused.
     */
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
