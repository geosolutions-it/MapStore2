/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

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

/**
 * replaces paths in a resource object with corresponding values.
 * @param {array|object} value value to be transformed
 * @param {object} resource - The resource object used to resolve values via paths.
 * @param {object} [facets=[]] - Optional array of facet objects
 * @returns {array|object} The transformed value with resolved resource paths and facet data (if any)
 */
export const replaceResourcePaths = (value, resource, facets = []) => {
    if (isArray(value)) {
        return value.map(val => replaceResourcePaths(val, resource, facets));
    }
    if (isObject(value)) {
        const facet = facets.find(fc => fc.id === value.facet);
        const valuePath = value.path && { value: get(resource, value.path) };
        return Object.keys(value).reduce((acc, key) => ({
            ...acc,
            [key]: replaceResourcePaths(value[key], resource, facets)
        }), { ...facet, ...valuePath });
    }
    return value;
};

export const getSupportedResourceTypes = (availableResourceTypes, user) => {
    if (isArray(availableResourceTypes)) {
        return availableResourceTypes;
    }
    return availableResourceTypes?.[user?.role]
        ? availableResourceTypes[user?.role]
        : availableResourceTypes?.anonymous || [];
};

export const isMenuItemSupportedSupported = (item, availableResourceTypes, user) => {
    if (item.disableIf) {
        return false;
    }
    if (item.resourceType === undefined) {
        return true;
    }
    const supportedResourceTypes = getSupportedResourceTypes(availableResourceTypes, user);
    return supportedResourceTypes.includes(item.resourceType);
};
