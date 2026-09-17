/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil } from 'lodash';

import { createFeatureFilter } from './FilterUtils';

/**
 * Helpers to serve a filter request from features already in memory, for the
 * sources that carry their data instead of querying a service.
 * @name VectorFeaturesUtils
 * @memberof utils
 */

/**
 * Wrap an array of GeoJSON features into a feature collection
 * @param {object[]} [features=[]] the features
 * @returns {object} the feature collection
 */
export const toFeatureCollection = (features = []) => ({
    crs: {type: "name", properties: {name: "urn:ogc:def:crs:EPSG::4326"}},
    numberMatched: features.length,
    numberReturned: features.length,
    totalFeatures: features.length,
    type: 'FeatureCollection',
    features
});

// nil values are pushed to the end, whatever the sort order
const compareValues = (a, b) => {
    if (isNil(a) && isNil(b)) {
        return 0;
    }
    if (isNil(a)) {
        return 1;
    }
    if (isNil(b)) {
        return -1;
    }
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    return `${a}`.toLowerCase().localeCompare(`${b}`.toLowerCase());
};

const sortFeatures = (features, { sortBy, sortOrder }) => [...features].sort((a, b) => {
    const avalue = a?.properties?.[sortBy];
    const bvalue = b?.properties?.[sortBy];
    if (isNil(avalue) || isNil(bvalue)) {
        return compareValues(avalue, bvalue);
    }
    const diff = compareValues(avalue, bvalue);
    return sortOrder === "ASC" ? diff : -1 * diff;
});

/**
 * Apply the attribute filters, the sort options and the pagination of a request
 * to a set of features. `totalFeatures` counts the matches, not the returned page.
 * @param {object[]} [features=[]] the features
 * @param {object} [filterObj={}] the filter object
 * @param {object} [pagination={}] `startIndex` and `maxFeatures`, the whole set when absent
 * @returns {object} the resulting feature collection
 */
export const filterFeatureCollection = (features = [], filterObj = {}, { startIndex, maxFeatures } = {}) => {
    const filtered = filterObj.filterFields?.length
        ? features.filter(createFeatureFilter(filterObj))
        : features;
    const { sortBy, sortOrder } = filterObj.sortOptions || {};
    const sorted = sortBy && sortOrder && sortOrder !== "NONE"
        ? sortFeatures(filtered, filterObj.sortOptions)
        : filtered;
    const page = isNil(startIndex) || isNil(maxFeatures)
        ? sorted
        : sorted.slice(startIndex, startIndex + maxFeatures);
    return {
        ...toFeatureCollection(page),
        numberMatched: sorted.length,
        totalFeatures: sorted.length
    };
};
