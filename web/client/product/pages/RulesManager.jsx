/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {loadMapConfig} from '../../actions/config';
import {resetControls} from '../../actions/controls';
import Message from "../../components/I18N/Message";
import BorderLayout from '../../components/layout/BorderLayout';
import Page from '../../containers/Page';
import ConfigUtils from '../../utils/ConfigUtils';

const urlQuery = url.parse(window.location.href, true).query;


/**
  * @name RulesManager
  * @memberof pages
  * @class
  * @classdesc
  * Rules Manager is a page that allow the user to interact with GeoFence REST API and set-up GeoFence Rules.
  * It works with both stand-alone and GeoServer integrated version of GeoFence (integrated version do not actually support layerDetails).
  *
  * To Configure this tool you have to:
  *
  * 1. *add this page to the appConfig.js `pages` (if not present):*
  *
  * ```
  * {
  *      name: "rulesmanager",
  *      path: "/rules-manager",
  *      component: require('./pages/RulesManager')
  *  }
  *  ```
  * 2. *Setup of this page in localConfig.json* adding the plugins (note `disableDetails` option):
  *
  * ```
  * "plugins": {
  *     "rulesmanager": [
  *         { "name": "Redirect" },
  *         {
  *             "name": "BrandNavbar",
  *             "cfg": {
  *                 "containerPosition": "header"
  *             }
  *         },
  *         { "name": "Home" },
  *         { "name": "ManagerMenu" },
  *         { "name": "Login" },
  *         { "name": "Language" },
  *         { "name": "RulesDataGrid" },
  *         { "name": "Notifications" },
  *         {
  *             "name": "RulesEditor",
  *             "cfg": {
  *                 "containerPosition": "columns",
  *                 "disableDetails": true // Optional - NEEDED for GeoServer Integrated version
  *             }
  *         }
  *     ]
  * }
  * ```
  * The app is available at http://localhost:8081/#/rules-manager.
  *
  * 3. *Setup Base URLs configurations in the localConfig.json root* accordingly to the version of GeoFence you are using (stand-alone or integrated).
  *
  * *GeoFence Stand-Alone*
  *
  * ```
  * "geoFencePath": "geofence/rest",
  * "geoFenceUrl": "https://my-domain.org/",
  * "geoFenceServiceType": "geofence",
  * "geoFenceGeoServerInstance": {
  *   "url": "https://my-domain.org/geoserver/",
  *   "id": 1
  * },
  * ```
  *
  * *GeoServer Integrated*
  *
  * ```
  * "geoFenceUrl": "/geoserver/",
  * "geoFencePath": "rest/geofence",
  * "geoFenceServiceType": "geoserver",
  * "geoFenceLayerServiceType": "rest",
  * "geoserverUserServiceName": "geostore" // optional, if you want to use a specific user service for autocomplete, instead of GeoServer's default one
  * "geoFenceGeoServerInstance": {
  *   "url": "/geoserver/",
  *   "id": 1
  * },
  * ```
  *
  * 4. *Setup of initialState in localConfig.json for rulemanager* to specify services that can be selected in rules manager.
  *
  * ```
  * "initialState": {
  *    "defaultState": {
  *       "rulesmanager": {
  *          "services": {
  *              "WFS": [
  *                 "DescribeFeatureType",
  *                   "GetCapabilities",
  *                   "GetFeature",
  *                   "GetFeatureWithLock",
  *                   "LockFeature",
  *                   "Transaction"
  *               ],
  *              "WMS": [
  *                   "DescribeLayer",
  *                   "GetCapabilities",
  *                   "GetFeatureInfo",
  *                   "GetLegendGraphic",
  *                   "GetMap",
  *                   "GetStyles"
  *               ]
  *           }
  *       }
  *     }
  *   }
  * ```
  *
  * For more information about how to configure plugins ( {@link api/plugins#plugins.RulesEditor} and  {@link api/plugins#plugins.RulesDataGrid}) see the documentation of the specific plugins
*/

class RulesManagerPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func
    };

    static defaultProps = {
        mode: 'desktop'
    };

    render() {
        const plugins = ConfigUtils.getConfigProp("plugins") || {};
        const pluginsConfig = plugins.rulesmanager || [];
        return pluginsConfig.length > 0 && (<Page
            className="rules-manager"
            id="rulesmanager"
            includeCommon={false}
            component={BorderLayout}
            plugins={this.props.plugins}
            params={this.props.match.params}
            loaderComponent={this.props.loaderComponent}
        />) || <div style={{fontSize: 24, position: "absolute", top: 0, bottom: 0, right: 0, left: 0, justifyContent: "center", display: "flex", alignItems: "center"}}><label><Message msgId="rulesmanager.missingconfig"/></label></div>;
    }
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    loadMapConfig,
    reset: resetControls
})(RulesManagerPage);
