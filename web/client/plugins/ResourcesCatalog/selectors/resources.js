/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getMonitoredState } from '../../../utils/PluginsUtils';
import { getConfigProp } from '../../../utils/ConfigUtils';

const getStatePart = (state, props) => {
    const id = props?.id || props?.resourcesGridId;
    if (id === undefined) {
        return state?.resources;
    }
    return state?.resources?.sections?.[id] || {};
};

const RESOURCES = [];
export const getResources = (state, props) => {
    const resources = getStatePart(state, props)?.resources || RESOURCES;
    return resources;
};

export const getResourcesLoading = (state, props) => getStatePart(state, props)?.loading;
export const getResourcesError = (state, props) => getStatePart(state, props)?.error;
export const getIsFirstRequest = (state, props) => getStatePart(state, props)?.isFirstRequest !== false;
export const getTotalResources = (state, props) => getStatePart(state, props)?.total || 0;
export const getShowFiltersForm = (state, props) => getStatePart(state, props)?.showFiltersForm;

const getSelectedResourceState = (state, props) => {
    const initialSelectedResource = getStatePart(state, props)?.initialSelectedResource;
    const selectedResource = getStatePart(state, props)?.selectedResource;
    if (initialSelectedResource === undefined && selectedResource === undefined) {
        return state?.resources;
    }
    return { selectedResource, initialSelectedResource };
};

export const getInitialSelectedResource = (state, props) => getSelectedResourceState(state, props)?.initialSelectedResource;
export const getSelectedResource = (state, props) => getSelectedResourceState(state, props)?.selectedResource;
export const getShowDetails = (state, props) => !!getStatePart(state, props)?.showDetails;
export const getCurrentParams = (state, props) => getStatePart(state, props)?.params;
export const getCurrentPage = (state, props) => getCurrentParams(state, props)?.page ?? 1;
export const getSearch = (state) => state?.resources?.search || null;

export const getMonitoredStateSelector =  state => getMonitoredState(state, getConfigProp('monitorState'));
export const getRouterLocation = state => state?.router?.location;


