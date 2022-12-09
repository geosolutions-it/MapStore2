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
import Message from '../../components/I18N/Message';

import streetView from './reducers/streetview';
import * as epics from './epics/streetView';
import './css/style.css';

const StreetViewPluginComponent = ({onMount, onUnmount, apiKey, useDataLayer, dataLayerConfig, panoramaOptions}) => {
    useEffect(() => {
        onMount({apiKey, useDataLayer, dataLayerConfig, panoramaOptions});
        return () => {
            onUnmount();
        };
    }, [apiKey, useDataLayer, dataLayerConfig, JSON.stringify(panoramaOptions ?? {})]);
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
 * Mandatory in production. In order to allow fine billing strategies (with different API keys), the API key can be defined and customized here in this configuration option or in `localConfig.json` with the following order of priority:
 * - `apiKeys.googleStreetViewAPIKey` - Use this if you have only one API key for enable for street view JS API for the whole application,
 * - `apiKeys.googleAPIKey` - Use this if you have a general API key enabled for all Google APIs in MapStore.
 * - `googleAPIKey` (for retro-compatibility only)
 *
 * Generally speaking, you should prefer general settings in `localConfig.json` over the plugin configuration, in order to reuse the same configuration for default viewer and all the contexts, automatically. This way you will not need to configure the `apiKey` in every context.
 * <br>**Important**: You can use only **one** API-key for a MapStore instance. The api-key can be configured replicated in every plugin configuration or using one of the unique global settings (suggested) in `localConfig.json`). @see {@link https://github.com/googlemaps/js-api-loader/issues/5|here} and @see {@link https://github.com/googlemaps/js-api-loader/issues/100|here}
 * @property {boolean} [cfg.useDataLayer=true] If true, adds to the map a layer for street view data availability when the plugin is turned on.
 * @property {object} [cfg.dataLayerConfig] configuration for the data layer. By default `{provider: 'custom', type: "tileprovider", url: "https://mts1.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x={x}&y={y}&z={z}"}`
 * @property {object} [cfg.panoramaOptions] options to configure the panorama. {@link https://developers.google.com/maps/documentation/javascript/reference/street-view#panoramaOptions|Reference for google maps API}
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
            },
            SidebarMenu: {
                position: 40,
                priority: 1,
                doNotHide: true,
                name: CONTROL_NAME,
                text: <Message msgId="streetView.title"/>,
                tooltip: "streetView.tooltip",
                icon: <Glyphicon glyph="road" />,
                action: () => toggleStreetView(),
                selector: (state) => {
                    return {
                        bsStyle: state.controls["street-view"] && state.controls["street-view"].enabled ? 'primary' : 'tray',
                        active: state.controls["street-view"] && state.controls["street-view"].enabled || false
                    };
                }
            }
        }
    }
);
