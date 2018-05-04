const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const ConfigUtils = require('../../utils/ConfigUtils');
const Message = require("../../components/I18N/Message");

const {loadMapConfig} = require('../../actions/config');
const {resetControls} = require('../../actions/controls');

const HolyGrail = require('../../containers/HolyGrail');
/**
  * @name RulesManagerPage
  * @memberof pages
  * @class
  * @classdesc
  * Rules Manager allow a user with admin permissions to easly manage geofence's rules.
  * Configure geoFenceUrl and geoFenceGeoServerInstance params in localConfig.<br/>
  * Add services configuration to overwrite the default values used by the service and the request
  * selectors. See the page's plugins configuration in the following example. <br/>
  * The app is available at http://localhos:8081/#/rules-manager.
  *
  * @example
  * // localConfig configuration example
  * "geoFenceUrl": "http://localhost:8081/",
  * "geoFenceGeoServerInstance": {
  *      "url": "geoserver/",
  *       "id" : 1
  *  }
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
  *   },....
  * "plugins": {
  *  "rulesmanager": [
  *         "Redirect" ,
  *         {
  *             "name": "OmniBar",
  *                 "cfg": {
  *                      "containerPosition": "header",
  *                    "className": "navbar shadow navbar-home"
  *                 }
  *         }, "ManagerMenu", "Login", "Language", "NavMenu",
  *         "Attribution", "RulesDataGrid", "Notifications"
  *         ,{
  *              "name": "RulesEditor",
  *            "cfg": {"containerPosition": "columns"}
  *         }
  *     ]
  * }
*/

class RulesManagerPage extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        mode: PropTypes.string,
        match: PropTypes.object,
        loadMaps: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        name: "rulesmanager",
        mode: 'desktop',
        loadMaps: () => {},
        reset: () => {}
    };

    render() {
        let plugins = ConfigUtils.getConfigProp("plugins") || {};
        let pagePlugins = {
            "desktop": [], // TODO mesh page plugins with other plugins
            "mobile": []
        };
        let pluginsConfig = {
            "desktop": plugins[this.props.name] || [], // TODO mesh page plugins with other plugins
            "mobile": plugins[this.props.name] || []
        };

        return pluginsConfig.desktop.length > 0 && (<HolyGrail
            className="rules-manager"
            id="rules-manager-view-container"
            pagePluginsConfig={pagePlugins}
            pluginsConfig={pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.match.params}
            />) || <div style={{fontSize: 24, position: "absolute", top: 0, bottom: 0, right: 0, left: 0, justifyContent: "center", display: "flex", alignItems: "center"}}><label><Message msgId="rulesmanager.missingconfig"/></label></div>;
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
    {
        loadMapConfig,
        reset: resetControls
    })(RulesManagerPage);
