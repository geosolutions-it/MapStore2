/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEmpty, isEqual, omit, isArray, isObject, isString } from 'lodash';
import merge from 'lodash/fp/merge';
import uuid from 'uuid/v1';

const NODATA = 'NODATA';
/**
 * returns and empty string when the value is `NODATA`
 * @param {string} value resource attribute value
 * @return {string} the value or empty string when value is `NODATA`
 */
export const parseNODATA = (value) => value === NODATA ? '' : value;

export const resourceTypes = {
    MAP: {
        icon: { glyph: '1-map', type: 'glyphicon' },
        formatViewerPath: (resource) => {
            const extras = resource['@extras'];
            if (extras?.context?.name) {
                return `/context/${extras.context.name}/${resource.id}`;
            }
            return `/viewer/${resource.id}`;
        }
    },
    DASHBOARD: {
        icon: { glyph: 'dashboard', type: 'glyphicon' },
        formatViewerPath: (resource) => {
            return `/dashboard/${resource.id}`;
        }
    },
    GEOSTORY: {
        icon: { glyph: 'geostory', type: 'glyphicon' },
        formatViewerPath: (resource) => {
            return `/geostory/${resource.id}`;
        }
    },
    CONTEXT: {
        icon: { glyph: 'cogs' },
        formatViewerPath: (resource) => {
            return `/context/${resource.name}`;
        }
    }
};
/**
 * returns and empty string when the value is `NODATA`
 * @param {object} resource resource properties
 * @return {object} resource parsed information { title, icon, thumbnailUrl, viewerPath, viewerUrl }
 */
export const getResourceTypesInfo = (resource) => {
    const thumbnailUrl = parseNODATA(resource?.attributes?.thumbnail);
    const title = resource?.name || '';
    const { icon, formatViewerPath } = resourceTypes[resource?.category?.name] || {};
    const viewerPath = resource?.id && formatViewerPath ? formatViewerPath(resource) : undefined;
    return {
        title,
        icon,
        thumbnailUrl,
        viewerPath,
        viewerUrl: `#${viewerPath}`
    };
};
/**
 * returns resource status items
 * @param {object} resource resource properties
 * @return {object} resource status items
 */
export const getResourceStatus = (resource = {}) => {
    const extras = resource['@extras'];
    return {
        items: [
            ...(resource.advertised === false ? [{
                type: 'icon',
                tooltipId: 'resourcesCatalog.unadvertised',
                glyph: 'eye-slash'
            }] : []),
            ...(extras?.context?.name ? [{
                type: 'icon',
                glyph: 'cogs',
                tooltipId: 'resourcesCatalog.mapUsesContext',
                tooltipParams: {
                    contextName: extras.context.name
                }
            }] : [])
        ]
    };
};
/**
 * returns resource identifier
 * @param {object} resource resource properties
 * @return {string} resource id
 */
export const getResourceId = (resource) => {
    return resource?.id;
};

const recursivePendingChanges = (a, b) => {
    return Object.keys(a).reduce((acc, key) => {
        if (!isArray(a[key]) && isObject(a[key])) {
            const obj = recursivePendingChanges(a[key], b?.[key]);
            return isEmpty(obj) ? acc : { ...acc, [key]: obj };
        }
        return !isEqual(a[key], b?.[key])
            ? { ...acc, [key]: a[key] }
            : acc;
    }, {});
};
/**
 * compare initial and current resource and it returns pending changes
 * @param {object} initialResource initial resource properties
 * @param {object} resource resource properties including changes applied in the viewer
 * @param {object} data optional data configuration of the resource
 * @return {object} pending changes object { initialResource, resource, saveResource, changes } where `saveResource` is the resource ready to be saved and `changes` contains the changed properties
 */
export const computePendingChanges = (initialResource, resource, resourceData) => {
    const { attributes: pendingAttributes = {}, tags, ...pendingChanges } = recursivePendingChanges(resource, initialResource);
    const attributesKeys = [
        'thumbnail',
        'details'
    ];
    const categoryOptions = {
        'thumbnail': {
            // this forces the reload the thumbnail image when updated
            tail: `/raw?decode=datauri&v=${uuid()}`,
            category: 'THUMBNAIL'
        },
        'details': {
            category: 'DETAILS'
        }
    };
    const linkedResources = attributesKeys.reduce((acc, key) => {
        const value = initialResource?.attributes?.[key] || NODATA;
        const data = pendingAttributes?.[key] || NODATA;
        if (pendingAttributes?.[key] !== undefined && value !== data) {
            return {
                ...acc,
                [key]: {
                    ...categoryOptions[key],
                    value,
                    data
                }
            };
        }
        return acc;
    }, {});
    const attributes = omit(pendingAttributes, attributesKeys);
    const excludedMetadata = ['permissions', 'attributes', 'data', 'category', 'tags'];
    const metadata = merge(omit(initialResource, excludedMetadata), omit(pendingChanges, excludedMetadata));
    const mergedAttributes = merge(initialResource.attributes, attributes) || {};
    // check only the changed tags
    const unlinkTags = (initialResource?.tags || []).filter(tag => !(resource?.tags || []).find(t => t.id === tag.id)).map(tag => ({ tag, action: 'unlink' }));
    const linkTags = (resource?.tags || []).filter(tag => !(initialResource?.tags || []).find(t => t.id === tag.id)).map(tag => ({ tag, action: 'link' }));
    const mergedTags = [...unlinkTags, ...linkTags];
    return {
        initialResource,
        resource,
        saveResource: {
            id: initialResource.id,
            ...(resourceData?.payload && { data: resourceData.payload }),
            permission: pendingChanges.permissions ?? initialResource.permissions,
            category: initialResource?.category?.name,
            ...(mergedTags?.length && { tags: mergedTags }),
            metadata: {
                ...metadata,
                attributes: Object.fromEntries(Object.keys(mergedAttributes || {}).map((key) => {
                    return [key, isObject(mergedAttributes[key])
                        ? JSON.stringify(mergedAttributes[key])
                        : mergedAttributes[key]];
                }))
            },
            ...(!isEmpty(linkedResources) && { linkedResources })
        },
        changes: {
            ...pendingChanges,
            ...(mergedTags?.length && { tags: mergedTags }),
            ...(!isEmpty(attributes) && { attributes }),
            ...(!isEmpty(linkedResources) && { linkedResources }),
            ...(resourceData?.pending && { data: true })
        }
    };
};
/* parse a stringify obj from resource properties */
const parseStringifyProperties = (property) => {
    if (isString(property)) {
        try {
            return JSON.parse(property);
        } catch (e) {
            return {};
        }
    }
    return property || {};
};
/**
 * parse all properties of a resource and it returns a valid resource
 * @param {object} resource resource properties
 * @return {object} resource with parsed properties (eg, detailsSettings object parsed from string)
 */
export const parseResourceProperties = (resource) => {
    const detailsSettings = parseStringifyProperties(resource?.attributes?.detailsSettings);
    return {
        ...resource,
        attributes: {
            ...resource?.attributes,
            detailsSettings
        }
    };
};
