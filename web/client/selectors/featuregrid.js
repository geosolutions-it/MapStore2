/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import { head, get, isObject } from 'lodash';

import { getLayerFromId } from './layers';
import { findGeometryProperty } from '../utils/ogc/WFS/base';
import { currentLocaleSelector } from './locale';
import { isSimpleGeomType } from '../utils/MapUtils';
import { toChangesMap } from '../utils/FeatureGridUtils';
import { layerDimensionSelectorCreator } from './dimension';
import { userRoleSelector } from './security';
import { isCesium } from './maptype';
import { attributesSelector, describeSelector } from './query';


export const getLayerById = getLayerFromId;
export const getTitle = (layer = {}) => layer.title || layer.name;
export const selectedLayerIdSelector = state => get(state, "featuregrid.selectedLayer");
export const chartDisabledSelector = state => get(state, "featuregrid.chartDisabled", false);
export const getCustomAttributeSettings = (state, att) => get(state, `featuregrid.attributes[${att.name || att.attribute}]`);
export const selectedFeaturesSelector = state => state && state.featuregrid && state.featuregrid.select;
export const changesSelector = state => state && state.featuregrid && state.featuregrid.changes;
export const newFeaturesSelector = state => state && state.featuregrid && state.featuregrid.newFeatures;
export const selectedFeatureSelector = state => head(selectedFeaturesSelector(state));

export const geomTypeSelectedFeatureSelector = state => {
    let desc = describeSelector(state);
    if (desc) {
        const geomDesc = findGeometryProperty(desc);
        return geomDesc && geomDesc.localType;
    }
    return null;
};


export const hasGeometrySelectedFeature = (state) => {
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

export const notSupportedGeometries = ['Geometry', 'GeometryCollection'];

export const hasSupportedGeometry = state => head(notSupportedGeometries.filter(g => geomTypeSelectedFeatureSelector(state) === g)) ? false : true;
export const hasChangesSelector = state => changesSelector(state) && changesSelector(state).length > 0;
export const hasNewFeaturesSelector = state => newFeaturesSelector(state) && newFeaturesSelector(state).length > 0;
export const getAttributeFilters = state => state && state.featuregrid && state.featuregrid.filters;
export const selectedLayerParamsSelector = state => get(getLayerById(state, selectedLayerIdSelector(state)), "params");
export const selectedLayerSelector = state => getLayerById(state, selectedLayerIdSelector(state));
export const editingAllowedRolesSelector = state => get(state, "featuregrid.editingAllowedRoles", ["ADMIN"]);
export const canEditSelector = state => state && state.featuregrid && state.featuregrid.canEdit;
/**
 * selects featuregrid state
 * @name featuregrid
 * @memberof selectors
 * @static
 */


/**
 * selects the state of featuregrid open
 * @memberof selectors.featuregrid
 * @param  {object}  state applications state
 * @return {Boolean}       true if the featuregrid is open, false otherwise
 */
export const isFeatureGridOpen = state => state && state.featuregrid && state.featuregrid.open;

/**
 * get a filter for an attribute
 * @memberof selectors.featuregrid
 * @param  {object} state Application's state
 * @param  {string} name  The name of the attribute
 * @return {object}       The filter for the attribute
 */
export const getAttributeFilter = (state, name) => get(getAttributeFilters(state), name);
/**
 * Get's the title of the selected layer
 * @memberof selectors.featuregrid
 * @param  {object} state the application's state
 * @return {startDrawingFeature} the title of the current selected layer
 */
export const getTitleSelector = state => {
    const title = getTitle(getLayerById(state, selectedLayerIdSelector(state)));
    return isObject(title) ? title[currentLocaleSelector(state)] || title.default || '' : title;
};
export const getCustomizedAttributes = state => {
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
};
export const modeSelector = state => state && state.featuregrid && state.featuregrid.mode;
export const selectedFeaturesCount = state => (selectedFeaturesSelector(state) || []).length;
export const changesMapSelector = state => toChangesMap(changesSelector(state));
export const hasGeometrySelector = state => hasGeometrySelectedFeature(state);
export const showAgainSelector = state => get(state, "featuregrid.showAgain", false);
/**
 * determines if the time sync button should be shown
 */
export const showTimeSync = state => {
    const showEnabled = get(state, "featuregrid.showTimeSync", false);
    if (showEnabled) {
        const layerId = selectedLayerIdSelector(state);
        return layerDimensionSelectorCreator({id: layerId}, 'time')(state);
    }
    return null;
};
export const timeSyncActive = state => get(state, "featuregrid.timeSync", false);
export const showPopoverSyncSelector = state => get(state, "featuregrid.showPopoverSync", true);
export const isSavingSelector = state => state && state.featuregrid && state.featuregrid.saving;
export const isSavedSelector = state => state && state.featuregrid && state.featuregrid.saved;
export const isDrawingSelector = state => state && state.featuregrid && state.featuregrid.drawing;
export const multiSelect = state => get(state, "featuregrid.multiselect", false);

export const hasNewFeaturesOrChanges = state => hasNewFeaturesSelector(state) || hasChangesSelector(state);
export const isSimpleGeomSelector = state => isSimpleGeomType(geomTypeSelectedFeatureSelector(state));
/**
 * check if the feature geometry is supported for editing
 * @function
 * @memberof selectors.featuregrid
 * @param  {object}  state applications state
 * @return {boolean}       true if the geometry is supported, false otherwise
 */
export const getDockSize = state => state.featuregrid && state.featuregrid.dockSize;
/**
 * get selected layer name
 * @function
 * @memberof selectors.featuregrid
 * @param  {object}  state applications state
 * @return {string}       name of selected layer
 */
export const selectedLayerNameSelector = state => {
    const layer = getLayerById(state, selectedLayerIdSelector(state));
    return layer && layer.name || '';

};
/**
 * Returns well known vendor params of the selected layer to be used in feature grid.
 * returns an object that contains `viewParams` and `cqlFilter` getting them from the params object of the layer
 */
export const queryOptionsSelector = state => {
    const params = selectedLayerParamsSelector(state);
    const viewParams = params && (params.VIEWPARAMS || params.viewParams || params.viewparams);
    const cqlFilter = params && (params.CQL_FILTER || params.cqlFilter || params.cql_filter);
    return {
        viewParams,
        cqlFilter
    };
};
export const isEditingAllowedSelector = state => {
    const role = userRoleSelector(state);
    const editingAllowedRoles = editingAllowedRolesSelector(state) || ['ADMIN'];
    const canEdit = canEditSelector(state);

    return (editingAllowedRoles.indexOf(role) !== -1 || canEdit) && !isCesium(state);
};
export const paginationSelector = state => get(state, "featuregrid.pagination");
