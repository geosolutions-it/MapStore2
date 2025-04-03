/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createSelector } from 'reselect';
import {get} from 'lodash';
import { pathnameSelector } from './router';
import { isUserAllowedSelectorCreator } from './security';

export const getDashboardId = state => state?.dashboard?.resource?.id;
export const isDashboardAvailable = state => state && state.dashboard && state.dashboard.editor && state.dashboard.editor.available;
export const isShowSaveOpen = state => state && state.dashboard && state.dashboard.showSaveModal;
export const isShowSaveAsOpen = state => state && state.dashboard && state.dashboard.showSaveAsModal;
export const isDashboardEditing = state => state && state.dashboard && state.dashboard.editing;
export const showConnectionsSelector = state => state && state.dashboard && state.dashboard.showConnections;
export const dashboardResource = state => state && state.dashboard && state.dashboard.resource;
export const isDashboardLoading = state => state && state.dashboard && state.dashboard.loading;
export const getDashboardSaveErrors = state => state && state.dashboard && state.dashboard.saveErrors;
export const isBrowserMobile = state => state && state.browser && state.browser.mobile;
export const buttonCanEdit = createSelector(pathnameSelector, dashboardResource, isBrowserMobile,
    // can edit only on desktop, when the resource is saved and editable by the user or when we are editing a new dashboard
    // in that case the `path` ends with a number. Like `dashboard/1` or `dashboard/1234`.
    (path, resource, isMobile) => isMobile ? !isMobile : (resource && resource.canEdit || isNaN(path.substr(-1))));
export const originalDataSelector = state => state?.dashboard?.originalData;

export const dashboardServicesSelector =  state => state && state.dashboard && state.dashboard.services;
export const selectedDashboardServiceSelector = state => state && state.dashboard && state.dashboard.selectedService;
export const dashboardCatalogModeSelector = state => state && state.dashboard && state.dashboard.mode || "view";
export const dashboardIsNewServiceSelector = state => state.dashboard?.isNew || false;
export const dashboardSaveServiceSelector =  state => state.dashboard?.saveServiceLoading || false;
export const dashboardResourceInfoSelector = state => get(state, "dashboard.resource");
export const dashboardInfoDetailsUriFromIdSelector = state => state?.dashboard?.resource?.attributes?.details;
export const dashboardInfoDetailsSettingsFromIdSelector = state => get(dashboardResource(state), "attributes.detailsSettings");
export const editingAllowedRolesSelector = state => get(state, "dashboard.servicesPermission.editingAllowedRoles", []);
export const editingAllowedGroupsSelector = state => get(state, "dashboard.servicesPermission.editingAllowedGroups", []);
export const canEditServiceSelector = state => {
    const allowedRoles = editingAllowedRolesSelector(state);
    const allowedGroups = editingAllowedGroupsSelector(state);
    return isUserAllowedSelectorCreator({
        allowedRoles,
        allowedGroups
    })(state);
};
/**
 * Get name/title of current dashboard
 * @param {object} state the application state
 * @returns {string} name/title of the dashboard
 */
export const dashboardTitleSelector = state => state?.dashboard?.resource?.name;

