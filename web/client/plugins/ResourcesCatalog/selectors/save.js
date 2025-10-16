/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mapIdSelector, mapSelector } from '../../../selectors/map';
import { mapSaveDataSelector } from '../../../selectors/mapsave';
import { dashboardResource as getDashboardResource, originalDataSelector } from '../../../selectors/dashboard';
import { widgetsConfig } from '../../../selectors/widgets';
import { getInitialSelectedResource, getSelectedResource } from './resources';
import { currentStorySelector, hasPendingChanges, resourceSelector } from '../../../selectors/geostory';
import { contextResourceSelector } from '../../../selectors/context';
import { isEmpty, isNil, omit } from 'lodash';
import { createSelector } from 'reselect';

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

const resourceTypeSelector = (_state, props) => props?.resourceType;
const initialSelectedResourceSelector = (state, props) => getInitialSelectedResource(state, props);
const selectedResourceSelector = (state, props) => getSelectedResource(state, props);

const mapInfoSelector = createSelector(
    state => mapSelector(state),
    (map) => (map || {})?.info
);

const mapConfigRawDataSelector = (state) => state.mapConfigRawData;
export const getResourceInfoByTypeSelectorCreator = (excludeData) =>
    createSelector(
        [
            resourceTypeSelector,
            initialSelectedResourceSelector,
            selectedResourceSelector,

            // MAP deps
            contextResourceSelector,
            mapInfoSelector,
            mapSaveDataSelector,
            mapConfigRawDataSelector,
            mapIdSelector,

            // DASHBOARD deps
            getDashboardResource,
            widgetsConfig,
            originalDataSelector,

            // GEOSTORY deps
            resourceSelector,
            currentStorySelector,
            hasPendingChanges
        ],
        (
            resourceType,
            initialResource,
            resource,

            // MAP
            contextResource,
            mapInfo,
            mapSaveData,
            mapConfigRawData,
            mapId,

            // DASHBOARD
            dashboardResource,
            widgetsConf,
            dashboardInitialData,

            // GEOSTORY
            geoStoryResource,
            currentStory,
            geoStoryPendingChanges
        ) => {

            // mapId is nill in case of new maps
            const newResource = { canCopy: isNil(mapId), category: { name: resourceType } };
            // pass resource type
            if (resourceType === 'MAP') {
                const contextId = contextResource?.id !== undefined
                    ? contextResource.id
                    : mapInfo?.context; // new map has context in info

                const mapResource = omit(mapInfo, ['context']);
                const mapInitialResource = applyContextAttribute(
                    isEmpty(mapResource) ? newResource : mapResource,
                    contextId
                );

                return {
                    initialResource: resource ? initialResource : mapInitialResource,
                    resource: resource ? resource : mapInitialResource,
                    ...(!excludeData && {
                        data: {
                            // lightweight data; actual composition happens on Demand
                            payload: mapSaveData,
                            initialPayload: mapConfigRawData,
                            resourceType
                        }
                    })
                };
            }

            if (resourceType === 'DASHBOARD') {
                const dashboardInitialResource = isEmpty(dashboardResource) ? newResource : dashboardResource;

                return {
                    initialResource: resource ? initialResource : dashboardInitialResource,
                    resource: resource ? resource : dashboardInitialResource,
                    ...(!excludeData && {
                        data: {
                            payload: widgetsConf,
                            initialPayload: dashboardInitialData,
                            resourceType
                        }
                    })
                };
            }

            if (resourceType === 'GEOSTORY') {
                const geoStoryInitialResource = isEmpty(geoStoryResource) ? newResource : geoStoryResource;
                return {
                    initialResource: resource ? initialResource : geoStoryInitialResource,
                    resource: resource ? resource : geoStoryInitialResource,
                    ...(!excludeData && {
                        data: {
                            payload: currentStory,
                            pending: geoStoryPendingChanges
                        }
                    })
                };
            }

            // default
            return {
                initialResource,
                resource
            };
        }
    );

export const getResourceInfoByType = getResourceInfoByTypeSelectorCreator(true);
export const getResourceWithDataInfoByType = getResourceInfoByTypeSelectorCreator(false);


export const getPendingChanges = (state) => {
    return state?.save?.pendingChanges;
};
