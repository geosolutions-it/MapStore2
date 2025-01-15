/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { connect } from 'react-redux';

import { createSelector } from 'reselect';
import useStoreManager from '../../hooks/useStoreManager';
import {
    updateViews,
    selectView,
    setupViews,
    updateResources,
    hideViews
} from '../../actions/mapviews';
import mapviews from '../../reducers/mapviews';
import { layersSelector, rawGroupsSelector } from '../../selectors/layers';
import { currentLocaleSelector } from '../../selectors/locale';
import epics from '../../epics/mapviews';
import {
    getSelectedMapViewId,
    getMapViews,
    getMapViewsResources,
    isMapViewsActive,
    isMapViewsHidden,
    isMapViewsInitialized,
    getMapViewsUpdateUUID
} from '../../selectors/mapviews';
import Loader from '../../components/misc/Loader';
import { MAP_VIEWS_CONFIG_KEY } from '../../utils/MapViewsUtils';
import { flattenArrayOfObjects } from '../../utils/LayersUtils';
import { isObject } from 'lodash';

const MapViewsSupport = lazy(() => import('../../components/mapviews/MapViewsSupport'));

const reducers = {
    mapviews
};

function MapViews({
    pluginName,
    mapConfig,
    onSetup = () => {},
    active,
    onHideViews,
    initialized,
    updateUUID,
    ...props
}) {

    useStoreManager(pluginName, { reducers, epics });
    useEffect(() => {
        // reload the map views state only if the map has changed the first time
        if (!initialized && mapConfig?.[MAP_VIEWS_CONFIG_KEY]) {
            onSetup(mapConfig[MAP_VIEWS_CONFIG_KEY]);
        }
    }, [mapConfig?.[MAP_VIEWS_CONFIG_KEY], initialized]);

    if (!active) {
        return null;
    }

    return (
        <Suspense fallback={
            <div className="ms-map-views">
                <div className="ms-map-views-wrapper">
                    <div className="ms-map-views-header" style={{ justifyContent: 'center' }}>
                        <Loader size={30} />
                    </div>
                </div>
            </div>
        }>
            <MapViewsSupport
                key={updateUUID}
                {...props}
            />
        </Suspense>
    );
}

const ConnectedMapViews = connect(
    createSelector([
        getSelectedMapViewId,
        getMapViews,
        layersSelector,
        currentLocaleSelector,
        state => state?.mapConfigRawData,
        getMapViewsResources,
        isMapViewsActive,
        isMapViewsHidden,
        isMapViewsInitialized,
        getMapViewsUpdateUUID,
        rawGroupsSelector
    ], (selectedId, views, layers, locale, mapConfig, resources, active, hide, initialized, updateUUID, groups) => ({
        selectedId,
        views,
        layers: layers.filter(({ group }) => group !== 'background'),
        locale,
        mapConfig,
        resources,
        active,
        hide,
        initialized,
        updateUUID,
        groups: flattenArrayOfObjects(groups).filter(isObject)
    })),
    {
        onSelectView: selectView,
        onUpdateViews: updateViews,
        onSetup: setupViews,
        onUpdateResources: updateResources,
        onHideViews: hideViews
    }
)(MapViews);

export default ConnectedMapViews;
