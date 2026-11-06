/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { getLayerRefreshKey, addRefreshParameter, getWidgetLayerPaths, stripWidgetLayerVersions } from '../LayerRefreshUtils';
import { compareDashboardDataChanges } from '../GeostoreUtils';
import { saveLayer } from '../LayersUtils';
import { widgetsConfig } from '../../selectors/widgets';

describe('LayerRefreshUtils', () => {
    const layer = { id: 'one', type: 'wms', url: '/wms', name: 'roads', autoRefreshInterval: 60000, _v_: 123 };
    it('uses source identity instead of map/widget IDs and keeps services distinct', () => {
        expect(getLayerRefreshKey(layer)).toBe(getLayerRefreshKey({ ...layer, id: 'two' }));
        expect(getLayerRefreshKey(layer)).toNotBe(getLayerRefreshKey({ ...layer, url: '/other' }));
        expect(getLayerRefreshKey(layer)).toNotBe(getLayerRefreshKey({ ...layer, security: { sourceId: 'protected' } }));
    });
    it('normalizes query order without changing query values or tile templates', () => {
        expect(getLayerRefreshKey({ ...layer, url: '/wms/?b=2&a=1&_v_=1' })).toBe(getLayerRefreshKey({ ...layer, url: '/wms?a=1&b=2' }));
        expect(addRefreshParameter('/tiles/{z}/{x}/{y}?token=abc&_v_=1&style=a#hash', 2)).toBe('/tiles/{z}/{x}/{y}?token=abc&style=a&_v_=2#hash');
    });
    it('strips transient versions at every supported widget layer path, retaining intervals', () => {
        const widget = { layer, charts: [{ traces: [{ layer }] }], maps: [{ layers: [layer] }], map: { layers: [layer] } };
        const stripped = stripWidgetLayerVersions(widget);
        expect(getWidgetLayerPaths(widget).length).toBe(4);
        expect(stripped.layer._v_).toBe(undefined);
        expect(stripped.charts[0].traces[0].layer.autoRefreshInterval).toBe(60000);
        expect(stripped.maps[0].layers[0]._v_).toBe(undefined);
        expect(stripped.map.layers[0]._v_).toBe(undefined);
        expect(widget.layer._v_).toBe(123);
    });
    it('does not dirty a dashboard on a version-only change, but detects interval changes', () => {
        const initial = { layouts: [], widgets: [{ id: 'counter', layer }] };
        expect(compareDashboardDataChanges({ ...initial, widgets: [{ id: 'counter', layer: { ...layer, _v_: 456 } }] }, initial)).toBe(false);
        expect(compareDashboardDataChanges({ ...initial, widgets: [{ id: 'counter', layer: { ...layer, autoRefreshInterval: 120000 } }] }, initial)).toBe(true);
    });
    it('omits versions from dashboard serialization and retains millisecond intervals', () => {
        const saved = widgetsConfig({ widgets: { containers: { floating: { widgets: [{ id: 'counter', layer }] } } } });
        expect(saved.widgets[0].layer._v_).toBe(undefined);
        expect(saved.widgets[0].layer.autoRefreshInterval).toBe(60000);
        expect(saveLayer(layer)._v_).toBe(undefined);
        expect(saveLayer(layer).autoRefreshInterval).toBe(60000);
        expect('autoRefreshInterval' in saveLayer({ type: 'wms' })).toBe(false);
    });
});
