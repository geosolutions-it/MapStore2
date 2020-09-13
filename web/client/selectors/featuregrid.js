/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const { head, get, isObject} = require('lodash');
const { getLayerFromId} = require('./layers');
const {findGeometryProperty} = require('../utils/ogc/WFS/base');
const {currentLocaleSelector} = require('../selectors/locale');
const {isSimpleGeomType} = require('../utils/MapUtils');
const {toChangesMap} = require('../utils/FeatureGridUtils');
const { layerDimensionSelectorCreator } = require('./dimension');
const {userRoleSelector} = require('./security');
const {isCesium} = require('./maptype');


const getLayerById = getLayerFromId;
const getTitle = (layer = {}) => layer.title || layer.name;
const selectedLayerIdSelector = state => get(state, "featuregrid.selectedLayer");
const chartDisabledSelector = state => get(state, "featuregrid.chartDisabled", false);
const getCustomAttributeSettings = (state, att) => get(state, `featuregrid.attributes[${att.name || att.attribute}]`);
const { attributesSelector, describeSelector } = require('./query');
const selectedFeaturesSelector = state => state && state.featuregrid && state.featuregrid.select;
const changesSelector = state => state && state.featuregrid && state.featuregrid.changes;
const newFeaturesSelector = state => state && state.featuregrid && state.featuregrid.newFeatures;
const selectedFeatureSelector = state => head(selectedFeaturesSelector(state));

const geomTypeSelectedFeatureSelector = state => {
    let desc = describeSelector(state);
    if (desc) {
        const geomDesc = findGeometryProperty(desc);
        return geomDesc && geomDesc.localType;
    }
    return null;
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
const selectedLayerParamsSelector = state => get(getLayerById(state, selectedLayerIdSelector(state)), "params");
const selectedLayerSelector = state => getLayerById(state, selectedLayerIdSelector(state));
const editingAllowedRolesSelector = state => get(state, "featuregrid.editingAllowedRoles", ["ADMIN"]);
const canEditSelector = state => state && state.featuregrid && state.featuregrid.canEdit;
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
    showAgainSelector: state => get(state, "featuregrid.showAgain", false),
    /**
     * determines if the time sync button should be shown
     */
    showTimeSync: state => {
        const showEnabled = get(state, "featuregrid.showTimeSync", false);
        if (showEnabled) {
            const layerId = selectedLayerIdSelector(state);
            return layerDimensionSelectorCreator({id: layerId}, 'time')(state);
        }
        return null;
    },
    timeSyncActive: state => get(state, "featuregrid.timeSync", false),
    showPopoverSyncSelector: state => get(state, "featuregrid.showPopoverSync", true),
    isSavingSelector: state => state && state.featuregrid && state.featuregrid.saving,
    editingAllowedRolesSelector,
    isSavedSelector: state => state && state.featuregrid && state.featuregrid.saved,
    isDrawingSelector: state => state && state.featuregrid && state.featuregrid.drawing,
    geomTypeSelectedFeatureSelector,
    chartDisabledSelector,
    hasNewFeaturesOrChanges: state => hasNewFeaturesSelector(state) || hasChangesSelector(state),
    isSimpleGeomSelector: state => isSimpleGeomType(geomTypeSelectedFeatureSelector(state)),
    canEditSelector,
    /**
     * check if the feature geometry is supported for editing
     * @function
     * @memberof selectors.featuregrid
     * @param  {object}  state applications state
     * @return {boolean}       true if the geometry is supported, false otherwise
     */
    hasSupportedGeometry,
    getDockSize: state => state.featuregrid && state.featuregrid.dockSize,
    /**
     * get selected layer name
     * @function
     * @memberof selectors.featuregrid
     * @param  {object}  state applications state
     * @return {string}       name of selected layer
     */
    selectedLayerNameSelector: state => {
        const layer = getLayerById(state, selectedLayerIdSelector(state));
        return layer && layer.name || '';

    },
    /**
     * Returns well known vendor params of the selected layer to be used in feature grid.
     * returns an object that contains `viewParams` and `cqlFilter` getting them from the params object of the layer
     */
    queryOptionsSelector: state => {
        const params = selectedLayerParamsSelector(state);
        const viewParams = params && (params.VIEWPARAMS || params.viewParams || params.viewparams);
        const cqlFilter = params && (params.CQL_FILTER || params.cqlFilter || params.cql_filter);
        return {
            viewParams,
            cqlFilter
        };
    },
    isEditingAllowedSelector: state => {
        const role = userRoleSelector(state);
        const editingAllowedRoles = editingAllowedRolesSelector(state) || ['ADMIN'];
        const canEdit = canEditSelector(state);

        return (editingAllowedRoles.indexOf(role) !== -1 || canEdit) && !isCesium(state);
    },
    selectedLayerSelector
};
