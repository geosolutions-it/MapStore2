const {get} = require('lodash');
const filteredspatialObject = state => get(state, state && state.featuregrid.showFilteredObject && "query.filterObj.spatialField");
const filteredGeometry = state => get(state, "query.filterObj.spatialField.geometry");

module.exports = {
    selectedFeatures: (state) => get(state, state && state.highlight && state.highlight.featuresPath || "highlight.emptyFeatures"),
    filteredspatialObjectType: (state) => filteredspatialObject(state) && filteredGeometry(state).type || "Polygon",
    filteredspatialObjectCoord: (state) => filteredGeometry(state) && filteredGeometry(state).coordinates || [],
    filteredSpatialObjectCrs: (state) => filteredGeometry(state) && filteredGeometry(state).projection,
    filteredSpatialObjectId: (state) => filteredGeometry(state) && filteredGeometry(state).id,
    filteredspatialObject,
    filteredGeometry

};
