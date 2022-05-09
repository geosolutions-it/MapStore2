/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import CoordinatesUtils from '../utils/CoordinatesUtils';

import { createSelector } from 'reselect';
import {get, memoize} from 'lodash';
import {detectIdentifyInMapPopUp} from "../utils/MapUtils";

/**
 * selects map state
 * @name map
 * @memberof selectors
 * @static
 */

/**
 * get the current map configuration from state
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {object} the map configuration
 */
export const mapSelector = (state) => state.map && state.map.present || state.map || state.config && state.config.map || null;

export const projectionSelector = createSelector([mapSelector], (map) => map && map.projection);
export const stateMapIdSelector = (state) => get(mapSelector(state), "mapId") && parseInt(get(mapSelector(state), "mapId"), 10) || null;
export const mapIdSelector = (state) => get(state, "mapInitialConfig.mapId") && parseInt(get(state, "mapInitialConfig.mapId"), 10) || stateMapIdSelector(state);
export const mapInfoSelector = state => get(mapSelector(state), "info");
export const mapInfoLoadingSelector = state => get(mapSelector(state), "loadingInfo", false);
export const mapSaveErrorsSelector = state => get(mapSelector(state), "mapSaveErrors");
export const mapInfoDetailsUriFromIdSelector = state => get(mapInfoSelector(state), "details");
export const mapInfoDetailsSettingsFromIdSelector = state => get(mapInfoSelector(state), "detailsSettings");
export const mapIsEditableSelector = state => {
    const mapInfoCanEdit = get(mapInfoSelector(state), 'canEdit');
    if (mapInfoCanEdit === undefined) {
        return get(state, 'context.resource.canEdit');
    }
    return mapInfoCanEdit;
};

// TODO: move these in selectors/localConfig.js or selectors/config.js
export const projectionDefsSelector = (state) => state.localConfig && state.localConfig.projectionDefs || [];
export const mapConstraintsSelector = state => state.localConfig && state.localConfig.mapConstraints || {};
export const configuredRestrictedExtentSelector = (state) => mapConstraintsSelector(state).restrictedExtent;
export const configuredExtentCrsSelector = (state) => mapConstraintsSelector(state).crs;
export const configuredMinZoomSelector = state => {
    const constraints = mapConstraintsSelector(state);
    const projection = projectionSelector(state);
    return projection && get(constraints, `projectionsConstraints["${projection}"].minZoom`) || get(constraints, 'minZoom');
};
// END localConfig selectors

export const mapLimitsSelector = state => get(mapSelector(state), "limits");
export const mapBboxSelector = state => get(mapSelector(state), "bbox");
export const minZoomSelector = state => get(mapLimitsSelector(state), "minZoom");
export const resolutionsSelector = state => get(mapSelector(state), "resolutions");

/**
 * Get the scales of the current map
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {number[]} the scales of the map
 */
export const scalesSelector = createSelector(
    [resolutionsSelector, projectionSelector],
    (resolutions, projection) => {
        if (resolutions && projection) {
            const units = CoordinatesUtils.getUnits(projection);
            const dpm = 96 * (100 / 2.54);
            return resolutions.map((resolution) => resolution * dpm * (units === 'degrees' ? 111194.87428468118 : 1));
        }
        return [];
    }
);
/**
 * Get version of the map
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {number} version of the map
 */
export const mapVersionSelector = (state) => state.map && state.map.present && state.map.present.version || 1;
/**
 * Get name/title of the map
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {string} name/title of the map
 */
export const mapNameSelector = (state) => state.map && state.map.present && state.map.present.info && state.map.present.info.name || '';

export const mapSizeSelector = (state) => state?.map?.present?.size ?? 0;

export const mapSizeValuesSelector = memoize((attributes = {}) => createSelector(
    mapSizeSelector,
    (sizes) => {
        return sizes && Object.keys(sizes).filter(key =>
            attributes[key]).reduce((a, key) => {
            return ({...a, [key]: sizes[key]});
        },
        {}) || {};
    }
), (attributes) => JSON.stringify(attributes));

export const mouseMoveListenerSelector = (state) => get(mapSelector(state), 'eventListeners.mousemove', []);

export const isMouseMoveActiveSelector = (state) => !!mouseMoveListenerSelector(state).length;

export const isMouseMoveCoordinatesActiveSelector = (state) => mouseMoveListenerSelector(state).includes('mouseposition');

export const isMouseMoveIdentifyActiveSelector = (state) => {
    return mouseMoveListenerSelector(state).includes('identifyFloatingTool');
};

export const identifyFloatingToolSelector = (state) => {
    return mouseMoveListenerSelector(state).includes('identifyFloatingTool') || state.mode === "embedded" || (state.mapPopups?.popups && detectIdentifyInMapPopUp(state));
};

