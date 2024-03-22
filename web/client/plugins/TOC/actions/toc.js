/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const UPDATE_TOC_CONFIG = 'TOC:UPDATE_CONFIG';
/**
 * update configuration for table of content
 * @param {object} payload properties to update
 * @return {object} of type `UPDATE_TOC_CONFIG` with payload
 */
export const updateTOCConfig = (payload) => ({
    type: UPDATE_TOC_CONFIG,
    payload
});
