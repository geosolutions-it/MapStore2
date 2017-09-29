const {get} = require('lodash');
const spatialFieldGeomSelector = state => get(state, "queryform.spatialField.geometry");

module.exports = {
    spatialFieldSelector: state => get(state, "queryform.spatialField"),
    spatialFieldMethodSelector: state => get(state, "queryform.spatialField.method"),
    spatialFieldGeomSelector,
    maxFeaturesWPSSelector: state => get(state, "queryform.maxFeaturesWPS"),
    spatialFieldGeomTypeSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).type || "Polygon",
    spatialFieldGeomProjSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).projection || "EPSG:4326",
    spatialFieldGeomCoordSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).coordinates || []
};
