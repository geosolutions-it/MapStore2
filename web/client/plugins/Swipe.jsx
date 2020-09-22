/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';

import { createPlugin } from '../utils/PluginsUtils';

const MapSwipeSupport = () => {
    return (<div>Swipe Support</div>);
};

const MapSwipeSettingsPanel = () => {
    return (<div id="ms-swipe">Panel settings</div>);
};

const MapSwipeSettingsPlugin = connect(null, {})(MapSwipeSettingsPanel);

const SwipePlugin = createPlugin(
    'Swipe',
    {
        component: MapSwipeSettingsPlugin,
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
