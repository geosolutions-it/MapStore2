/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { Glyphicon } from 'react-bootstrap';


import { createPlugin } from '../../utils/PluginsUtils';

import { CONTROL_NAME } from './constants';

import SVPanel from './containers/StreetViewContainer';
import { enabledSelector } from './selectors';
import {toggleStreetView} from './actions';
import streetView from './reducer';
import * as epics from './epics';
import './css/style.css';
// import StreetViewSupport from './containers/StreetViewSupport';

/**
 * StreetView Plugin
 * @name StreetView
 * @memberof plugins
 * @class
 */
export default createPlugin(
    'StreetView',
    {
        options: {
            disablePluginIf: "{state('mapType') === 'leaflet' || state('mapType') === 'cesium'}"
        },
        epics,
        reducers: {
            streetView
        },
        component: SVPanel,
        containers: {
            /*
            Map: {
                name: CONTROL_NAME,
                Tool: StreetViewSupport
            },
            */
            Toolbar: {
                name: CONTROL_NAME,
                position: 6,
                tooltip: "streetView.tooltip",
                icon: <Glyphicon glyph="road" />,
                action: () => toggleStreetView(),
                selector: (state) => ({
                    bsStyle: enabledSelector(state) ? "success" : "primary",
                    active: enabledSelector(state)
                })
            }
        }
    }
);
