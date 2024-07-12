/*
* Copyright 2024, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, { lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { locationSelector, povSelector, enabledSelector } from '../selectors/streetView';

const mapLocationSupports = {
    openlayers: lazy(() => import('../components/OLMapLocationSupport')),
    cesium: lazy(() => import('../components/CesiumMapLocationSupport'))
};

const MapLocationSupport = connect(
    createSelector([
        enabledSelector,
        locationSelector,
        povSelector
    ], (enabled, location, pov) => ({
        enabled,
        location,
        pov
    }))
)(({
    mapType,
    enabled,
    ...props
}) => {
    if (!enabled) {
        return null;
    }
    const Support = mapLocationSupports[mapType];
    return Support ? <Suspense fallback={null}><Support {...props} /></Suspense> : null;
});

export default MapLocationSupport;
