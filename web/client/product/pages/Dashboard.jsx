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

const {loadMapConfig} = require('../../actions/config');
const {resetControls} = require('../../actions/controls');

const HolyGrail = require('../../containers/HolyGrail');

class MapsPage extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        mode: PropTypes.string,
        match: PropTypes.object,
        loadMaps: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        name: "dashboard",
        mode: 'desktop',
        loadMaps: () => {},
        reset: () => {}
    };

    componentWillMount() {
        if (this.props.match.params.mapType && this.props.match.params.mapId) {
            if (this.props.mode === 'mobile') {
                require('../assets/css/mobile.css');
            }
            this.props.reset();
            this.props.loadMaps(ConfigUtils.getDefaults().geoStoreUrl, ConfigUtils.getDefaults().initialMapFilter || "*");
        }
    }

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

        return (<HolyGrail
            id="dashboard-view-container"
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
        loadMapConfig,
        reset: resetControls
    })(MapsPage);
