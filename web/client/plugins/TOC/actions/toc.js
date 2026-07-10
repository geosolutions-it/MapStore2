/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const UPDATE_TOC_CONFIG = 'TOC:UPDATE_CONFIG';
export const TOC_INITIALIZATION_CONSUMED = 'TOC:INITIALIZATION_CONSUMED';
/**
 * update configuration for table of content
 * @param {object} payload properties to update
 * @return {object} of type `UPDATE_TOC_CONFIG` with payload
 */
export const updateTOCConfig = (payload) => ({
    type: UPDATE_TOC_CONFIG,
    payload
});

/**
 * mark a table of content initialization as consumed
 * @param {number} mapLoadedCount current map configuration load count
 * @return {object} of type `TOC_INITIALIZATION_CONSUMED` with mapLoadedCount
 */
export const consumeTOCInitialization = (mapLoadedCount) => ({
    type: TOC_INITIALIZATION_CONSUMED,
    mapLoadedCount
});
