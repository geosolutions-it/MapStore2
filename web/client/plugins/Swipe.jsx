/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { getSelectedLayer } from '../selectors/layers';
import { swipeToolStatusSelector } from '../selectors/swipe';
import { swipeSettingsSelector, swipeModeDirectionSelector, spyModeRadiusSelector } from '../selectors/mapInfo';
import swipe from '../reducers/swipe';
import epics from '../epics/swipe';
import { setActive } from '../actions/swipe';
import { setMode } from '../actions/mapInfo';

import { createPlugin } from '../utils/PluginsUtils';

import SwipeSettings from './SwipeSettings';
import SliderSwipeSupport from '../components/map/openlayers/swipe/SliderSwipeSupport';
import SpyGlassSupport from '../components/map/openlayers/swipe/SpyGlassSupport';
import SwipeButton from './swipe/SwipeButton';


export const Support = ({ mode, map, layer, active, direction, radius }) => {
    if (mode === "spy") {
        return <SpyGlassSupport map={map} layer={layer} active={active} radius={radius} />;
    }
    return <SliderSwipeSupport map={map} layer={layer} active={active} type={direction} />;
};

const swipeSupportSelector = createSelector([
    getSelectedLayer,
    swipeToolStatusSelector,
    swipeSettingsSelector,
    swipeModeDirectionSelector,
    spyModeRadiusSelector
], (layer, swipeToolStatus, swipeModeSettings, swipeModeDirection, spyModeRadius) => ({
    layer: layer?.id,
    active: swipeToolStatus.active || false,
    mode: swipeModeSettings.mode || "swipe",
    direction: swipeModeDirection.direction,
    radius: spyModeRadius.radius
}));

const MapSwipeSupport = connect(swipeSupportSelector, null)(Support);

/**
 * Swipe. Add to the TOC the possibility to select a layer for Swipe.
 * @name Swipe
 * @memberof plugins
 * @class
 */
export default createPlugin(
    'Swipe',
    {
        options: {
            disablePluginIf: "{state('mapType') === 'leaflet' || state('mapType') === 'cesium'}"
        },
        component: SwipeSettings,
        containers: {
            TOC: {
                name: "Swipe",
                target: "toolbar",
                selector: ({ status }) => status === 'LAYER',
                Component: connect(
                    createSelector(swipeToolStatusSelector, (swipeSettings) => ({swipeSettings})),
                    {
                        onSetActive: setActive,
                        onSetSwipeMode: setMode
                    }
                )(SwipeButton)
            },
            Map: {
                name: "Swipe",
                Tool: MapSwipeSupport
            }
        },
        reducers: {
            swipe
        },
        epics
    }
);
