/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { connect } from 'react-redux';

import { createSelector } from 'reselect';
import uuid from 'uuid';

import useStoreManager from '../../hooks/useStoreManager';
import {
    updateViews,
    selectView,
    setupViews,
    updateResources,
    hideViews
} from '../../actions/mapviews';
import mapviews from '../../reducers/mapviews';
import { layersSelector } from '../../selectors/layers';
import { currentLocaleSelector } from '../../selectors/locale';
import epics from '../../epics/mapviews';
import {
    getSelectedMapViewId,
    getMapViews,
    getMapViewsResources,
    isMapViewsActive,
    isMapViewsHidden,
    getPreviousStoredMapId
} from '../../selectors/mapviews';
import Loader from '../../components/misc/Loader';

const MapViewsSupport = lazy(() => import('../../components/mapviews/MapViewsSupport'));

const reducers = {
    mapviews
};

function MapViews({
    pluginName,
    mapConfig,
    onSetup = () => {},
    active,
    mapViewsConfigKey,
    onHideViews,
    mapId,
    previousMapId,
    ...props
}) {

    useStoreManager(pluginName, { reducers, epics });

    const [reloadKey, setReload] = useState(uuid());
    useEffect(() => {
        // reload the map views state only if the map has changed
        if (!previousMapId
        || !!previousMapId && previousMapId !== mapId) {
            onSetup({ ...mapConfig?.[mapViewsConfigKey], mapId });
        }
        onHideViews(false);
        setReload(uuid());
        return () => {
            onHideViews(true);
        };
    }, [mapId, previousMapId, mapConfig?.[mapViewsConfigKey]]);

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
                key={reloadKey}
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
        getPreviousStoredMapId
    ], (selectedId, views, layers, locale, mapConfig, resources, active, hide, previousMapId) => ({
        selectedId,
        views,
        layers: layers.filter(({ group }) => group !== 'background'),
        locale,
        mapConfig,
        resources,
        active,
        hide,
        previousMapId
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
