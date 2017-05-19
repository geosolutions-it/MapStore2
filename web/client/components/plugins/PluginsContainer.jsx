const PropTypes = require('prop-types');
/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const PluginsUtils = require('../../utils/PluginsUtils');

const assign = require('object-assign');

const {get} = require('lodash');

/**
 * Container for plugins. Get's the plugin definitions (`plugins`) and configuration (`pluginsConfig`)
 * to render the configured plugins.
 * The plugins to render will come from the `mode` entry of the `pluginsConfig`
 * @class
 * @memberof components.plugins
 * @prop {string} mode key of the pluginsConfig object to get the plugins to render
 * @prop {string} defaultMode mode to use if mode is not defined
 * @prop {object} params params of the current page, usually from react router. Used as state to get plugins descriptor if monitored state is not present.
 * @prop {object} plugins the Plugins definitions
 * @prop {object} pluginsConfig the configuration for the plugins. a map of [mode]: [{pluginCfg1}...]
 * @prop {object} pluginsState a piece of state to use. usually controls.
 * @prop {object} monitoredState the piece of state to monitor Used as state to get plugins descriptor.
 */
class PluginsContainer extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        params: PropTypes.object,
        plugins: PropTypes.object,
        pluginsConfig: PropTypes.object,
        id: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object,
        pluginsState: PropTypes.object,
        monitoredState: PropTypes.object,
        defaultMode: PropTypes.string
    };

    static contextTypes = {
        store: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        defaultMode: 'desktop',
        params: {},
        plugins: {},
        pluginsConfig: {},
        id: "plugins-container",
        className: "plugins-container",
        style: {},
        pluginsState: {},
        monitoredState: {}
    };

    state = {
        loadedPlugins: {}
    };

    componentWillMount() {
        this.loadPlugins(this.props.pluginsState);
    }

    componentWillReceiveProps(newProps) {
        this.loadPlugins(newProps.pluginsState, newProps);
    }

    getState = (path, newProps) => {
        let props = newProps || this.props;
        return get(props.monitoredState, path) || get(this.props.params, path) || this.context[path];
    };

    getPluginDescriptor = (plugin) => {
        return PluginsUtils.getPluginDescriptor(this.getState, this.props.plugins,
                    this.props.pluginsConfig[this.props.mode], plugin, this.state.loadedPlugins);
    };

    renderPlugins = (plugins) => {
        return plugins
            .filter((Plugin) => !PluginsUtils.handleExpression(this.getState, this.props.plugins && this.props.plugins.requires, Plugin.hide))
            .map(this.getPluginDescriptor)
            .filter(plugin => PluginsUtils.filterDisabledPlugins({plugin: plugin && plugin.impl || plugin}, this.getState))
            .filter((Plugin) => Plugin && !Plugin.impl.loadPlugin)
            .filter(plugin => PluginsUtils.filterDisabledPlugins({plugin: plugin && plugin.impl || plugin}, this.getState))
            .filter(this.filterPlugins)
            .map((Plugin) => <Plugin.impl key={Plugin.id}
                {...this.props.params} {...Plugin.cfg} pluginCfg={Plugin.cfg} items={Plugin.items}/>);
    };

    render() {
        if (this.props.pluginsConfig) {
            return (
                <div id={this.props.id} className={this.props.className} style={this.props.style}>
                    {
                     this.props.pluginsConfig[this.props.mode] ? this.renderPlugins(this.props.pluginsConfig[this.props.mode]) : this.props.pluginsConfig[this.props.defaultMode]
                    }
                </div>
            );
        }
        return null;
    }

    filterPlugins = (Plugin) => {
        const container = PluginsUtils.getMorePrioritizedContainer(Plugin.impl, this.props.pluginsConfig[this.props.mode], 0);
        return !container.plugin || !container.plugin.impl || container.plugin.impl.doNotHide;
    };

    loadPlugins = (state, newProps) => {
        const getState = (path) => this.getState(path, newProps);
        (this.props.pluginsConfig && this.props.pluginsConfig[this.props.mode] || [])
            .map((plugin) => PluginsUtils.getPluginDescriptor(getState, this.props.plugins,
                this.props.pluginsConfig[this.props.mode], plugin, this.state.loadedPlugins))
            .filter(plugin => PluginsUtils.filterDisabledPlugins({plugin: plugin && plugin.impl || plugin}, getState))
            .filter((plugin) => plugin && plugin.impl.loadPlugin).forEach((plugin) => {
                if (!this.state.loadedPlugins[plugin.name]) {
                    if (!plugin.impl.enabler || plugin.impl.enabler(state)) {
                        plugin.impl.loadPlugin((impl) => this.loadPlugin(plugin, impl));
                    }
                }
            });
    };

    loadPlugin = (plugin, impl) => {
        this.setState({
            loadedPlugins: assign({}, this.state.loadedPlugins, {[plugin.name]: impl})
        });
    };
}

module.exports = PluginsContainer;
