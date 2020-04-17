const {isNil, get, head, isArray, findIndex} = require('lodash');

/**
 * Selects the featureType name of the query filterObject
 * @param {object} state
 */
const queryFeatureTypeName = state => get(state, "query.filterObj.featureTypeName");
/**
 * Create a selector for the featureType data (attributes and so on) for the featureType provided as parameter
 * @param {string} featureTypeName
 * @return {function} a selector to get the featureType data
 */
const featureTypeSelectorCreator = (featureTypeName) => state => get(state, `query.featureTypes["${featureTypeName}"]`);

/**
 * Returns the original DescribeFeature JSON object of the passed featureType from the state
 * @param {object} state the application state
 * @param {string} featureTypeName the featureType name
 */
const layerDescribeSelector = (state, featureTypeName) => get(featureTypeSelectorCreator(featureTypeName)(state), 'original');

/**
 * selects query state
 * @name query
 * @memberof selectors
 * @static
 */

module.exports = {
    wfsURL: state => state && state.query && state.query.searchUrl,
    wfsURLSelector: state => state && state.query && state.query.url,
    wfsFilter: state => state && state.query && state.query.filterObj,
    attributesSelector: state => get(featureTypeSelectorCreator(queryFeatureTypeName(state))(state), `attributes`),
    typeNameSelector: state => get(state, "query.typeName"),
    resultsSelector: (state) => get(state, "query.result.features"),
    featureCollectionResultSelector: state => {
        const results = get(state, "query.result");
        return {
            ...results,
            features: (results && results.features || []).filter(f => !isNil(f.geometry))
        };
    },
    getFeatureById: (state, id) => {
        let features = state && state.query && state.query.result && state.query.result.features;
        return head(features.filter(f => f.id === id));
    },
    paginationInfo: {
        startIndex: (state) => get(state, "query.filterObj.pagination.startIndex"),
        maxFeatures: (state) => get(state, "query.filterObj.pagination.maxFeatures"),
        resultSize: (state) =>get(state, "query.result.features.length"),
        totalFeatures: (state) => get(state, "query.result.totalFeatures")
    },
    isDescribeLoaded: (state, name) => {
        const ft = featureTypeSelectorCreator(name)(state);
        if (ft && ft.attributes && ft.geometry && ft.original) {
            return true;
        }
        return false;
    },
    describeSelector: (state) => layerDescribeSelector(state, queryFeatureTypeName(state)),
    featureTypeSelectorCreator,
    layerDescribeSelector,
    featureLoadingSelector: (state) => get(state, "query.featureLoading"),
    isSyncWmsActive: (state) => get(state, "query.syncWmsFilter", false),
    /**
     * return true if a filter is applied to query
     * @memberof selectors.query
     * @param  {object} state the state
     * @return {boolean}
     */
    isFilterActive: state => {
        const crossLayerFilter = get(state, 'query.filterObj.crossLayerFilter');
        const spatialField = get(state, 'query.filterObj.spatialField');
        const filterFields = get(state, 'query.filterObj.filterFields');
        return !!(filterFields && head(filterFields)
        || spatialField && (spatialField.method && spatialField.operation && spatialField.geometry ||
            isArray(spatialField) && findIndex(spatialField, field => field.method && field.operation && field.geometry) > -1)
        || crossLayerFilter && crossLayerFilter.collectGeometries && crossLayerFilter.operation);
    }
};
