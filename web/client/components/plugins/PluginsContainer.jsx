/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const PluginsUtils = require('../../utils/PluginsUtils');

const PluginsContainer = React.createClass({
    propTypes: {
        mode: React.PropTypes.string,
        params: React.PropTypes.object,
        plugins: React.PropTypes.object,
        pluginsConfig: React.PropTypes.object,
        id: React.PropTypes.string,
        className: React.PropTypes.string,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            mode: 'desktop',
            params: {},
            plugins: {},
            pluginsConfig: {},
            id: "plugins-container",
            className: "plugins-container",
            style: {}
        };
    },
    getPluginDescriptor(plugin) {
        return PluginsUtils.getPluginDescriptor(this.props.plugins,
                this.props.pluginsConfig[this.props.mode], plugin);
    },
    renderPlugins(plugins) {
        return plugins
            .filter((Plugin) => !Plugin.hide)
            .map(this.getPluginDescriptor)
            .map((Plugin) => <Plugin.impl key={Plugin.id}
                {...this.props.params} {...Plugin.cfg} items={Plugin.items}/>);
    },
    render() {
        if (this.props.pluginsConfig) {
            return (
                <div id={this.props.id} className={this.props.className} style={this.props.style}>
                    {this.renderPlugins(this.props.pluginsConfig[this.props.mode])}
                </div>
            );
        }
        return null;
    }
});

module.exports = PluginsContainer;
