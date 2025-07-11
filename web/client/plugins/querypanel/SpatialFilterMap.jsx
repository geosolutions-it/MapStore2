/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { createPortal } from 'react-dom';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

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

/**
 * SpatialFilterMap Component
 *
 * Renders a map component for spatial filtering in the query panel.
 * The component uses createPortal to render the map in a specific container
 * to ensure proper layout and positioning.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.useEmbeddedMap - Whether to use embedded map mode
 * @param {boolean} props.hideSpatialFilter - Whether to hide the spatial filter
 * @param {boolean} props.queryPanelEnabled - Whether the query panel is enabled
 * @param {string} [props.targetContainerSelector=null] - CSS selector for the target container where the map should be rendered (optional, defaults to withContainer HOC's container)
 * @param {Element} [props.container] - Fallback container element (provided by withContainer HOC)
 * @param {...Object} props - Additional props passed to MapComponent
 *
 * @example
 * // Basic usage with default container (from withContainer HOC)
 * <SpatialFilterMap
 *   useEmbeddedMap={true}
 *   hideSpatialFilter={false}
 *   queryPanelEnabled={true}
 * />
 *
 * @example
 * // Dashboard usage with custom container selector
 * <SpatialFilterMap
 *   useEmbeddedMap={true}
 *   hideSpatialFilter={false}
 *   queryPanelEnabled={true}
 *   targetContainerSelector="#page-dashboard > .ms2-border-layout-body"
 * />
 */
export default withContainer((props) => {
    const {
        container,
        useEmbeddedMap,
        hideSpatialFilter,
        queryPanelEnabled,
        targetContainerSelector
    } = props;

    // Use custom selector if provided, otherwise fall back to withContainer HOC's container
    const targetContainer = targetContainerSelector
        ? document.querySelector(targetContainerSelector) || container
        : container;

    return useEmbeddedMap && !hideSpatialFilter && queryPanelEnabled ?
        createPortal(
            <div className="mapstore-query-map">
                <MapComponent {...props}/>
            </div>,
            targetContainer
        )
        : null;
});
