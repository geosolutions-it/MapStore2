/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { isEmpty, isString } from 'lodash';
import {
    SELECT_VIEW,
    UPDATE_VIEWS,
    ACTIVATE_VIEWS,
    SETUP_VIEWS,
    HIDE_VIEWS,
    setPreviousView,
    updateResources,
    hideViews
} from '../actions/mapviews';
import {
    TOGGLE_CONTROL,
    SET_CONTROL_PROPERTY,
    setControlProperty
} from '../actions/controls';
import {
    removeAdditionalLayer,
    updateAdditionalLayer
} from '../actions/additionallayers';
import { CATALOG_CLOSE } from '../actions/catalog';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { VISUALIZATION_MODE_CHANGED } from '../actions/maptype';
import {
    getSelectedMapView,
    getResourceById,
    getPreviousView,
    getMapViewsResources,
    isMapViewsHidden,
    isMapViewsActive
} from '../selectors/mapviews';
import { BROWSE_DATA } from '../actions/layers';
import { CLOSE_FEATURE_GRID } from '../actions/featuregrid';
import { layersSelector, rawGroupsSelector } from '../selectors/layers';
import {
    isShallowEqualBy
} from '../utils/ReselectUtils';
import { getResourceFromLayer } from '../api/MapViews';

import { MAP_VIEWS_LAYERS_OWNER, formatClippingFeatures, isViewLayerChanged, mergeViewGroups, mergeViewLayers } from '../utils/MapViewsUtils';
import { isCesium } from '../selectors/maptype';
import { getDerivedLayersVisibility } from '../utils/LayersUtils';

const deepCompare = isShallowEqualBy();

const updateResourcesObservable = (view, store) => {
    const state = store.getState();
    const resources = getMapViewsResources(state);
    const { layers = [], mask = {} } = view || {};
    return Observable.defer(() => {
        const mapLayers = layersSelector(state);
        const maskLayerResource = isString(mask.resourceId) ? getResourceById(state, mask.resourceId) : undefined;
        const maskVectorLayer = mapLayers?.find(layer => layer.id === maskLayerResource?.data?.id);
        const checkResources = [
            {
                resource: maskLayerResource,
                options: mask,
                vectorLayer: maskVectorLayer
            },
            ...layers
                .filter(({ clippingLayerResourceId }) => clippingLayerResourceId)
                .map(({ clippingLayerResourceId }) => {
                    const layerResource = isString(clippingLayerResourceId) ? getResourceById(state, clippingLayerResourceId) : undefined;
                    const vectorLayer = mapLayers?.find(layer => layer.id === layerResource?.data?.id);
                    return {
                        resource: layerResource,
                        vectorLayer
                    };
                })
        ];
        return Promise.all(
            checkResources
                .filter(({ resource }) => resource)
                .map(({ resource, options, vectorLayer }) =>
                    getResourceFromLayer({
                        resourceId: resource.id,
                        layer: {
                            ...(vectorLayer?.features && {
                                features: vectorLayer?.features
                            }),
                            ...resource.data
                        },
                        inverse: options?.inverse,
                        offset: options?.offset,
                        resources
                    })
                        .then((response) => response)
                        .catch(() => ({ id: resource.id, error: true }))
                )
        );
    });
};

export const updateMapViewsLayers = (action$, store) =>
    action$.ofType(
        SELECT_VIEW,
        UPDATE_VIEWS,
        ACTIVATE_VIEWS,
        HIDE_VIEWS,
        SETUP_VIEWS,
        MAP_CONFIG_LOADED,
        VISUALIZATION_MODE_CHANGED
    )
        .filter(() => {
            const state = store.getState();
            return !isMapViewsHidden(state) && isMapViewsActive(state);
        })
        .switchMap((action) => {
            const state = store.getState();
            const previousView = getPreviousView(state);
            const currentView =  getSelectedMapView(state);
            const { layers = [], groups = [], mask = {}, id: viewId } = currentView || {};
            const shouldUpdate = !!(
                action.type === VISUALIZATION_MODE_CHANGED
                || !deepCompare(previousView?.layers || [], layers)
                || !deepCompare(previousView?.mask || {}, mask)
                || !deepCompare(previousView?.groups || [], groups)
            );
            if (!shouldUpdate) {
                return Observable.of(
                    setPreviousView(currentView)
                );
            }
            const mapLayers = layersSelector(state);
            const mergedGroups = mergeViewGroups(
                rawGroupsSelector(state),
                currentView, true);
            const mergedLayers = mergeViewLayers(mapLayers, currentView);
            const updatedLayers = getDerivedLayersVisibility(mergedLayers, mergedGroups);
            const changedLayers = updatedLayers.filter((uLayer) => {
                const currentLayer = (mapLayers || []).find(layer => layer.id === uLayer.id);
                return isViewLayerChanged(uLayer, currentLayer);
            });
            const resources = getMapViewsResources(state);
            return updateResourcesObservable(currentView, store)
                .switchMap((allResources) => {
                    const checkedResources = allResources.filter(({ error }) => !error);
                    const updatedResources = checkedResources.filter(resource => resource.updated);
                    const maskLayerResource = isString(mask.resourceId) && checkedResources.find((resource) => resource.id === mask.resourceId);
                    return Observable.of(
                        ...(updatedResources.length > 0 ? [
                            updateResources(resources.map((resource) => {
                                const { updated, ...updatedResource } = updatedResources.find(uResource => uResource.id === resource.id) || {};
                                return !isEmpty(updatedResource) ? updatedResource : resource;
                            }))
                        ] : []),
                        setPreviousView(currentView),
                        removeAdditionalLayer({ owner: MAP_VIEWS_LAYERS_OWNER }),
                        ...changedLayers
                            .map((layer) => {
                                const clipPolygonLayerResource = isString(layer.clippingLayerResourceId) && checkedResources.find((resource) => resource.id === layer.clippingLayerResourceId);
                                const clippingPolygon = isString(layer.clippingPolygonFeatureId)
                                    && formatClippingFeatures(clipPolygonLayerResource?.data?.collection?.features)?.find(feature => feature.id === layer.clippingPolygonFeatureId);
                                return updateAdditionalLayer(
                                    layer.id,
                                    MAP_VIEWS_LAYERS_OWNER,
                                    'override',
                                    {
                                        ...layer,
                                        ...(clippingPolygon && { clippingPolygon })
                                    }
                                );
                            }),
                        ...(isCesium(state) && maskLayerResource?.data?.collection?.features
                            ? [updateAdditionalLayer(
                                `${viewId}-mask`,
                                MAP_VIEWS_LAYERS_OWNER,
                                'overlay',
                                {
                                    id: `${viewId}-mask`,
                                    type: 'vector',
                                    features: maskLayerResource.data.collection.features,
                                    visibility: true,
                                    style: {
                                        format: 'geostyler',
                                        body: {
                                            name: '',
                                            rules: [
                                                {
                                                    name: '',
                                                    symbolizers: [{
                                                        kind: 'Fill',
                                                        color: '#ffffff',
                                                        fillOpacity: 0,
                                                        msClampToGround: true,
                                                        msClassificationType: '3d'
                                                    }]
                                                }
                                            ]
                                        }
                                    }
                                }
                            )]
                            : [])
                    );
                });
        });

export const removeMapViewsLayersWhenDeactivated = (action$) =>
    action$.ofType(ACTIVATE_VIEWS)
        .filter((action) => !action.active)
        .switchMap(() => {
            return Observable.of(
                removeAdditionalLayer({ owner: MAP_VIEWS_LAYERS_OWNER }),
                setPreviousView()
            );
        });

const controlsToCheck = ['drawer', 'metadataexplorer', 'print', 'queryPanel'];

export const closePluginWhenMapViewsActivate = (action$, store) =>
    action$.ofType(ACTIVATE_VIEWS)
        .filter((action) => action.active)
        .switchMap(() => {
            const state = store.getState();
            const shouldClosePlugins = !!controlsToCheck.find((key) => !!state?.controls?.[key]?.enabled);
            return shouldClosePlugins
                ? Observable.of(
                    ...controlsToCheck.map((control) => setControlProperty(control, 'enabled', false))
                )
                : Observable.empty();
        });

export const hideMapViewsBasedOnLayoutChanges = (action$, store) =>
    action$.ofType(
        TOGGLE_CONTROL,
        SET_CONTROL_PROPERTY,
        CATALOG_CLOSE,
        MAP_CONFIG_LOADED,
        BROWSE_DATA,
        CLOSE_FEATURE_GRID
    )
        .filter((action) =>
            [CATALOG_CLOSE, MAP_CONFIG_LOADED, BROWSE_DATA, CLOSE_FEATURE_GRID].includes(action.type)
            || controlsToCheck.includes(action.control)
        )
        .switchMap(() => {
            const state = store.getState();
            const shouldBeHidden = !!controlsToCheck.find((key) => !!state?.controls?.[key]?.enabled)
                || !!state?.featuregrid?.open;
            return shouldBeHidden
                ? Observable.of(
                    removeAdditionalLayer({ owner: MAP_VIEWS_LAYERS_OWNER }),
                    setPreviousView(),
                    hideViews(true)
                )
                : Observable.of(
                    hideViews(false)
                );
        });

export default {
    updateMapViewsLayers,
    removeMapViewsLayersWhenDeactivated,
    closePluginWhenMapViewsActivate,
    hideMapViewsBasedOnLayoutChanges
};
