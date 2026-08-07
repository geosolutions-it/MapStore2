/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MAX_CACHE_ENTRIES = 500;
// Store promises so concurrent renders can share the same in-flight request.
const requestCache = new Map();

/**
 * Builds a key that isolates requests by identify run, feature and query.
 */
export const createExternalDataCacheKey = ({
    identifyRequestId,
    sourceFeatureId,
    sourceFeatureIndex,
    url,
    typeName,
    cqlFilter
}) => JSON.stringify([
    identifyRequestId,
    sourceFeatureId,
    sourceFeatureIndex,
    url,
    typeName,
    cqlFilter
]);

export const getExternalDataCacheEntry = (key) =>
    requestCache.get(key)?.request;

/**
 * Caches an external WFS request and associates it with its identify run.
 */
export const setExternalDataCacheEntry = (key, request, identifyRequestId) => {
    if (requestCache.size >= MAX_CACHE_ENTRIES) {
        requestCache.delete(requestCache.keys().next().value);
    }
    requestCache.set(key, { identifyRequestId, request });
    return request;
};

export const deleteExternalDataCacheEntry = (key) => {
    requestCache.delete(key);
};

/**
 * Drops every cached request, for example when the session ends.
 */
export const clearExternalDataCache = () => {
    requestCache.clear();
};

/**
 * Removes cached requests when their identify results are discarded.
 */
export const clearExternalDataCacheForIdentifyRequests = (identifyRequestIds = []) => {
    const requestIds = new Set(identifyRequestIds.filter(Boolean));
    if (!requestIds.size) {
        return;
    }
    requestCache.forEach((entry, key) => {
        if (requestIds.has(entry.identifyRequestId)) {
            requestCache.delete(key);
        }
    });
};
