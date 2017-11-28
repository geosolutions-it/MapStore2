const {get} = require('lodash');
const {createSelector} = require('reselect');

const {layersSelector} = require('./layers');

const crossLayerFilterSelector = state => get(state, "queryform.crossLayerFilter");
// TODO we should also check if the layer are from the same source to allow cross layer filtering
const availableCrossLayerFilterLayersSelector = state =>(layersSelector(state) || []).filter(({type} = {}) => type === "wms");
const spatialFieldGeomSelector = state => get(state, "queryform.spatialField.geometry");
const spatialFieldSelector = state => get(state, "queryform.spatialField");
const filterFieldsSelector = state => get(state, "queryform.filterFields", []);
const groupFieldsSelector = state => get(state, "queryform.groupFields", []);
const featureTypeNameSelector = state => get(state, "queryform.featureTypeName");
const filterTypeSelector = state => get(state, "queryform.filterType");
const ogcVersionSelector = state => get(state, "queryform.ogcVersion");
const filterObjSelector = createSelector(spatialFieldSelector, filterFieldsSelector, groupFieldsSelector, featureTypeNameSelector, filterTypeSelector, ogcVersionSelector, (spatialField, filterFields, groupFields, featureTypeName, filterType, ogcVersion) => ({
        spatialField,
        filterFields,
        groupFields,
        featureTypeName,
        filterType,
        ogcVersion
}));

module.exports = {
    spatialFieldSelector,
    spatialFieldMethodSelector: state => get(state, "queryform.spatialField.method"),
    spatialFieldGeomSelector,
    maxFeaturesWPSSelector: state => get(state, "queryform.maxFeaturesWPS"),
    spatialFieldGeomTypeSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).type || "Polygon",
    spatialFieldGeomProjSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).projection || "EPSG:4326",
    spatialFieldGeomCoordSelector: state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).coordinates || [],
    crossLayerFilterSelector,
    availableCrossLayerFilterLayersSelector,
    filterObjSelector
};
