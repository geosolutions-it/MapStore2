/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { computePendingChanges } from '../utils/ResourcesUtils';
import { mapSelector } from '../../../selectors/map';
import { mapHasPendingChangesSelector, mapSaveSelector } from '../../../selectors/mapsave';
import { dashboardHasPendingChangesSelector } from '../../../selectors/dashboardsave';
import { dashboardResource as getDashboardResource } from '../../../selectors/dashboard';
import { widgetsConfig } from '../../../selectors/widgets';
import { getInitialSelectedResource, getSelectedResource } from './resources';
import { currentStorySelector, resourceSelector, hasPendingChanges } from '../../../selectors/geostory';
import { contextResourceSelector } from '../../../selectors/context';
import { isEmpty, omit } from 'lodash';

const defaultNewResource = (resourceType) => {
    return { canCopy: true, category: { name: resourceType } };
};

const applyContextAttribute = (resource, contextId) => {
    const context = contextId !== undefined
        ? contextId
        : resource?.attributes?.context;
    return {
        ...resource,
        ...(context !== undefined && {
            attributes: {
                ...resource?.attributes,
                ...(context !== undefined && { context })
            }
        })
    };
};

const getResourceByType = (state, props) => {
    const resourceType = props?.resourceType;
    const initialResource = getInitialSelectedResource(state, props);
    const resource = getSelectedResource(state, props);
    const newResource = defaultNewResource(resourceType);
    if (resourceType === 'MAP') {
        const contextResource = contextResourceSelector(state);
        const mapInfo = (mapSelector(state) || {})?.info;
        const contextId = contextResource?.id !== undefined
            ? contextResource.id
            : mapInfo?.context; // new map has context in info property
        const mapResource = omit(mapInfo, ['context']);
        const mapInitialResource = applyContextAttribute(isEmpty(mapResource) ? newResource : mapResource, contextId);
        return {
            initialResource: resource ? initialResource : mapInitialResource,
            resource: resource ? resource : mapInitialResource,
            data: {
                payload: mapSaveSelector(state),
                pending: mapHasPendingChangesSelector(state)
            }
        };
    }
    if (resourceType === 'DASHBOARD') {
        const dashboardResource = getDashboardResource(state);
        const dashboardInitialResource = isEmpty(dashboardResource) ? newResource : dashboardResource;
        return {
            initialResource: resource ? initialResource : dashboardInitialResource,
            resource: resource ? resource : dashboardInitialResource,
            data: {
                payload: widgetsConfig(state),
                pending: dashboardHasPendingChangesSelector(state)
            }
        };
    }
    if (resourceType === 'GEOSTORY') {
        const geoStoryResource = resourceSelector(state);
        const geoStoryInitialResource = isEmpty(geoStoryResource) ? newResource : geoStoryResource;
        return {
            initialResource: resource ? initialResource : geoStoryInitialResource,
            resource: resource ? resource : geoStoryInitialResource,
            data: {
                payload: currentStorySelector(state),
                pending: hasPendingChanges(state)
            }
        };
    }
    return {
        initialResource,
        resource
    };
};

export const getPendingChanges = (state, props, defaultResourceType) => {
    const { initialResource, resource, data } = getResourceByType(state, props, defaultResourceType);
    if (!(resource && initialResource)) {
        return null;
    }
    return computePendingChanges(initialResource, resource, data);
};
