/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { allLayersSelector, availableLayersSelector, refreshableLayersSelector, eligibleLayersSelector, canConfigureSelector, isPausedSelector, isActiveRefreshSelector } from '../autorefresh';

const layer = { id: 'map-copy', name: 'roads', title: 'Roads', type: 'wms', url: '/wms', visibility: true, autoRefreshInterval: 60000 };
const state = (layers = [layer], extra = {}) => ({ layers: { flat: layers, groups: [] }, ...extra });

describe('AutoRefresh selectors', () => {
    it('tolerates missing plugin, map and widget state', () => {
        expect(isPausedSelector(undefined)).toBe(false);
        expect(isActiveRefreshSelector(undefined)).toBe(false);
        expect(allLayersSelector({})).toEqual([]);
    });
    it('lists configured hidden layers but schedules only visible layers', () => {
        const input = state([{ ...layer, visibility: false }]);
        expect(refreshableLayersSelector(input).length).toBe(1);
        expect(eligibleLayersSelector(input)).toEqual([]);
    });
    it('respects visibility inherited from groups', () => {
        const input = state([], { layers: { flat: [{ ...layer, group: 'hidden' }], groups: [{ id: 'hidden', visibility: false, nodes: ['map-copy'] }] } });
        expect(eligibleLayersSelector(input)).toEqual([]);
    });
    it('rejects zero, negative, nonnumeric and nonfinite intervals', () => {
        [0, -1, NaN, Infinity, 2147483648, '60000', undefined].forEach(autoRefreshInterval => {
            const input = state([{ ...layer, autoRefreshInterval }]);
            expect(eligibleLayersSelector(input)).toEqual([]);
            expect(availableLayersSelector(input).length).toBe(1);
        });
    });
    it('enforces the configured minimum on imported values', () => {
        expect(eligibleLayersSelector(state([{ ...layer, autoRefreshInterval: 100 }]))[0].autoRefreshInterval).toBe(30000);
    });
    it('deduplicates copies while distinguishing datasets on different services', () => {
        const input = state([layer, { ...layer, id: 'copy' }, { ...layer, id: 'other', url: '/other-wms' }]);
        expect(allLayersSelector(input).length).toBe(2);
    });
    it('collects dashboard-only chart, table and map layers, excluding dynamic filters', () => {
        const input = state([], {
            router: { location: { pathname: '/dashboard/1' } },
            widgets: { containers: { floating: { widgets: [
                { id: 'chart', widgetType: 'chart', charts: [{ traces: [{ layer }] }] },
                { id: 'table', widgetType: 'table', layer: { ...layer, id: 'table-copy' } },
                { id: 'map', widgetType: 'map', maps: [{ mapId: 'map', layers: [{ ...layer, name: 'buildings' }] }] },
                { id: 'filter', widgetType: 'filter', layer: { ...layer, name: 'excluded' } }
            ] } } }
        });
        expect(allLayersSelector(input).map(item => item.name)).toEqual(['roads', 'buildings']);
    });
    it('excludes edited datasets while keeping unrelated timers eligible', () => {
        const input = state([layer, { ...layer, id: 'other', name: 'buildings' }], { featuregrid: { mode: 'EDIT', selectedLayer: layer.id } });
        expect(eligibleLayersSelector(input).map(item => item.name)).toEqual(['buildings']);
    });
    it('excludes widget-wizard targets only while its editor is open', () => {
        const widgets = { builder: { editor: { layer } } };
        expect(eligibleLayersSelector(state([layer], { widgets })).length).toBe(1);
        expect(eligibleLayersSelector(state([layer], { widgets, controls: { widgetBuilder: { enabled: true } } }))).toEqual([]);
    });
    it('allows non-admin publishers and rejects viewers', () => {
        const input = state([], { security: { user: { role: 'USER' } }, map: { mapId: 1, info: { canEdit: true } } });
        expect(canConfigureSelector(input)).toBe(true);
        expect(canConfigureSelector({ ...input, map: { mapId: 1, info: { canEdit: false } } })).toBe(false);
        expect(canConfigureSelector({ ...input, security: {} })).toBe(false);
    });
    it('does not schedule inactive maps/charts or unsupported engine combinations', () => {
        const input = state([], { widgets: { containers: { floating: { widgets: [{
            id: 'maps', widgetType: 'map', selectedMapId: 'one', maps: [
                { mapId: 'one', layers: [layer] },
                { mapId: 'two', layers: [{ ...layer, name: 'inactive' }] }
            ]
        }] } } } });
        expect(eligibleLayersSelector(input).map(item => item.name)).toEqual(['roads']);
        expect(availableLayersSelector(state([{ ...layer, type: '3dtiles', autoRefreshInterval: undefined }])).length).toBe(0);
        expect(availableLayersSelector(state([{ ...layer, type: '3dtiles', autoRefreshInterval: undefined }], { maptype: { mapType: 'cesium' } })).length).toBe(1);
    });
    it('recognizes embedded dashboards whose route contains only a resource ID', () => {
        const input = state([layer], { router: { location: { pathname: '/1' } }, dashboard: { resource: { id: 1 } } });
        expect(allLayersSelector(input)).toEqual([]);
    });

});
