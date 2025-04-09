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
import {toggleStreetView, configure, reset, resetViewerData} from './actions/streetView';
import Message from '../../components/I18N/Message';
import { enabledSelector } from './selectors/streetView';

import streetView from './reducers/streetview';
import * as epics from './epics/streetView';
import './style/street-view.less';
import { setControlProperty } from '../../actions/controls';
import MapLocationSupport from './containers/MapLocationSupport';

const StreetViewPluginComponent = ({onMount, onUnmount, resetStViewData, apiKey, useDataLayer, clampToGround, dataLayerConfig, panoramaOptions, provider = 'google', providerSettings, panelSize}) => {
    useEffect(() => {
        onMount({apiKey, useDataLayer, dataLayerConfig, panoramaOptions, provider, providerSettings, clampToGround});
        return () => {
            onUnmount();
        };
    }, [apiKey, useDataLayer, dataLayerConfig, JSON.stringify(panoramaOptions ?? {})]);

    return <StreetViewContainer resetStViewData={resetStViewData} apiKey={apiKey} provider={provider} providerSettings={providerSettings} panelSize={panelSize} />;
};

const StreetViewPluginContainer = connect(() => ({}), {
    onMount: configure, onUnmount: () => {
        return (dispatch, getState) => {
            dispatch(reset());
            if (enabledSelector(getState())) {
                dispatch(setControlProperty(CONTROL_NAME, "enabled", false)); // turn the plugin off when unmounting, if it was on
            }
        };
    }, resetStViewData: () => {
        return (dispatch) => dispatch(resetViewerData());
    }
})(StreetViewPluginComponent);

/**
 * StreetView Plugin. Uses Google Street View services to provide the navigation of Google panoramic photos of street view service through the map.
 * @name StreetView
 * @memberof plugins
 * @property {string} provider the Street View provider. Can be `google`, `cyclomedia` or `mapillary`. It is set to `google` by default.
 * @property {string} cfg.apiKey The API key to use. This is generically valid for all the providers.
 * It is Mandatory in production. Depending on the provider, this can be also configured globally:
 * - `google` provider: In order to allow fine billing strategies (with different API keys), the API key can be defined and customized here in this configuration option or in `localConfig.json` with the following order of priority:
 *      - `apiKeys.googleStreetViewAPIKey` - Use this if you have only one API key for enable for street view JS API for the whole application,
 *      - `apiKeys.googleAPIKey` - Use this if you have a general API key enabled for all Google APIs in MapStore.
 *      - `googleAPIKey` (for retro-compatibility only)
 * - `cyclomedia` provider: The API key is mandatory and can be configured only in the plugin configuration. It is not possible to configure it globally in `localConfig.json`, in `apiKeys.cyclomediaAPIKey`.
 * - `mapillary` provider: currently supporting only the custom GeoJSON data provider
 * @property {string} providerSettings The settings specific for the provider. Depending on the `provider` property, the following settings are available:
 * - `cyclomedia` provider. The `cyclomedia` (StreetSmart) provider allows a set of possible setup. The minimal one allows can include the `apiKey`. In this case the credentials will be asked to the user when the plugin is activated.
 *   Here an example of the full plugin configuration:
 *    ```json
 *      {
 *        "provider": "cyclomedia",
 *        "apiKey": "<your-api-key>",
 *        "providerSettings": {
 *          "srs": "EPSG:7791"
 *        }
 *    ```
 *    A more complex configuration allows to use the Oauth login (and also pre-configure `credentials`, **see Important security note about this**).
 *    In this case the `providerSettings` must include `initOptions` with `loginOauth=true`, `clientId`, `loginRedirectUri` and `logoutRedirectUri`. Moreover:
 *    - the `clientId` must be registered in the Cyclomedia API.
 *    - the pages indicated as `loginRedirectUri` and `logoutRedirectUri` must be
 *      - accessible by the user
 *      - configured in the Cyclomedia API for the instance deployed
 *      - the content of the pages have to contain the JS code to handle the login callback from the API, as indicated in [StreetSmart API documentation](https://docs.cyclomedia.com/StreetSmart/documentation/#oauth).
 *    For more information about the Oauth login, see the [StreetSmart API documentation](https://docs.cyclomedia.com/StreetSmart/documentation/)
 *    Here an example, and below the details for every property:
 *    ```json
 *       {
 *         "provider": "cyclomedia",
 *         "apiKey": "<your-api-key>",
 *         "providerSettings": {
 *           "srs": "EPSG:7791",
 *           "credentials": {
 *             "username": "<your-username>",
 *             "password": "<your-password>"
 *           },
 *           "initOptions": {
 *             "clientId": "<your-client-id>",
 *             "loginOauth": true,
 *             "loginRedirectUri": "<url-to-cm-login.html>",
 *             "logoutRedirectUri": "<url-to-cm-logout.html>"
 *         }
 *        }
 *    ```
 *    - `providerSettings` (optional). The settings specific for the provider. It is an object with the following properties:
 *      - `providerSettings.StreetSmartApiURL` (optional). The URL of the StreetSmart API. Default: `https://streetsmart.cyclomedia.com/api/v23.7/StreetSmartApi.js`.
 *      - `providerSettings.srs` (optional). Coordinate reference system code to use for the API. Default: `EPSG:4326`. Note that the SRS used here must be supported by the StreetSmart API **and** defined in `localConfig.json` file, in `projectionDefs`.
 *      - `providerSettings.credentials` (optional). The credentials to store for the Cyclomedia API. It is an object with `username` and `password` properties.
 *        - **Important Note**: The plugin provides the possibility to configure the credentials in the plugin configuration, but in this case you have to be aware
 *        that this will make these credentials potentially accessible to all the user that can access the context, or if set in `localConfig.json`, to all the users of the application.
 *        This settings should be used only in case the context or the application are shared within a restricted group of users, and this doesn't represent a security issue.
 *        It is up to you to evaluate the security implications of this choice.
 *      - `providerSettings.showLogout` (optional). If true, the plugin will show a login button (only if `initOptions.loginOauth` is set to true). Default: `true`.
 *      - `initOptions` (optional). The options to pass to the StreetSmart API. Default: `{}`. It can contain in particular the options to enable login Oauth:
 *          - `initOptions.loginOauth` (optional). If true, instead of username and password provided by the user or configured in the plugin, the application will use the Oauth login. In this case also the `clientId`, `loginRedirectUri` and `logoutRedirectUri` must be specified in the `localConfig.json` file.
 *          - `initOptions.clientId` (optional). The client ID for the Oauth login. It is mandatory if `loginOauth` is true.
 *          - `initOptions.loginRedirectUri` (optional). The redirect URI after login. It is mandatory if `loginOauth` is true. The page must be accessible and configured in StreetSmart API for the instance.
 *          - `initOptions.logoutRedirectUri` (optional). The redirect URI after logout. It is mandatory if `loginOauth` is true. The page must be configured to handle the login callback StreetSmart API for the instance.
 *          - `initOptions.doOAuthLogoutOnDestroy` (optional). If true, the plugin will logout from the StreetSmart API when the plugin is destroyed. Default: `false`.
 * - `mapillary` provider:
 *   - `providerSettings.ApiURL` The URL of the the custom Geojson endpoint API. Currently is only supported a custom GeoJSON format. Example of endpoint is `https://hostname/directory-with-images/`, ensure the directory contains all the images and the index.json (GeoJSON) file
 * Generally speaking, you should prefer general settings in `localConfig.json` over the plugin configuration, in order to reuse the same configuration for default viewer and all the contexts, automatically. This way you will not need to configure the `apiKey` in every context.
 * <br>**Important**: You can use only **one** API-key for a MapStore instance. The api-key can be configured replicated in every plugin configuration or using one of the unique global settings (suggested) in `localConfig.json`). @see {@link https://github.com/googlemaps/js-api-loader/issues/5|here} and @see {@link https://github.com/googlemaps/js-api-loader/issues/100|here}
 * @property {boolean} [cfg.useDataLayer=true] If true, adds to the map a layer for street view data availability when the plugin is turned on.
 * @property {object} [cfg.dataLayerConfig] configuration for the data layer. By default `{provider: 'custom', type: "tileprovider", url: "https://mts1.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x={x}&y={y}&z={z}"}`
 * @property {object} [cfg.panoramaOptions] options to configure the panorama. {@link https://developers.google.com/maps/documentation/javascript/reference/street-view#panoramaOptions|Reference for google maps API}
 * @property {object} [cfg.panelSize] option to configure default street view modal panel size `width` and `height`. Example: `{"width": 500, "height": 500}`.
 * @property {string} [cfg.markerColor] color for the location marker
 * @property {boolean} [cfg.clampToGround] ensure to place markers on the globe surface
 * @class
 */
export default createPlugin(
    'StreetView',
    {
        options: {
            disablePluginIf: "{state('mapType') === 'leaflet'}"
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
                        bsStyle: enabledSelector(state) ? 'primary' : 'tray',
                        active: enabledSelector(state) || false
                    };
                }
            },
            Map: {
                Tool: MapLocationSupport,
                name: 'StreetViewMapLocationSupport',
                alwaysRender: true
            }
        }
    }
);
