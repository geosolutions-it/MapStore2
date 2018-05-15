const {get} = require('lodash');
const filteredspatialObject = state => get(state, state && state.featuregrid.open && state.featuregrid.showFilteredObject && "query.filterObj.spatialField" || "emptyObject");
const filteredGeometry = state => filteredspatialObject(state) && filteredspatialObject(state).geometry;

module.exports = {
    selectedFeatures: (state) => get(state, state && state.highlight && state.highlight.featuresPath || "highlight.emptyFeatures"),
    filteredspatialObjectType: (state) => filteredspatialObject(state) && filteredGeometry(state).type || "Polygon",
    filteredspatialObjectCoord: (state) => filteredGeometry(state) && filteredGeometry(state).coordinates || [],
    filteredSpatialObjectCrs: (state) => filteredGeometry(state) && filteredGeometry(state).projection || "EPSG:3857",
    filteredSpatialObjectId: (state) => filteredGeometry(state) && filteredGeometry(state).id || "spatial_object",
    filteredspatialObject,
    filteredGeometry

};
