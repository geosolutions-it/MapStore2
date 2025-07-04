/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Portal from '../../components/misc/Portal';

import withContainer from '../../components/misc/WithContainer';

import MapWithDraw from './MapWithDraw';
import {
    getWidgetLayer
} from '../../selectors/widgets';
import {
    getMapConfigSelector
} from '../../selectors/queryform';
import {
    initQueryPanel
} from '../../actions/wfsquery';
import { isDashboardAvailable } from '../../selectors/dashboard';

/**
 * Component connected to the widgetLayer
 */
export const MapComponent = connect(
    createSelector([
        getWidgetLayer,
        getMapConfigSelector
    ], (layer, map) => {
        return {
            layer,
            map,
            mapStateSource: "wizardMap"
        };
    }
    ), {
        onMapReady: initQueryPanel
    } )(MapWithDraw);

const SpatialFilterMapComponent = withContainer((props) => {
    const {
        container,
        useEmbeddedMap,
        hideSpatialFilter,
        queryPanelEnabled,
        dashboardAvailable
    } = props;
    return useEmbeddedMap && !hideSpatialFilter && queryPanelEnabled ?
        (<Portal container={container}>
            {/* Since the Map in dashboard page is from top, need to set the top position to 38px which is the height of the Brand Navbar */}
            <div className="mapstore-query-map" style={{...(dashboardAvailable ? { top: 40 } : {})}}>
                <MapComponent {...props}/>
            </div>
        </Portal>)
        : null;
});

export default connect(
    createSelector([
        isDashboardAvailable
    ], (dashboardAvailable) => {
        return {
            dashboardAvailable
        };
    })
)(SpatialFilterMapComponent);
