/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get, omit } from 'lodash';
import set from 'lodash/fp/set';

const normalizeUrl = url => {
    const [path, query = ''] = String(url || '').split('?');
    const params = query.split('&').filter(param => param && !/^_v_=/.test(param)).sort();
    return path.replace(/\/$/, '') + (params.length ? `?${params.join('&')}` : '');
};

// IDs identify map instances, not datasets: widget copies can have different IDs.
export const getLayerRefreshKey = (layer = {}) => JSON.stringify([
    layer.type,
    [].concat(layer.url || layer.tileMapUrl || layer.provider || layer.sources?.map(source => source.url) || '').map(normalizeUrl).sort(),
    layer.name || '',
    layer.security?.sourceId || ''
]);

export const addRefreshParameter = (url, version) => {
    if (!url || version === undefined) return url;
    const [base, hash] = url.split('#');
    const [path, query = ''] = base.split('?');
    const params = query.split('&').filter(param => param && !/^_v_=/.test(param));
    return `${path}?${[...params, `_v_=${encodeURIComponent(version)}`].join('&')}${hash ? `#${hash}` : ''}`;
};

/** Return layer paths without traversing filters, dependencies, or arbitrary widget data. */
export const getWidgetLayerPaths = (widget = {}) => {
    const paths = [];
    const add = path => { if (get(widget, path)) paths.push(path); };
    add(['layer']);
    (widget.traces || []).forEach((trace, index) => add(['traces', index, 'layer']));
    (widget.charts || []).forEach((chart, index) => {
        add(['charts', index, 'layer']);
        (chart.traces || []).forEach((trace, traceIndex) => add(['charts', index, 'traces', traceIndex, 'layer']));
    });
    (widget.map?.layers || []).forEach((layer, index) => add(['map', 'layers', index]));
    (widget.maps || []).forEach((map, index) => {
        (map.layers || []).forEach((layer, layerIndex) => add(['maps', index, 'layers', layerIndex]));
    });
    return paths;
};

export const stripWidgetLayerVersions = widget => getWidgetLayerPaths(widget).reduce((result, path) => {
    const layer = get(result, path);
    return layer._v_ === undefined ? result : set(path, omit(layer, '_v_'), result);
}, widget);

export const stripWidgetsLayerVersions = widgets => {
    if (!widgets) return widgets;
    const result = Array.isArray(widgets) ? widgets.map(stripWidgetLayerVersions)
        : Object.keys(widgets).reduce((acc, key) => ({ ...acc, [key]: stripWidgetLayerVersions(widgets[key]) }), {});
    return Object.keys(widgets).every(key => widgets[key] === result[key]) ? widgets : result;
};
