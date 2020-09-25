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

import { getSelectedLayer, layerSwipeSettingsSelector } from '../selectors/layers';

import { createPlugin } from '../utils/PluginsUtils';

import SwipeSettings from './SwipeSettings';
import XYSwipeSupport from '../components/map/openlayers/swipe/XYSwipeSupport';

const Support = ({ map, layer, active }) => {
    return <XYSwipeSupport map={map} layer={layer} active={active} />;
};

const swipeSupportSelector = createSelector([
    getSelectedLayer,
    layerSwipeSettingsSelector
], (layer, swipeSettings) => ({
    layer: layer?.id,
    active: swipeSettings.active || false
}));

const MapSwipeSupport = connect(swipeSupportSelector, null)(Support);

const SwipePlugin = createPlugin(
    'Swipe',
    {
        component: SwipeSettings,
        containers: {
            TOC: {
                name: "Swipe"
            },
            Map: {
                name: "Swipe",
                Tool: MapSwipeSupport
            }
        }
    }
);

export default SwipePlugin;
