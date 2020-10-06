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
import { layerSwipeSettingsSelector, swipeModeSettingsSelector, spyModeSettingsSelector } from '../selectors/swipe';
import swipe from '../reducers/swipe';
import * as epics from '../epics/swipe';

import { createPlugin } from '../utils/PluginsUtils';

import SwipeSettings from './SwipeSettings';
import SliderSwipeSupport from '../components/map/openlayers/swipe/SliderSwipeSupport';
import SpyGlassSupport from '../components/map/openlayers/swipe/SpyGlassSupport';

export const Support = ({ mode, map, layer, active, swipeModeSettings, spyModeSettings }) => {
    if (mode === "spy") {
        return <SpyGlassSupport map={map} layer={layer} active={active} radius={spyModeSettings.radius} />;
    }
    return <SliderSwipeSupport map={map} layer={layer} active={active} type={swipeModeSettings.direction} />;
};

const swipeSupportSelector = createSelector([
    getSelectedLayer,
    layerSwipeSettingsSelector,
    swipeModeSettingsSelector,
    spyModeSettingsSelector
], (layer, swipeSettings, swipeModeSettings, spyModeSettings) => ({
    layer: layer?.id,
    active: swipeSettings.active || false,
    swipeModeSettings,
    spyModeSettings,
    mode: swipeSettings?.mode || "swipe"
}));

const MapSwipeSupport = connect(swipeSupportSelector, null)(Support);

/**
 * Swipe. Add to the TOC the possibility to select a layer for Swipe.
 * @memberof plugins
 * @requires plugins.Swipe
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
                name: "Swipe"
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
