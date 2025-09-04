/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEmpty, isEqual, omit, isArray, isObject, isString, castArray } from 'lodash';
import merge from 'lodash/fp/merge';
import uuid from 'uuid/v1';

// ******************************************
//              RESOURCE UTILS
// ******************************************

const NODATA = 'NODATA';
/**
 * returns and empty string when the value is `NODATA`
 * @param {string} value resource attribute value
 * @return {string} the value or empty string when value is `NODATA`
 */
export const parseNODATA = (value) => value === NODATA ? '' : value;

export const DETAILS_DATA_KEY = '@detailsData';
export const THUMBNAIL_DATA_KEY = '@thumbnailData';

/**
 * Checks if a resource has context but no context permission
 * @param {Object} resource - The resource object to check
 * @param {Object} context - The context object (can be null/undefined)
 * @returns {boolean} True if resource has context but no context permission
 */
export const isContextMapWithoutContextPermission = (resource, context) => {
    if (resource?.attributes?.context && !context) {
        return true;
    }
    return false;
};

const resourceTypes = {
    MAP: {
        icon: { glyph: '1-map' },
        formatViewerPath: (resource, context) => {
            if (isContextMapWithoutContextPermission(resource, context)) {
                return null;
            }
            if (context?.name) {
                return `/context/${context.name}/${resource.id}`;
            }
            return `/viewer/${resource.id}`;
        }
    },
    DASHBOARD: {
        icon: { glyph: 'dashboard' },
        formatViewerPath: (resource) => {
            return `/dashboard/${resource.id}`;
        }
    },
    GEOSTORY: {
        icon: { glyph: 'geostory' },
        formatViewerPath: (resource) => {
            return `/geostory/${resource.id}`;
        }
    },
    CONTEXT: {
        icon: { glyph: 'context' },
        formatViewerPath: (resource) => {
            return `/context/${resource.name}`;
        }
    }
};
/**
 * returns and empty string when the value is `NODATA`
 * @param {object} resource resource properties
 * @param {object} context associated context resource properties
 * @return {object} resource parsed information `{ title, icon, thumbnailUrl, viewerPath, viewerUrl }`
 * @private
 */
export const getGeostoreResourceTypesInfo = (resource, context) => {
    const thumbnailUrl = parseNODATA(resource?.attributes?.thumbnail);
    const title = resource?.name || '';
    const { icon, formatViewerPath } = resourceTypes[resource?.category?.name] || {};
    const viewerPath = resource?.id && formatViewerPath ? formatViewerPath(resource, context) : undefined;
    const contextMapWithoutContextPermission = isContextMapWithoutContextPermission(resource, context);
    return {
        title,
        icon,
        thumbnailUrl,
        viewerPath,
        viewerUrl: viewerPath ?  `#${viewerPath}` : false,
        ...(contextMapWithoutContextPermission && { contextMapWithoutContextPermission })
    };
};
/**
 * returns resource status items
 * @param {object} resource resource properties
 * @param {object} context associated context resource properties
 * @return {object} resource status items `{ items: [{ type, tooltipId, glyph, tooltipParams }] }`
 * @private
 */
export const getGeostoreResourceStatus = (resource = {}, context = {}) => {
    return {
        items: [
            ...(resource.advertised === false ? [{
                type: 'icon',
                tooltipId: 'resourcesCatalog.unadvertised',
                glyph: 'eye-close'
            }] : []),
            ...(context?.name ? [{
                type: 'icon',
                glyph: 'context',
                tooltipId: 'resourcesCatalog.mapUsesContext',
                tooltipParams: {
                    contextName: context.name
                }
            }] : [])
        ]
    };
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

    const attributesWithDataPayloads = {
        'thumbnail': THUMBNAIL_DATA_KEY,
        'details': DETAILS_DATA_KEY
    };

    const attributesWithDataPayloadsKeys = Object.keys(attributesWithDataPayloads);
    const attributesWithDataPayloadsValues = Object.values(attributesWithDataPayloads);
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
    const linkedResources = attributesWithDataPayloadsKeys.reduce((acc, key) => {
        const dataKey = attributesWithDataPayloads[key];
        const initialData = initialResource?.attributes?.[dataKey];
        const data = pendingAttributes?.[dataKey];
        if (pendingAttributes?.[dataKey] !== undefined && initialData !== data) {
            return {
                ...acc,
                [key]: {
                    ...categoryOptions[key],
                    value: initialResource?.attributes?.[key] || NODATA,
                    data: data || NODATA
                }
            };
        }
        return acc;
    }, {});
    const attributes = omit(pendingAttributes, [...attributesWithDataPayloadsKeys, ...attributesWithDataPayloadsValues]);
    const excludedMetadata = ['permissions', 'attributes', 'data', 'category', 'tags'];
    const metadata = merge(omit(initialResource, excludedMetadata), omit(pendingChanges, excludedMetadata));
    const mergedAttributes = merge(omit(initialResource.attributes, attributesWithDataPayloadsValues), attributes) || {};
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
 * Parses all properties of a resource and returns a valid resource.
 * @param {object} resource - Resource properties.
 * @param {object} context - Associated context resource properties.
 * @return {object} parsed resource with properties will be as shown below
 * @example
 * // Typical parsed resource object
 *  {
 *      advertised,
 *      category,
 *      creation,
 *      creator,
 *      description,
 *      editor,
 *      id,
 *      lastUpdate,
 *      name,
 *      tags,
 *      canEdit,
 *      canDelete,
 *      canCopy,
 *      isFavorite,
 *      attributes: {
 *          detailsSettings,
 *          context,
 *          attributes,
 *          featured,
 *          thumbnail
 *      },
 *      "@extras": {
 *          context,
 *          info: {
 *              title,
 *              icon,
 *              thumbnailUrl,
 *              viewerPath,
 *              viewerUrl
 *          },
 *          status: {
 *              items: [
 *                  {
 *                      type,
 *                      tooltipId,
 *                      tooltipParams,
 *                      glyph
 *                  }
 *              ]
 *          }
 *      }
 *  }
 */
export const parseResourceProperties = (resource, context) => {
    const detailsSettings = parseStringifyProperties(resource?.attributes?.detailsSettings);
    return {
        ...resource,
        ...(resource?.tags && { tags: castArray(resource.tags) }),
        attributes: {
            ...resource?.attributes,
            detailsSettings
        },
        '@extras': {
            ...resource?.['@extras'],
            ...(context && { context }),
            info: getGeostoreResourceTypesInfo(resource, context),
            status: getGeostoreResourceStatus(resource, context)
        }
    };
};
/**
 * Prepare a cloned resource replacing and removing attributes and properties
 * @param {object} resource Resource properties.
 * @param {object} overrides additional properties
 * @param {string} overrides.name resource name
 * @param {string} overrides.resourceType resource type
 * @return {object} parsed cloned resource
 */
export function parseClonedResourcePayload(resource, { name, resourceType } = {}) {
    return {
        ...resource,
        permission: undefined,
        category: resourceType,
        metadata: {
            ...resource?.metadata,
            name,
            // The owner attribute has been omitted inside the new resource to avoid problem with permissions editing.
            // At the moment the backend is preventing permissions changes if attribute owner is present in a resource
            // and it does not match the current editing user.
            // The owner attribute has been introduced in version v2020.01.00 (https://github.com/geosolutions-it/MapStore2/pull/4475)
            // then removed in version v2021.01.00 (https://github.com/geosolutions-it/MapStore2/pull/5993).
            // So the owner omit is needed in particular to clone old map resources created before v2021.01.00
            attributes: omit(resource?.metadata?.attributes || {}, ['thumbnail', 'details', 'owner'])
        }
    };
}
