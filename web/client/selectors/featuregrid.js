const {head, get} = require('lodash');
const {layersSelector} = require('./layers');
const getLayerById = (state, id) => head(layersSelector(state).filter(l => l.id === id));
const getTitle = (layer = {}) => layer.title || layer.name;
const selectedLayerIdSelector = state => get(state, "featuregrid.selectedLayer");
const getCustomAttributeSettings = (state, att) => get(state, `featuregrid.attributes[${att.name || att.attribute}]`);
const {attributesSelector} = require('./query');
const selectedFeaturesSelector = state => state && state.featuregrid && state.featuregrid.select;
const changesSelector = state => state && state.featuregrid && state.featuregrid.changes;
const newFeaturesSelector = state => state && state.featuregrid && state.featuregrid.newFeatures;
const selectedFeatureSelector = state => head(selectedFeaturesSelector(state));
const {findGeometryProperty} = require('../utils/ogc/WFS/base');
const geomTypeSelectedFeatureSelector = state => findGeometryProperty(state.query.featureTypes[state.query.filterObj.featureTypeName].original).localType;
const {isSimpleGeomType} = require('../utils/MapUtils');
const {toChangesMap} = require('../utils/FeatureGridUtils');

const hasGeometrySelectedFeature = (state) => {
    let ft = selectedFeatureSelector(state);
    if (ft) {
        let changes = toChangesMap(changesSelector(state));
        if (changes[ft.id] && changes[ft.id].geometry !== null) {
            return true;
        }
        if (changes[ft.id] && changes[ft.id].geometry === null) {
            return false;
        }
        if (ft._new && head(newFeaturesSelector(state)) && head(newFeaturesSelector(state)).geometry === null ) {
            return false;
        }
        if (ft._new && head(newFeaturesSelector(state)) && head(newFeaturesSelector(state)).geometry !== null ) {
            return true;
        }
        if (ft.geometry === null) {
            return false;
        }
        return true;
    }
    return false;
};
const hasChangesSelector = state => changesSelector(state) && changesSelector(state).length > 0;
const hasNewFeaturesSelector = state => newFeaturesSelector(state) && newFeaturesSelector(state).length > 0;
module.exports = {
  selectedLayerIdSelector,
  getTitleSelector: state => getTitle(
    getLayerById(
        state,
        selectedLayerIdSelector(state)
    )),
    getCustomizedAttributes: state => {
        return (attributesSelector(state) || []).map(att => {
            const custom = getCustomAttributeSettings(state, att);
            if (custom) {
                return {
                    ...att,
                    ...custom
                };
            }
            return att;
        });
    },
    modeSelector: state => state && state.featuregrid && state.featuregrid.mode,
    selectedFeaturesSelector,
    selectedFeatureSelector,
    selectedFeaturesCount: state => (selectedFeaturesSelector(state) || []).length,
    changesSelector,
    toChangesMap,
    changesMapSelector: state => toChangesMap(changesSelector(state)),
    hasChangesSelector,
    hasGeometrySelector: state => hasGeometrySelectedFeature(state),
    newFeaturesSelector,
    hasNewFeaturesSelector,
    isSavingSelector: state => state && state.featuregrid && state.featuregrid.saving,
    isSavedSelector: state => state && state.featuregrid && state.featuregrid.saved,
    isDrawingSelector: state => state && state.featuregrid && state.featuregrid.drawing,
    geomTypeSelectedFeatureSelector,
    hasNewFeaturesOrChanges: state => hasNewFeaturesSelector(state) || hasChangesSelector(state),
    isSimpleGeomSelector: state => isSimpleGeomType(geomTypeSelectedFeatureSelector(state))
};
