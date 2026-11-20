/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import Rx from 'rxjs';
import { ActionsObservable } from 'redux-observable';
import { changeLayerProperties, CHANGE_LAYER_PROPERTIES, addLayer } from '../../../../actions/layers';
import { UPDATE_LAYER_PROPERTIES, updateWidgetLayerProperties } from '../../../../actions/widgets';
import layersReducer from '../../../../reducers/layers';
import widgetsReducer from '../../../../reducers/widgets';
import { layersAutoRefreshEpic, refreshAutoRefreshEpic, configureAutoRefreshEpic, synchronizeAutoRefreshEpic } from '../autorefresh';
import { autoRefreshNow, setAutoRefreshInterval } from '../../actions/autorefresh';
import { allLayersSelector } from '../../selectors/autorefresh';

const layer = { id: 'map', name: 'roads', type: 'wms', title: 'Roads', url: '/wms', visibility: true, autoRefreshInterval: 10 };
const makeState = () => ({
    layers: { flat: [layer], groups: [] },
    autorefresh: { enabled: true, paused: false, minimumRefreshInterval: 1 },
    security: { user: { role: 'USER' } },
    map: { mapId: 1, info: { canEdit: true } },
    widgets: { containers: { floating: { widgets: [{ id: 'table', widgetType: 'table', layer: { ...layer, id: 'widget-copy', filter: 'keep' } }] } } }
});
const run = (epic, action, state) => {
    const result = [];
    epic(ActionsObservable.of(action), { getState: () => state }).subscribe(item => result.push(item));
    return result;
};
const apply = (state, action) => ({ ...state, layers: layersReducer(state.layers, action), widgets: widgetsReducer(state.widgets, action) });

describe('AutoRefresh epics', () => {
    it('updates map/widget instances in one action and preserves widget filters', () => {
        const state = makeState();
        const key = allLayersSelector(state)[0].id;
        const actions = run(configureAutoRefreshEpic, setAutoRefreshInterval(key, 60000), state);
        expect(actions.length).toBe(1);
        const updated = apply(state, actions[0]);
        expect(updated.layers.flat[0].autoRefreshInterval).toBe(60000);
        expect(updated.widgets.containers.floating.widgets[0].layer.autoRefreshInterval).toBe(60000);
        expect(updated.widgets.containers.floating.widgets[0].layer.filter).toBe('keep');
    });
    it('removes the interval across all copies without affecting data configuration', () => {
        const state = makeState();
        const key = allLayersSelector(state)[0].id;
        const updated = apply(state, run(configureAutoRefreshEpic, setAutoRefreshInterval(key, undefined), state)[0]);
        expect(updated.layers.flat[0].autoRefreshInterval).toBe(undefined);
        expect(updated.widgets.containers.floating.widgets[0].layer.autoRefreshInterval).toBe(undefined);
    });
    it('rejects settings changes by viewers', () => {
        const state = { ...makeState(), security: {} };
        expect(run(configureAutoRefreshEpic, setAutoRefreshInterval('any', 1000), state)).toEqual([]);
    });
    it('refreshes manually while automatic timers are off, sharing one version across copies', () => {
        const state = { ...makeState(), autorefresh: { enabled: false, minimumRefreshInterval: 1 } };
        const actions = run(refreshAutoRefreshEpic, autoRefreshNow(), state);
        expect(actions.length).toBe(2);
        const updated = apply(state, actions[0]);
        expect(actions[0].type).toBe(CHANGE_LAYER_PROPERTIES);
        expect(updated.layers.flat[0]._v_).toBe(updated.widgets.containers.floating.widgets[0].layer._v_);
        expect(updated.layers.flat[0]._v_).toBeGreaterThan(0);
        expect(state.autorefresh.enabled).toBe(false);
    });
    it('supports dashboards without a main-map layer and ignores dynamic filter widgets', () => {
        const state = makeState();
        state.layers.flat = [];
        state.router = { location: { pathname: '/dashboard/1' } };
        state.widgets.containers.floating.widgets.push({ id: 'filter', widgetType: 'filter', layer });
        const actions = run(refreshAutoRefreshEpic, autoRefreshNow(), state);
        expect(actions[0].type).toBe(UPDATE_LAYER_PROPERTIES);
        expect(actions[0].updates.length).toBe(1);
        expect(actions[0].updates[0].widgetId).toBe('table');
    });
    it('never refreshes hidden or edited datasets', () => {
        const state = makeState();
        state.layers.flat = [{ ...layer, visibility: false }];
        state.widgets.containers.floating.widgets = [];
        expect(run(refreshAutoRefreshEpic, autoRefreshNow(), state)).toEqual([]);
        state.layers.flat = [layer];
        state.featuregrid = { mode: 'EDIT', selectedLayer: layer.id };
        expect(run(refreshAutoRefreshEpic, autoRefreshNow(), state)).toEqual([]);
    });
    it('new copies inherit the configured dataset interval', () => {
        const state = makeState();
        state.widgets.containers.floating.widgets[0].layer.autoRefreshInterval = undefined;
        const actions = run(synchronizeAutoRefreshEpic, addLayer(layer), state);
        expect(actions.length).toBe(1);
        const updated = apply(state, actions[0]);
        expect(updated.widgets.containers.floating.widgets[0].layer.autoRefreshInterval).toBe(10);
    });
    it('uses millisecond intervals, restarts after stop/start, and keeps one timer per dataset', () => {
        let state = makeState();
        const scheduler = new Rx.TestScheduler(() => {});
        const input = new Rx.Subject();
        const results = [];
        const subscription = layersAutoRefreshEpic(new ActionsObservable(input), { getState: () => state }, { scheduler })
            .subscribe(action => results.push({ time: scheduler.frame, action }));
        scheduler.schedule(() => { state = { ...state, autorefresh: { ...state.autorefresh, enabled: false } }; input.next({ type: 'stop' }); }, 15);
        scheduler.schedule(() => { state = { ...state, autorefresh: { ...state.autorefresh, enabled: true } }; input.next({ type: 'start' }); }, 25);
        scheduler.schedule(() => subscription.unsubscribe(), 46);
        scheduler.flush();
        expect(results.map(item => item.time)).toEqual([10, 35, 45]);
        expect(results[0].action.type).toBe(autoRefreshNow().type);
    });
    it('versions do not reset timers and editing pauses resume cleanly', () => {
        let state = makeState();
        const scheduler = new Rx.TestScheduler(() => {});
        const input = new Rx.Subject();
        const times = [];
        const subscription = layersAutoRefreshEpic(new ActionsObservable(input), { getState: () => state }, { scheduler })
            .subscribe(() => times.push(scheduler.frame));
        scheduler.schedule(() => { state = apply(state, changeLayerProperties(layer.id, { _v_: 1 })); input.next({ type: 'version' }); }, 5);
        scheduler.schedule(() => { state = { ...state, featuregrid: { mode: 'EDIT', selectedLayer: layer.id } }; input.next({ type: 'edit' }); }, 15);
        scheduler.schedule(() => { state = { ...state, featuregrid: { mode: 'VIEW' } }; input.next({ type: 'view' }); }, 25);
        scheduler.schedule(() => subscription.unsubscribe(), 46);
        scheduler.flush();
        expect(times).toEqual([10, 35, 45]);
    });
    it('ignores stale widget paths rather than recreating deleted widgets', () => {
        const state = makeState();
        const updated = widgetsReducer(state.widgets, updateWidgetLayerProperties([{ widgetId: 'deleted', path: ['layer'], properties: { _v_: 1 } }]));
        expect(updated).toBe(state.widgets);
    });
    [10, 100].forEach(count => it(`batches a manual refresh for ${count} datasets`, () => {
        const state = makeState();
        state.layers.flat = Array.from({ length: count }, (_, index) => ({ ...layer, id: `layer-${index}`, name: `dataset-${index}` }));
        state.widgets.containers.floating.widgets = [];
        const actions = run(refreshAutoRefreshEpic, autoRefreshNow(), state);
        expect(actions.length).toBe(2);
        expect(actions[0].layer.length).toBe(count);
        const updated = apply(state, actions[0]);
        expect(new Set(updated.layers.flat.map(item => item._v_)).size).toBe(1);
    }));

});
