/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createSelector } from 'reselect';
import { pathnameSelector } from './router';

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
    (path, resource, isMobile) => isMobile ? !isMobile : (resource && resource.canEdit || isNaN(path.substr(-4))));
export const originalDataSelector = state => state?.dashboard?.originalData;

export const dashboardServicesSelector =  state => state && state.dashboard && state.dashboard.services;
export const selectedDashboardServiceSelector = state => state && state.dashboard && state.dashboard.selectedService;
export const dashboardCatalogModeSelector = state => state && state.dashboard && state.dashboard.mode || "view";
export const dashboardIsNewServiceSelector = state => state.dashboard?.isNew || false;
export const dashboardSaveServiceSelector =  state => state.dashboard?.saveServiceLoading || false;
