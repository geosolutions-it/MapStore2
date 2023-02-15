/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { get } from 'lodash';
import { createSelector } from 'reselect';
import { layersSelector } from './layers';
import { currentLocaleSelector } from './locale';
import { getLocalizedProp } from '../utils/LocaleUtils';

export const crossLayerFilterSelector = state => get(state, "queryform.crossLayerFilter");
// TODO we should also check if the layer are from the same source to allow cross layer filtering
export const availableCrossLayerFilterLayersSelector = state =>(layersSelector(state) || []).filter(({type, group} = {}) => type === "wms" && group !== "background").map(({title, ...layer}) => ({...layer, title: getLocalizedProp(currentLocaleSelector(state), title)}));
export const spatialFieldGeomSelector = state => get(state, "queryform.spatialField.geometry");
export const spatialFieldSelector = state => get(state, "queryform.spatialField");
export const attributePanelExpandedSelector = state => get(state, "queryform.attributePanelExpanded");
export const spatialPanelExpandedSelector = state => get(state, "queryform.spatialPanelExpanded");
export const crossLayerExpandedSelector = state => get(state, "queryform.crossLayerExpanded");
export const queryFormUiStateSelector = createSelector(attributePanelExpandedSelector, spatialPanelExpandedSelector, crossLayerExpandedSelector, (attributePanelExpanded, spatialPanelExpanded, crossLayerExpanded) => ({
    attributePanelExpanded,
    spatialPanelExpanded,
    crossLayerExpanded
}));
export const storedFilterSelector = state => get(state, "layerFilter.persisted");
export const appliedFilterSelector = state => get(state, "layerFilter.applied");

export const spatialFieldMethodSelector = state => get(state, "queryform.spatialField.method");
export const maxFeaturesWPSSelector = state => get(state, "queryform.maxFeaturesWPS");
export const spatialFieldGeomTypeSelector = state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).type || "Polygon";
export const spatialFieldGeomProjSelector = state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).projection || "EPSG =4326";
export const spatialFieldGeomCoordSelector = state => spatialFieldGeomSelector(state) && spatialFieldGeomSelector(state).coordinates || [];

/**
 * This selector returns the "inner" filters from the queryform.
 * The inner filters are the filters that are inside the queryForm but not associated to `attributeFields` `spatialField` or `crossLayerFilter`.
 * These are additional filters that can be added to the queryform by external plugins.
 * TODO: move the attributeFields, spatialField and crossLayerFilter inside the queryform state in a future version of MapStore with a new standard format.
 * @param {object} state
 * @returns {object[]} the inner filters from the queryform
 */
export const filtersSelector = state => get(state, "queryform.filters") || [];

/**
 * Creates a selector that returns the filter with the given id from the queryform.
 * @param {string} id the id of the filter to get
 * @returns {function} a selector that returns the filter with the given id from the queryform.
 */
export const filtersSelectorCreator = (id) => state => filtersSelector(state).find(({id: filterId}) => filterId === id);
