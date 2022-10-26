/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const isMapViewsActive = state => !!state?.mapviews?.active;
export const isMapViewsHidden = state => !!state?.mapviews?.hide;
export const getSelectedMapViewId = state => !isMapViewsHidden(state) && isMapViewsActive(state) && state?.mapviews?.selectedId;
export const getMapViews = state => state?.mapviews?.views;
export const getMapViewsResources = state => state?.mapviews?.resources;
export const getResourceById = (state, id) => getMapViewsResources(state)?.find(resource => resource.id === id);
export const getPreviousView = state => state?.mapviews?.previousView;
export const isMapViewsInitialized = state => !!state?.mapviews?.initialized;
export const getMapViewsUpdateUUID = state => state?.mapviews?.updateUUID;
export const getSelectedMapView = state => {
    const selectedId = getSelectedMapViewId(state);
    const views = getMapViews(state) || [];
    const selectedView = views.find(view => view.id === selectedId);
    return selectedView;
};
