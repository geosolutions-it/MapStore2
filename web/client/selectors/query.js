const {isNil, get, head} = require('lodash');

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
    attributesSelector: state => get(state, `query.featureTypes.${get(state, "query.filterObj.featureTypeName")}.attributes`),
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
        const ft = get(state, `query.featureTypes.${name}`);
        if (ft && ft.attributes && ft.geometry && ft.original) {
            return true;
        }
        return false;
    },
    describeSelector: (state) => get(state, `query.featureTypes.${get(state, "query.filterObj.featureTypeName")}.original`),
    layerDescribeSelector: (state, featureTypeName) =>get(state, `query.featureTypes.[${featureTypeName}].original`),
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
        || spatialField && spatialField.method && spatialField.operation && spatialField.geometry
        || crossLayerFilter && crossLayerFilter.collectGeometries && crossLayerFilter.operation);
    }
};
