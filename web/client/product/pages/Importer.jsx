/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const ConfigUtils = require('../../utils/ConfigUtils');

const {resetControls} = require('../../actions/controls');

const HolyGrail = require('../../containers/HolyGrail');
/**
  * @name Importer
  * @memberof pages
  * @class
  * @classdesc
  * Importer allow a user with admin permissions to import data in GeoServer.
  *
  * Requirements:
  *
  * - This page have to be configured in appConfig `pages`. this way
  * ```javascript
  *    pages: [
  *    //...
  *    {
  *      name: "importer",
  *      path: "/importer",
  *      component: require('path_to_/pages/Importer')
  *    }]
  * ```
  * - `localConfig.json` must include an 'importer' entry in the plugins
  *
  * Then this page will be available at http://localhos:8081/#/importer
  *
  * @example
  * // localConfig configuration example
  * "plugins": {
  *  "importer": [
  *         // ...
  *         {
  *             "name": "Importer",
  *            "cfg": {} // see plugin configuration
  *         }
  *     ]
  * }
*/

class ImporterPage extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        mode: PropTypes.string,
        match: PropTypes.object,
        reset: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        name: "importer",
        mode: 'desktop',
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
            className="importer-page"
            id="importer-view-container"
            pagePluginsConfig={pagePlugins}
            pluginsConfig={pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.match.params}
            />);
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
    {
        reset: resetControls
    })(ImporterPage);
