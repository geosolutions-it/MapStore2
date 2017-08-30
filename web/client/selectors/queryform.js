const spatialFieldGeomSelector = state => state && state.queryform && state.queryform.spatialField && state.queryform.spatialField.geometry;

module.exports = {
    spatialFieldSelector: state => state && state.queryform && state.queryform.spatialField,
    spatialFieldGeomSelector,
    spatialFieldGeomTypeSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).type || "Polygon",
    spatialFieldGeomProjSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).projection || "EPSG:4326",
    spatialFieldGeomCoordSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).coordinates || []
};
