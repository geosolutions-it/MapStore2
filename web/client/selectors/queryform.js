const {get} = require('lodash');
const {layersSelector} = require('./layers');
const spatialFieldGeomSelector = state => get(state, "queryform.spatialField.geometry");
const crossLayerFilterSelector = state => get(state, "queryform.crossLayerFilter");
// TODO we should also check if the layer are from the same source to allow cross layer filtering
const availableCrossLayerFilterLayersSelector = state =>(layersSelector(state) || []).filter(({type} = {}) => type === "wms");
module.exports = {
    spatialFieldSelector: state => get(state, "queryform.spatialField"),
    spatialFieldMethodSelector: state => get(state, "queryform.spatialField.method"),
    spatialFieldGeomSelector,
    maxFeaturesWPSSelector: state => get(state, "queryform.maxFeaturesWPS"),
    spatialFieldGeomTypeSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).type || "Polygon",
    spatialFieldGeomProjSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).projection || "EPSG:4326",
    spatialFieldGeomCoordSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).coordinates || [],
    crossLayerFilterSelector,
    availableCrossLayerFilterLayersSelector
};
