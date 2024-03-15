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

export default withContainer((props) => {
    const {
        container,
        useEmbeddedMap,
        hideSpatialFilter,
        queryPanelEnabled
    } = props;
    return useEmbeddedMap && !hideSpatialFilter && queryPanelEnabled ?
        (<Portal container={container}>
            <div className="mapstore-query-map">
                <MapComponent {...props}/>
            </div>
        </Portal>)
        : null;
});
