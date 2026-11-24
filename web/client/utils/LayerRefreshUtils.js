/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get, omit } from 'lodash';
import set from 'lodash/fp/set';

/**
 * Dataset identity, refresh URL parameters and widget serialization helpers.
 * @memberof utils
 * @static
 * @name LayerRefreshUtils
 */

/**
 * Normalize a service URL by sorting query parameters and removing `_v_` and a trailing slash.
 * @param {string} url Service URL or tile URL template.
 * @returns {string} URL used to compare dataset identities.
 * @private
 */
const normalizeUrl = url => {
    const [path, query = ''] = String(url || '').split('?');
    const params = query.split('&').filter(param => param && !/^_v_=/.test(param)).sort();
    return path.replace(/\/$/, '') + (params.length ? `?${params.join('&')}` : '');
};

/**
 * Identify a dataset by layer type, normalized URLs, name and security source.
 * Layer IDs and refresh versions are excluded so map and widget copies share a key.
 * @function getLayerRefreshKey
 * @param {object} [layer={}] MapStore layer configuration.
 * @returns {string} Serialized dataset identity.
 * @memberof utils.LayerRefreshUtils
 */
export const getLayerRefreshKey = (layer = {}) => JSON.stringify([
    layer.type,
    [].concat(layer.url || layer.tileMapUrl || layer.provider || layer.sources?.map(source => source.url) || '').map(normalizeUrl).sort(),
    layer.name || '',
    layer.security?.sourceId || ''
]);

/**
 * Add or replace the `_v_` cache-busting query parameter, preserving templates and fragments.
 * @function addRefreshParameter
 * @param {string} url Request URL or tile URL template.
 * @param {number|string} [version] Refresh version; undefined leaves the URL unchanged.
 * @returns {string} Updated URL, or the original value when the URL or version is absent.
 * @memberof utils.LayerRefreshUtils
 */
export const addRefreshParameter = (url, version) => {
    if (!url || version === undefined) return url;
    const [base, hash] = url.split('#');
    const [path, query = ''] = base.split('?');
    const params = query.split('&').filter(param => param && !/^_v_=/.test(param));
    return `${path}?${[...params, `_v_=${encodeURIComponent(version)}`].join('&')}${hash ? `#${hash}` : ''}`;
};

/**
 * Find layer paths in widgets, traces, charts and embedded maps.
 * Filters, dependencies and other arbitrary widget data are not traversed.
 * @function getWidgetLayerPaths
 * @param {object} [widget={}] Widget configuration.
 * @returns {Array<Array<string|number>>} Paths relative to the widget, suitable for lodash get/set.
 * @memberof utils.LayerRefreshUtils
 */
export const getWidgetLayerPaths = (widget = {}) => {
    const paths = [];
    /**
     * Collect a path only when a layer exists there.
     * @param {Array<string|number>} path Candidate widget layer path.
     * @returns {void}
     */
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

/**
 * Remove transient `_v_` values from a widget's layers without mutating it.
 * Saved refresh intervals and widget-specific layer options are preserved.
 * @function stripWidgetLayerVersions
 * @param {object} widget Widget configuration.
 * @returns {object} Updated widget, or the original reference when no versions are present.
 * @memberof utils.LayerRefreshUtils
 */
export const stripWidgetLayerVersions = widget => getWidgetLayerPaths(widget).reduce((result, path) => {
    const layer = get(result, path);
    return layer._v_ === undefined ? result : set(path, omit(layer, '_v_'), result);
}, widget);

/**
 * Remove transient layer versions before saving or comparing a widget collection.
 * @function stripWidgetsLayerVersions
 * @param {object[]|object} widgets Widget array or object indexed by widget ID.
 * @returns {object[]|object} Collection of the same shape, preserving its reference if unchanged.
 * Falsy input is returned unchanged.
 * @memberof utils.LayerRefreshUtils
 */
export const stripWidgetsLayerVersions = widgets => {
    if (!widgets) return widgets;
    const result = Array.isArray(widgets) ? widgets.map(stripWidgetLayerVersions)
        : Object.keys(widgets).reduce((acc, key) => ({ ...acc, [key]: stripWidgetLayerVersions(widgets[key]) }), {});
    return Object.keys(widgets).every(key => widgets[key] === result[key]) ? widgets : result;
};
