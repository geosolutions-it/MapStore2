/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { isNil, get, head, isArray, findIndex } from 'lodash';

/**
 * Selects the featureType name of the query filterObject
 * @param {object} state
 */
export const queryFeatureTypeName = state => get(state, "query.filterObj.featureTypeName");
/**
 * Create a selector for the featureType data (attributes and so on) for the featureType provided as parameter
 * @param {string} featureTypeName
 * @return {function} a selector to get the featureType data
 */
export const featureTypeSelectorCreator = (featureTypeName) => state => get(state, `query.featureTypes["${featureTypeName}"]`);

/**
 * Returns the original DescribeFeature JSON object of the passed featureType from the state
 * @param {object} state the application state
 * @param {string} featureTypeName the featureType name
 */
export const layerDescribeSelector = (state, featureTypeName) => get(featureTypeSelectorCreator(featureTypeName)(state), 'original');

/**
 * selects query state
 * @name query
 * @memberof selectors
 * @static
 */


export const wfsURL = state => state && state.query && state.query.searchUrl;
export const wfsURLSelector = state => state && state.query && state.query.url;
export const wfsFilter = state => state && state.query && state.query.filterObj;
export const attributesSelector = state => get(featureTypeSelectorCreator(queryFeatureTypeName(state))(state), `attributes`);
export const typeNameSelector = state => get(state, "query.typeName");
export const resultsSelector = (state) => get(state, "query.result.features");
export const featureCollectionResultSelector = state => {
    const results = get(state, "query.result");
    return {
        ...results,
        features: (results && results.features || []).filter(f => !isNil(f.geometry))
    };
};
export const getFeatureById = (state, id) => {
    let features = state && state.query && state.query.result && state.query.result.features;
    return head(features.filter(f => f.id === id));
};
export const paginationInfo = {
    startIndex: (state) => get(state, "query.filterObj.pagination.startIndex"),
    maxFeatures: (state) => get(state, "query.filterObj.pagination.maxFeatures"),
    resultSize: (state) =>get(state, "query.result.features.length"),
    totalFeatures: (state) => get(state, "query.result.totalFeatures")
};
export const isDescribeLoaded = (state, name) => {
    const ft = featureTypeSelectorCreator(name)(state);
    if (ft && ft.attributes && ft.geometry && ft.original) {
        return true;
    }
    return false;
};
export const describeSelector = (state) => layerDescribeSelector(state, queryFeatureTypeName(state));
export const featureLoadingSelector = (state) => get(state, "query.featureLoading");
export const isSyncWmsActive = (state) => get(state, "query.syncWmsFilter", false);
/**
 * return true if a filter is applied to query
 * @memberof selectors.query
 * @param  {object} state the state
 * @return {boolean}
 */
export const isFilterActive = state => {
    const crossLayerFilter = get(state, 'query.filterObj.crossLayerFilter');
    const spatialField = get(state, 'query.filterObj.spatialField');
    const filterFields = get(state, 'query.filterObj.filterFields');
    return !!(filterFields && head(filterFields)
    || spatialField && (spatialField.method && spatialField.operation && spatialField.geometry ||
        isArray(spatialField) && findIndex(spatialField, field => field.method && field.operation && field.geometry) > -1)
    || crossLayerFilter && crossLayerFilter.collectGeometries && crossLayerFilter.operation);
};
