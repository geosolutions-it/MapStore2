/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const CoordinatesUtils = require('../utils/CoordinatesUtils');
const {createSelector} = require('reselect');
const {get} = require('lodash');

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
const mapSelector = (state) => state.map && state.map.present || state.map || state.config && state.config.map || null;

const projectionSelector = createSelector([mapSelector], (map) => map && map.projection);
const stateMapIdSelector = (state) => get(mapSelector(state), "mapId") && parseInt(get(mapSelector(state), "mapId"), 10) || null;
const mapIdSelector = (state) => get(state, "mapInitialConfig.mapId") && parseInt(get(state, "mapInitialConfig.mapId"), 10) || stateMapIdSelector(state);
const mapInfoSelector = state => get(mapSelector(state), "info");
const mapInfoLoadingSelector = state => get(mapSelector(state), "loadingInfo", false);
const mapSaveErrorsSelector = state => get(mapSelector(state), "mapSaveErrors");
const mapInfoDetailsUriFromIdSelector = state => get(mapInfoSelector(state), "details");
const mapInfoDetailsSettingsFromIdSelector = state => get(mapInfoSelector(state), "detailsSettings");
const mapIsEditableSelector = state => {
    const mapInfoCanEdit = get(mapInfoSelector(state), 'canEdit');
    if (mapInfoCanEdit === undefined) {
        return get(state, 'context.resource.canEdit');
    }
    return mapInfoCanEdit;
};

// TODO: move these in selectors/localConfig.js or selectors/config.js
const projectionDefsSelector = (state) => state.localConfig && state.localConfig.projectionDefs || [];
const mapConstraintsSelector = state => state.localConfig && state.localConfig.mapConstraints || {};
const configuredRestrictedExtentSelector = (state) => mapConstraintsSelector(state).restrictedExtent;
const configuredExtentCrsSelector = (state) => mapConstraintsSelector(state).crs;
const configuredMinZoomSelector = state => {
    const constraints = mapConstraintsSelector(state);
    const projection = projectionSelector(state);
    return projection && get(constraints, `projectionsConstraints["${projection}"].minZoom`) || get(constraints, 'minZoom');
};
// END localConfig selectors

const mapLimitsSelector = state => get(mapSelector(state), "limits");
const minZoomSelector = state => get(mapLimitsSelector(state), "minZoom" );
const resolutionsSelector = state => get(mapSelector(state), "resolutions");

/**
 * Get the scales of the current map
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {number[]} the scales of the map
 */
const scalesSelector = createSelector(
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
const mapVersionSelector = (state) => state.map && state.map.present && state.map.present.version || 1;
/**
 * Get name/title of the map
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {string} name/title of the map
 */
const mapNameSelector = (state) => state.map && state.map.present && state.map.present.info && state.map.present.info.name || '';

const mouseMoveListenerSelector = (state) => get(mapSelector(state), 'eventListeners.mousemove', []);

const isMouseMoveActiveSelector = (state) => !!mouseMoveListenerSelector(state).length;

const isMouseMoveCoordinatesActiveSelector = (state) => mouseMoveListenerSelector(state).includes('mouseposition');

const isMouseMoveIdentifyActiveSelector = (state) =>  mouseMoveListenerSelector(state).includes('identifyFloatingTool');

module.exports = {
    mapInfoDetailsUriFromIdSelector,
    mapInfoDetailsSettingsFromIdSelector,
    mapSelector,
    scalesSelector,
    projectionSelector,
    minZoomSelector,
    mapIdSelector,
    projectionDefsSelector,
    mapVersionSelector,
    mapNameSelector,
    configuredMinZoomSelector,
    configuredExtentCrsSelector,
    configuredRestrictedExtentSelector,
    mapInfoSelector,
    mapInfoLoadingSelector,
    mapSaveErrorsSelector,
    mapIsEditableSelector,
    mouseMoveListenerSelector,
    isMouseMoveActiveSelector,
    isMouseMoveCoordinatesActiveSelector,
    isMouseMoveIdentifyActiveSelector
};
