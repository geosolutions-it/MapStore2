/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React, {useEffect} from 'react';
import { Glyphicon } from 'react-bootstrap';
import {connect} from 'react-redux';
import { createPlugin } from '../../utils/PluginsUtils';

import { CONTROL_NAME } from './constants';

import StreetViewContainer from './containers/StreetViewContainer';
import { enabledSelector } from './selectors';
import {toggleStreetView, configure, reset} from './actions/streetview';
import streetView from './reducers/streetview';
import * as epics from './epics';
import './css/style.css';

const StreetViewPluginComponent = ({onMount, onUnmount, ...props}) => {
    useEffect(() => {
        onMount(props);
        return () => {
            onUnmount();
        };
    }, []);
    return <StreetViewContainer />;
};

const StreetViewPluginContainer = connect(() => ({}), {
    onMount: configure, onUnmount: reset
})(StreetViewPluginComponent);
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
        component: StreetViewPluginContainer,
        containers: {
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
