const {get, head} = require('lodash');
module.exports = {
    wfsURL: state => state && state.query && state.query.searchUrl,
    wfsURLSelector: state => state && state.query && state.query.url,
    wfsFilter: state => state && state.query && state.query.filterObj,
    attributesSelector: state => get(state, `query.featureTypes.${get(state, "query.filterObj.featureTypeName")}.attributes`),
    typeNameSelector: state => get(state, "query.typeName"),
    resultsSelector: (state) => get(state, "query.result.features"),
    featureCollectionResultSelector: state => get(state, "query.result"),
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
    isDescribeLoaded: (state, name) => !!get(state, `query.featureTypes.${name}`),
    describeSelector: (state) => get(state, `query.featureTypes.${get(state, "query.filterObj.featureTypeName")}.original`),
    featureLoadingSelector: (state) => get(state, "query.featureLoading"),
    isSyncWmsActive: (state) => get(state, "query.syncWmsFilter", false)
};
