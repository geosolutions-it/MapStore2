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

import { layerSwipeSettingsSelector, swipeModeSettingsSelector, spyModeSettingsSelector, getSwipeLayerId, swipeSliderSettingsSelector } from '../selectors/swipe';
import swipe from '../reducers/swipe';
import epics from '../epics/swipe';
import {
    setActive,
    setMode,
    setSwipeLayer,
    setSwipeSliderOps
} from '../actions/swipe';

import { createPlugin } from '../utils/PluginsUtils';

import SwipeSettings from './SwipeSettings';
import SliderSwipeSupport from '../components/map/openlayers/swipe/SliderSwipeSupport';
import SpyGlassSupport from '../components/map/openlayers/swipe/SpyGlassSupport';
import SwipeButton from './swipe/SwipeButton';


export const Support = ({ mode, map, layer, active, swipeModeSettings, spyModeSettings, swipeSliderOptions, onSetSwipeSliderOptions }) => {
    if (mode === "spy") {
        return <SpyGlassSupport map={map} layer={layer} active={active} radius={spyModeSettings.radius} />;
    }
    return <SliderSwipeSupport map={map} layer={layer} active={active} type={swipeModeSettings.direction} swipeSliderOptions={swipeSliderOptions} onSetSwipeSliderOptions={onSetSwipeSliderOptions} />;
};

const swipeSupportSelector = createSelector([
    getSwipeLayerId,
    layerSwipeSettingsSelector,
    swipeModeSettingsSelector,
    spyModeSettingsSelector,
    swipeSliderSettingsSelector
], (layer, swipeSettings, swipeModeSettings, spyModeSettings, swipeSliderOptions) => ({
    layer,
    active: swipeSettings.active || false,
    swipeModeSettings,
    spyModeSettings,
    mode: swipeSettings?.mode || "swipe",
    swipeSliderOptions
}));

const MapSwipeSupport = connect(swipeSupportSelector, {
    onSetSwipeSliderOptions: setSwipeSliderOps
})(Support);

const tocToolsSelector = createSelector(getSwipeLayerId, layerSwipeSettingsSelector, (swipeLayerId, swipeSettings) => ({swipeLayerId, swipeSettings}));

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
            TOC: [{
                name: "Swipe",
                target: "context-menu",
                Component: connect(
                    tocToolsSelector,
                    {
                        onSetActive: setActive,
                        onSetSwipeMode: setMode,
                        onSetSwipeLayer: setSwipeLayer
                    }
                )(SwipeButton),
                position: 13
            }, {
                name: "Swipe",
                target: "node-tool",
                Component: connect(tocToolsSelector, { onSetActive: setActive })(({
                    itemComponent,
                    node,
                    swipeLayerId,
                    swipeSettings,
                    onSetActive
                }) => {
                    const ItemComponent = itemComponent;
                    const showConfiguration = () => {
                        onSetActive(!swipeSettings.configuring, "configuring");
                    };
                    if (!swipeLayerId || swipeLayerId !== node?.id) {
                        return null;
                    }
                    return (
                        <ItemComponent
                            glyph={swipeSettings?.mode === "swipe" ? 'transfer' : 'search'}
                            active={swipeLayerId === node?.id}
                            tooltipId={'toc.configureTool'}
                            onClick={() => showConfiguration()}
                        />
                    );
                }),
                position: 13
            }],
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
