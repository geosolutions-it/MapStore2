const {get} = require('lodash');
const {createSelector} = require('reselect');

const {layersSelector} = require('./layers');

const {currentLocaleSelector} = require('./locale');

const {getLocalizedProp} = require('../utils/LocaleUtils');

const crossLayerFilterSelector = state => get(state, "queryform.crossLayerFilter");
// TODO we should also check if the layer are from the same source to allow cross layer filtering
const availableCrossLayerFilterLayersSelector = state =>(layersSelector(state) || []).filter(({type, group} = {}) => type === "wms" && group !== "background").map(({title, ...layer}) => ({...layer, title: getLocalizedProp(currentLocaleSelector(state), title)}));
const spatialFieldGeomSelector = state => get(state, "queryform.spatialField.geometry");
const spatialFieldSelector = state => get(state, "queryform.spatialField");
const attributePanelExpandedSelector = state => get(state, "queryform.attributePanelExpanded");
const spatialPanelExpandedSelector = state => get(state, "queryform.spatialPanelExpanded");
const crossLayerExpandedSelector = state => get(state, "queryform.crossLayerExpanded");
const queryFormUiStateSelector = createSelector(attributePanelExpandedSelector, spatialPanelExpandedSelector, crossLayerExpandedSelector, (attributePanelExpanded, spatialPanelExpanded, crossLayerExpanded) => ({
    attributePanelExpanded,
    spatialPanelExpanded,
    crossLayerExpanded
}));
const storedFilterSelector = state => get(state, "layerFilter.persisted");
const appliedFilterSelector = state => get(state, "layerFilter.applied");

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
    queryFormUiStateSelector,
    storedFilterSelector,
    appliedFilterSelector
};
