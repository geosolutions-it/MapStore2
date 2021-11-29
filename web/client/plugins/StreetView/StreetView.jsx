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
import {toggleStreetView, configure, reset} from './actions/streetView';
import streetView from './reducers/streetview';
import * as epics from './epics/streetView';
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
 * StreetView Plugin. Uses Google Street View services to provide the navigation of Google panoramic photos of street view service through the map.
 * @name StreetView
 * @memberof plugins
 * @property {string} cfg.apiKey The API key to use.
 * Mandatory in production. In order to allow fine billing strategies (with different API keys), the API key can be defined and customized here in this configuration option or in `localConfig.json` at, in order of priority one of:
 * - `apiKeys.googleStreetViewAPIKey`,
 * - `apiKeys.googleAPIKey`,
 * - `googleAPIKey`.
 * @property {boolean} [cfg.useDataLayer=true] If true, adds to the map a layer for street view data availability when the plugin is turned on.
 * @property {object} [cfg.dataLayerConfig] configuration for the data layer. By default `{provider: 'custom', type: "tileprovider", url: "https://mts1.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x={x}&y={y}&z={z}"}`
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
            BurgerMenu: {
                position: 40,
                priority: 2,
                doNotHide: true,
                name: CONTROL_NAME,
                text: <Message msgId="streetView.title"/>,
                tooltip: "streetView.tooltip",
                icon: <Glyphicon glyph="road" />,
                action: () => toggleStreetView()
            }
        }
    }
);
