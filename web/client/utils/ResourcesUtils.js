/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import get from 'lodash/get';

/**
 * return the resource info
 * @param {object} resource resource properties
 * @return {object} resource parsed information `{ title, icon, thumbnailUrl, viewerPath, viewerUrl }`
 */
export const getResourceInfo = (resource) => {
    return get(resource, '@extras.info', {});
};

/**
 * returns resource status items
 * @param {object} resource resource properties
 * @return {object} resource status items `{ items: [{ type, tooltipId, glyph, tooltipParams }] }`
 */
export const getResourceStatus = (resource = {}) => {
    return get(resource, '@extras.status', {});
};
