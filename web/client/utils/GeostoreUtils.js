/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEmpty, isEqual, omit, isArray, isObject, isString, castArray, some } from 'lodash';
import merge from 'lodash/fp/merge';
import uuid from 'uuid/v1';
import MapUtils from './MapUtils';

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
 * Checks if a resource has a context reference but the context is not accessible
 * @param {Object} resource - The resource object to check
 * @param {Object} context - The context object (can be null/undefined)
 * @returns {boolean} True if resource has a context reference but context is not accessible
 */
export const hasInaccessibleContext = (resource, context) => {
    // Check if resource has a context reference but the context is not available
    // Use lodash isEmpty to properly handle null, undefined, empty objects, etc.
    const hasResourceContext = !!resource?.attributes?.context;
    const hasContextAccess = !isEmpty(context);

    if (hasResourceContext && !hasContextAccess) {
        return true;
    }
    return false;
};

const resourceTypes = {
    MAP: {
        icon: { glyph: '1-map' },
        formatViewerPath: (resource, context) => {
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
    return {
        title,
        icon,
        thumbnailUrl,
        viewerPath,
        viewerUrl: viewerPath ?  `#${viewerPath}` : false
    };
};
/**
 * returns resource status items
 * @param {object} resource resource properties
 * @param {object} context associated context resource properties
 * @return {object} resource status items `{ items: [{ type, tooltipId, glyph, tooltipParams }], cardClassNames: [], cardTooltipId: string }`
 * @private
 */
export const getGeostoreResourceStatus = (resource = {}, context = {}) => {
    // for now dependency check is only on parent context check, can be extended to other dependencies in the future
    const hasDependencyIssue = hasInaccessibleContext(resource, context);
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
        ],
        // issue-based status for dependency missing
        ...(hasDependencyIssue && {
            cardClassNames: ['ms-resource-issue-dependency-missing'],
            cardTooltipId: 'resourcesCatalog.resourceIssues.dependencyMissing'
        })
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
export const computeResourceDiff = (initialResource, resource) => {
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
        pendingChanges,
        metadata,
        linkedResources,
        attributes,
        mergedAttributes,
        mergedTags
    };
};

/**
 * Composes map configuration from raw map data when needed (for save/compare operations).
 * This function performs the expensive saveMapConfiguration operation only when required.
 * @param {object} mapData - Raw map data from mapSaveDataSelector
 * @return {object} Formatted map configuration ready for saving
 */
export const composeMapConfiguration = (mapData) => {
    if (!mapData || isEmpty(mapData)) {
        return null;
    }
    const { map, layers, groups, backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions } = mapData;
    return MapUtils.saveMapConfiguration(map, layers, groups, backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions);
};

/**
 * Efficiently compares raw map data with initial map configuration to detect changes.
 * This avoids expensive composition operations when possible.
 * @param {object} currentMapData - Current raw map data from (mapSaveDataSelector)
 * @param {object} initialMapConfig - Initial map configuration
 * @return {boolean} True if there are changes, false otherwise
 */
export const compareMapDataChanges = (currentMapData, initialMapConfig) => {
    // If no current data or initial config, no changes
    if (!currentMapData || !initialMapConfig) {
        return false;
    }

    // If current data is empty, no changes
    if (isEmpty(currentMapData)) {
        return false;
    }
    return !MapUtils.compareMapChanges(initialMapConfig, currentMapData);
};

/**
 * Computes the save resource object based on the initial resource, resource, resource data, and resource type
 * @param {object} initialResource - The initial resource object
 * @param {object} resource - The resource object
 * @param {object} resourceData - The resource data object
 */
export const computeSaveResource = (initialResource, resource, resourceData) => {
    const {
        pendingChanges,
        metadata,
        linkedResources,
        mergedAttributes,
        mergedTags
    } = computeResourceDiff(initialResource, resource);

    // For MAP resources, compose the map configuration from raw data when saving
    const dataPayload = resourceData?.resourceType === 'MAP' && resourceData?.payload
        ? composeMapConfiguration(resourceData.payload)
        : resourceData?.payload;
    return {
        id: initialResource.id,
        ...(dataPayload && { data: dataPayload }),
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
    };
};
const recursiveIsChanged = (a, b) => {
    if (!isObject(a)) {
        return !isEqual(a, b);
    }
    if (isArray(a)) {
        return a.some((v, idx) => {
            return recursiveIsChanged(a[idx], b?.[idx]);
        });
    }
    return Object.keys(a).some((key) => {
        return recursiveIsChanged(a[key], b?.[key]);
    }, {});
};
/**
 * Compares dashboard data changes by reusing the same logic as dashboardHasPendingChangesSelector
 * but works with raw data instead of Redux state
 * @param {object} currentDashboardData - Current dashboard data
 * @param {object} initialDashboardData - Initial dashboard data
 * @return {boolean} True if there are changes, false otherwise
 */
export const compareDashboardDataChanges = (currentDashboardData, initialDashboardData) => {
    // If no current data or initial data, no changes
    if (!currentDashboardData || !initialDashboardData) {
        return false;
    }

    // If current data is empty, no changes
    if (isEmpty(currentDashboardData)) {
        return false;
    }

    const originalWidgets = initialDashboardData?.widgets || [];
    const originalLayouts = initialDashboardData?.layouts || {};
    const widgets = currentDashboardData?.widgets || [];
    const layouts = currentDashboardData?.layouts || {};

    const layoutChanged = originalLayouts.length !== layouts.length;
    if (layoutChanged) {
        return true;
    }

    const widgetLengthChanged = originalWidgets.length !== (widgets?.length || 0);
    if (widgetLengthChanged) {
        return true;
    }

    const hasLayoutChanged = some(layouts || [], layout => {
        const originalLayout = originalLayouts.find(l => l.id === layout.id);
        if (!originalLayout) {
            return true;
        }
        const layoutDataChanged = recursiveIsChanged(layout, originalLayout);
        if (layoutDataChanged) {
            return true;
        }
        return false;
    });

    if (hasLayoutChanged) {
        return true;
    }

    return some(widgets || [], widget => {
        const originalWidget = originalWidgets.find(w => w.id === widget.id);

        if (!originalWidget) {
            return true;
        }

        const widgetDataChanged = recursiveIsChanged(omit(widget, 'dependenciesMap', 'map', 'maps'), omit(originalWidget, 'dependenciesMap', 'map', 'maps'));

        if (widgetDataChanged) {
            return true;
        }

        const originalMaps = originalWidget?.map ? [originalWidget.map] : originalWidget?.maps || [];
        const widgetMaps = widget.map ? [widget.map] : widget.maps || [];

        if (!widgetMaps?.length && !originalMaps?.length) {
            return false;
        }

        return widgetMaps.some((widgetMap, idx) => {
            const originalMap = originalMaps[idx] || {};

            const mapDataChanged = recursiveIsChanged(omit(widgetMap, 'center', 'bbox', 'size'), omit(originalMap, 'center', 'bbox', 'size'));

            if (mapDataChanged) {
                return true;
            }

            const originalCenter = originalMap?.center;
            const widgetCenter = widgetMap?.center;

            if (!originalCenter && !widgetCenter) {
                return false;
            }

            const CENTER_EPS = 1e-12;
            return !(
                !!originalCenter
                    && !!widgetCenter
                    && originalCenter.crs === widgetCenter.crs
                    && Math.abs(originalCenter.x - widgetCenter.x) < CENTER_EPS
                    && Math.abs(originalCenter.y - widgetCenter.y) < CENTER_EPS
            );
        });
    });

};
/**
 * Computes whether there are data changes for a resource based on its type and payload
 * @param {object} resourceData - The resource data object containing type and payload information
 * @param {string} resourceData.resourceType - The type of resource (e.g., 'MAP')
 * @param {boolean} [resourceData.pending] - Initial pending changes flag
 * @param {object} [resourceData.payload] - Current resource payload
 * @param {object} [resourceData.initialPayload] - Initial resource payload for comparison
 * @returns {boolean} True if there are data changes, false otherwise
 */
const computeDataChanges = (resourceData) => {
    if (!resourceData) {
        return false;
    }
    const { resourceType, pending, payload, initialPayload } = resourceData;

    if (!payload) {
        return pending ?? false;
    }

    if (resourceType === 'MAP') {
        // payload: need to convert Map raw data to map configuration
        return compareMapDataChanges(composeMapConfiguration(payload), initialPayload);
    }

    if (resourceType === 'DASHBOARD') {
        return compareDashboardDataChanges(payload, initialPayload);
    }
    // for geostory, pending is true if there are pending changes
    return pending ?? false;
};

/**
 * compare initial and current resource and it returns pending changes
 * @param {object} initialResource initial resource properties
 * @param {object} resource resource properties including changes applied in the viewer
 * @param {object} data optional data configuration of the resource
 * @return {object} pending changes object { initialResource, resource, saveResource, changes } where `saveResource` is the resource ready to be saved and `changes` contains the changed properties
 */
export const computePendingChanges = (initialResource, resource, resourceData) => {
    const {
        attributes,
        pendingChanges,
        linkedResources,
        mergedTags
    } = computeResourceDiff(initialResource, resource);

    const hasDataChanges = computeDataChanges(resourceData);

    return {
        ...pendingChanges,
        ...(mergedTags?.length && { tags: mergedTags }),
        ...(!isEmpty(attributes) && { attributes }),
        ...(!isEmpty(linkedResources) && { linkedResources }),
        ...(hasDataChanges && { data: true })
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
