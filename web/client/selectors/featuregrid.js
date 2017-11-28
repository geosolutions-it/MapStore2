 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const {head, get, isObject} = require('lodash');
const {layersSelector} = require('./layers');
const {findGeometryProperty} = require('../utils/ogc/WFS/base');
const {currentLocaleSelector} = require('../selectors/locale');
const {isSimpleGeomType} = require('../utils/MapUtils');
const {toChangesMap} = require('../utils/FeatureGridUtils');

const getLayerById = (state, id) => head(layersSelector(state).filter(l => l.id === id));
const getTitle = (layer = {}) => layer.title || layer.name;
const selectedLayerIdSelector = state => get(state, "featuregrid.selectedLayer");
const getCustomAttributeSettings = (state, att) => get(state, `featuregrid.attributes[${att.name || att.attribute}]`);
const {attributesSelector} = require('./query');
const selectedFeaturesSelector = state => state && state.featuregrid && state.featuregrid.select;
const changesSelector = state => state && state.featuregrid && state.featuregrid.changes;
const newFeaturesSelector = state => state && state.featuregrid && state.featuregrid.newFeatures;
const selectedFeatureSelector = state => head(selectedFeaturesSelector(state));

const geomTypeSelectedFeatureSelector = state => {
    let desc = get(state, `query.featureTypes.${get(state, "query.filterObj.featureTypeName")}.original`);
    if (desc) {
        const geomDesc = findGeometryProperty(desc);
        return geomDesc && geomDesc.localType;
    }
};


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

const notSupportedGeometries = ['Geometry', 'GeometryCollection'];

const hasSupportedGeometry = state => head(notSupportedGeometries.filter(g => geomTypeSelectedFeatureSelector(state) === g)) ? false : true;
const hasChangesSelector = state => changesSelector(state) && changesSelector(state).length > 0;
const hasNewFeaturesSelector = state => newFeaturesSelector(state) && newFeaturesSelector(state).length > 0;
const getAttributeFilters = state => state && state.featuregrid && state.featuregrid.filters;

/**
 * selects featuregrid state
 * @name featuregrid
 * @memberof selectors
 * @static
 */
module.exports = {
  /**
   * selects the state of featuregrid open
   * @memberof selectors.featuregrid
   * @param  {object}  state applications state
   * @return {Boolean}       true if the featuregrid is open, false otherwise
   */
  isFeatureGridOpen: state => state && state.featuregrid && state.featuregrid.open,
  getAttributeFilters,
  /**
   * get a filter for an attribute
   * @memberof selectors.featuregrid
   * @param  {object} state Application's state
   * @param  {string} name  The name of the attribute
   * @return {object}       The filter for the attribute
   */
  getAttributeFilter: (state, name) => get(getAttributeFilters(state), name),
  selectedLayerIdSelector,
  getCustomAttributeSettings,
  /**
   * Get's the title of the selected layer
   * @memberof selectors.featuregrid
   * @param  {object} state the application's state
   * @return {startDrawingFeature} the title of the current selected layer
   */
  getTitleSelector: state => {
      const title = getTitle(getLayerById(state, selectedLayerIdSelector(state)));
      return isObject(title) ? title[currentLocaleSelector(state)] || title.default || '' : title;
  },
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
    editingAllowedRolesSelector: state => get(state, "featuregrid.editingAllowedRoles", ["ADMIN"]),
    isSavedSelector: state => state && state.featuregrid && state.featuregrid.saved,
    isDrawingSelector: state => state && state.featuregrid && state.featuregrid.drawing,
    geomTypeSelectedFeatureSelector,
    hasNewFeaturesOrChanges: state => hasNewFeaturesSelector(state) || hasChangesSelector(state),
    isSimpleGeomSelector: state => isSimpleGeomType(geomTypeSelectedFeatureSelector(state)),
    canEditSelector: state => state && state.featuregrid && state.featuregrid.canEdit,
    /**
     * check if the feature geometry is supported for editing
     * @function
     * @memberof selectors.featuregrid
     * @param  {object}  state applications state
     * @return {boolean}       true if the geometry is supported, false otherwise
     */
    hasSupportedGeometry,
    getDockSize: state => state.featuregrid && state.featuregrid.dockSize
};
