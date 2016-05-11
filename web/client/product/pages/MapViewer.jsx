/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

require('../assets/css/viewer.css');

const {connect} = require('react-redux');

const url = require('url');

const ConfigUtils = require('../../utils/ConfigUtils');
const PluginsUtils = require('../../utils/PluginsUtils');

const {loadMapConfig} = require('../../actions/config');


const {resetControls} = require('../../actions/controls');

const urlQuery = url.parse(window.location.href, true).query;

const MapViewer = React.createClass({
    propTypes: {
        mode: React.PropTypes.string,
        params: React.PropTypes.object,
        loadMapConfig: React.PropTypes.func,
        reset: React.PropTypes.func,
        plugins: React.PropTypes.object,
        pluginsConfig: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            mode: 'desktop'
        };
    },
    componentWillMount() {
        if (this.props.params.mapType && this.props.params.mapId) {
            if (this.props.mode === 'mobile') {
                require('../assets/css/mobile.css');
            }

            // VMap = require('../components/viewer/Map')(this.props.params.mapType);
            const mapId = (this.props.params.mapId === '0') ? null : this.props.params.mapId;
            const config = urlQuery && urlQuery.config || null;
            const {configUrl} = ConfigUtils.getConfigurationOptions({mapId, config});
            this.props.reset();
            this.props.loadMapConfig(configUrl, mapId !== null);
        }
    },
    getPluginDescriptor(plugin) {
        return PluginsUtils.getPluginDescriptor(this.props.plugins,
                this.props.pluginsConfig[this.props.mode], plugin);
    },
    renderPlugins(plugins) {
        return plugins
            .filter((Plugin) => !Plugin.hide)
            .map(this.getPluginDescriptor)
            .map((Plugin) => <Plugin.impl key={Plugin.name}
                {...this.props.params} {...Plugin.cfg} items={Plugin.items}/>);
    },
    render() {
        if (this.props.pluginsConfig) {
            return (
                <div key="viewer" className="viewer">
                    {this.renderPlugins(this.props.pluginsConfig[this.props.mode])}
                </div>
            );
        }
        return null;
    }
});

module.exports = connect((state) => ({
    pluginsConfig: state.plugins || ConfigUtils.getConfigProp('plugins') || null,
    mode: (urlQuery.mobile || (state.browser && state.browser.touch)) ? 'mobile' : 'desktop'
}),
{
    loadMapConfig,
    reset: resetControls
})(MapViewer);
