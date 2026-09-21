/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isEqual from 'lodash/isEqual';
import isArray from 'lodash/isArray';
import findLast from 'lodash/findLast';
import { isVectorFormat } from './VectorTileUtils';
import { optionsToVendorParams } from './VendorParamsUtils';
import { getWMSURLs, wmsToOpenlayersOptions } from './openlayers/WMSUtils';
import { getConfigProp } from './ConfigUtils';

export const SHARED_KEYS = [
    'baseParams',
    'format',
    'localizedLayerStyles',
    'maxResolution',
    'minResolution',
    'params',
    'security',
    'securityToken',
    'srs',
    'tiled',
    'tileGrids',
    'tileGridStrategy',
    'tileSize',
    'transparent',
    'version'
];

export const BLOCKED_PARAMS = [
    'CQL_FILTER',
    'FILTER',
    'SLD_BODY',
    'SLD',
    'SORTBY',
    'VIEWPARAMS'
];


export const DEFAULT_MAX_GROUP_SIZE = 30;

const getMaxURLLength = () => getConfigProp('miscSettings')?.maxURLLength || Infinity;

const sameURLs = (a, b) => {
    // TODO probably should we need to sort url items before, for a better comparison
    return isEqual(getWMSURLs(isArray(a) ? a : [a]), getWMSURLs(isArray(b) ? b : [b]));
};

const hasBlockedParam = (layer) => {
    const params = optionsToVendorParams(layer) || {};
    return BLOCKED_PARAMS.some((key) => params[key] !== undefined);
};

const isCoalescable = (layer) => {
    if (layer.coalesce === false) {
        return false;
    }
    if (layer.type !== 'wms') {
        return false;
    }
    if (layer.useForElevation) {
        return false;
    }
    if (layer.group === 'background') {
        return false;
    }
    if (isVectorFormat(layer.format)) {
        return false;
    }
    return !hasBlockedParam(layer);
};

const mergeVisibleLayerParams = (members) => {
    const visible = members.filter((m) => m.visibility !== false);
    return {
        name: visible.map((m) => m.name).join(','),
        style: visible.map((m) => m.style ?? '').join(',')
    };
};

/**
 * Estimates the length of the GetMap request URL that would be generated at coalescing time for the given options.
 * (Approximation excludes BBOX/WIDTH/HEIGHT)
 */
export const estimateWMSRequestURLLength = (options) => {
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const params = wmsToOpenlayersOptions(options) || {};
    const queryString = Object.keys(params)
        .filter((key) => params[key] !== undefined && params[key] !== null)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    return (urls[0] || '').length + 1 + queryString.length;
};

export const mergeable = (a, b) => {
    if (a.coalesce === false || b.coalesce === false) {
        return false;
    }
    if (a.type !== 'wms' || b.type !== 'wms') {
        return false;
    }
    if (a.useForElevation || b.useForElevation) {
        return false;
    }
    if (a.group === 'background' || b.group === 'background') {
        return false;
    }
    if (isVectorFormat(a.format) || isVectorFormat(b.format)) {
        return false;
    }
    if (!!a.singleTile !== !!b.singleTile) {
        return false;
    }
    if ((a.opacity ?? 1) !== (b.opacity ?? 1)) {
        return false;
    }
    if (!sameURLs(a.url, b.url)) {
        return false;
    }
    if (hasBlockedParam(a) || hasBlockedParam(b)) {
        return false;
    }
    return SHARED_KEYS.every((key) => isEqual(a[key], b[key]));
};

export const chunkWhile = (items = [], predicate) => {
    const chunks = [];
    items.forEach((item, index) => {
        const chunk = chunks[chunks.length - 1];
        if (index > 0 && predicate(items[index - 1], item, chunk)) {
            chunk.push(item);
            return;
        }
        chunks.push([item]);
    });
    return chunks;
};

export const defaultGroupKeyGen = (members) => `wmsgroup:${members.map((m) => m.id).join(',')}`;

export const defaultGroupCondition = (prev, item, chunk, {
    maxGroupSize = DEFAULT_MAX_GROUP_SIZE,
    maxURLLength = getMaxURLLength(),
    excludeIds
} = {}) => {
    const reference = findLast(chunk, (m) => m.visibility !== false);
    if (!reference) {
        return false;
    }
    if (excludeIds?.includes(reference.id) || excludeIds?.includes(item.id)) {
        return false;
    }
    if (item.visibility === false) {
        return isCoalescable(item);
    }
    if (!mergeable(reference, item)) {
        return false;
    }
    const members = [...chunk, item];
    if (members.filter((m) => m.visibility !== false).length > maxGroupSize) {
        return false;
    }
    const { name, style } = mergeVisibleLayerParams(members);
    const getRequestLength = estimateWMSRequestURLLength({ ...reference, name, style });
    return getRequestLength <= maxURLLength;
};

export const toGroupUnit = (members, groupKey) => {
    const visible = members.filter((m) => m.visibility !== false);
    const key = (groupKey && groupKey(members)) || defaultGroupKeyGen(members);
    const versions = members.map((m) => m._v_).filter((v) => v !== undefined);
    return {
        key,
        options: {
            ...(visible[0] || members[0]),
            id: key,
            type: 'wms',
            ...mergeVisibleLayerParams(members),
            visibility: visible.length > 0,
            _coalesceGroupIds: members.map((m) => m.id),
            ...(versions.length ? { _v_: Math.max(...versions) } : {})
        }
    };
};

/**
 * Groups WMS layers into coalesced LayerNodes based on their mergeability and a maximum group size.
 * @param {Array} layers - The array of WMS layers to be grouped.
 * @param {Object} options - Options for grouping.
 * @param {function} options. - The condition function to determine if layers should be grouped together.
 * @param {function} options.groupKeyGen - The function to generate a unique key for the grouped layers.
 * @param {Array} options.excludeIds - Ids of layers that must never be coalesced, e.g. the layer currently used by Swipe.
 * @returns {Array} An array of grouped WMS layers.
 */
export const groupWMSLayers = (layers = [], {maxGroupSize, groupCondition, groupKeyGen = defaultGroupKeyGen, excludeIds} = {}) =>
    chunkWhile(layers, groupCondition || ((prev, item, chunk) => defaultGroupCondition(prev, item, chunk, { maxGroupSize, excludeIds })))
        .reduce((units, run) => run.filter((layer) => layer.visibility !== false).length < 2
            ? [...units, ...run.map((layer) => ({ key: layer.id || layer.name, options: layer }))]
            : [...units, toGroupUnit(run, groupKeyGen)]
        , []);
