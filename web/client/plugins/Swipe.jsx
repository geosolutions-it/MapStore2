/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { getSelectedLayer } from '../selectors/layers';

import { createPlugin } from '../utils/PluginsUtils';

import SwipeSettings from './SwipeSettings';
import EffectSupport from '../components/swipe/EffectSupport';

let mousePosition;

const addHandle = (map) => {
    // TODO: for the moment on mouse move, it should be draggable
    const container = map.getTargetElement();
    // let mousePosition = null;

    container.addEventListener('mousemove', (event) => {
        mousePosition = map.getEventPixel(event);
        // setSize(mousePosition[0]);
        // drawVerticalHandler
        map.render();
    });

    container.addEventListener('mouseout', () => {
        mousePosition = null;
        map.render();
    });
    // TODO: add draggable handler on the map
};

// For now we're testing Effect support
const Support = ({ map, layer }) => {
    useEffect(() => {
        addHandle(map);
    }, []);
    return (<EffectSupport
        map={map}
        layer={layer}
        type="circle"
        getSize={() => 500}
        getHeight={() => 250}
        circleCutProp={{
            getMousePosition: () => mousePosition,
            radius: 100  // TODO: radius from configuration
        }} />);
};

const swipeSupportSelector = createSelector([
    getSelectedLayer
], (layer) => ({
    layer: layer?.id
}));

const MapSwipeSupport = connect(swipeSupportSelector, {})(Support);

const SwipePlugin = createPlugin(
    'Swipe',
    {
        component: SwipeSettings,
        containers: {
            TOC: {
                name: "Swipe",
                button: () => <div>Toggle btn</div>
            },
            Map: {
                name: "Swipe",
                Tool: MapSwipeSupport
            }
        }
    }
);

export default SwipePlugin;
