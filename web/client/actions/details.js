/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const OPEN_DETAILS_PANEL = 'DETAILS:OPEN_DETAILS_PANEL';
export const CLOSE_DETAILS_PANEL = 'DETAILS:CLOSE_DETAILS_PANEL';
export const UPDATE_DETAILS = 'MAPS:UPDATE_DETAILS';
export const DETAILS_LOADED = 'DETAILS:DETAILS_LOADED';
export const NO_DETAILS_AVAILABLE = "NO_DETAILS_AVAILABLE";

/**
 * updates details section
 * @memberof actions.details
 * @return {action}        type `UPDATE_DETAILS`
*/
export const updateDetails = (detailsText) => ({
    type: UPDATE_DETAILS,
    detailsText
});

/**
 * detailsLoaded
 * @memberof actions.details
 * @return {action}        type `DETAILS_LOADED`
*/
export const detailsLoaded = (mapId, detailsUri, detailsSettings) => ({
    type: DETAILS_LOADED,
    mapId,
    detailsUri,
    detailsSettings
});

/**
 * openDetailsPanel
 * @memberof actions.details
 * @return {action}        type `OPEN_DETAILS_PANEL`
*/
export const openDetailsPanel = () => ({
    type: OPEN_DETAILS_PANEL
});

/**
 * closeDetailsPanel
 * @memberof actions.details
 * @return {action}        type `CLOSE_DETAILS_PANEL`
*/
export const closeDetailsPanel = () => ({
    type: CLOSE_DETAILS_PANEL
});
