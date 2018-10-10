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

const {get, isEqual} = require('lodash');
const {componentFromProp} = require('recompose');
const Component = componentFromProp('component');

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
        component: PropTypes.any,
        style: PropTypes.object,
        pluginsState: PropTypes.object,
        monitoredState: PropTypes.object,
        defaultMode: PropTypes.string
    };

    static contextTypes = {
        store: PropTypes.object
    };

    static childContextTypes = {
        locale: PropTypes.string,
        messages: PropTypes.object,
        plugins: PropTypes.object,
        pluginsConfig: PropTypes.array,
        loadedPlugins: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        defaultMode: 'desktop',
        component: "div",
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

    getChildContext() {
        return {
            plugins: this.props.plugins,
            pluginsConfig: this.props.pluginsConfig && this.props.pluginsConfig[this.props.mode],
            loadedPlugins: this.state.loadedPlugins
        };
    }

    componentWillMount() {
        this.loadPlugins(this.props.pluginsState);
    }

    componentWillReceiveProps(newProps) {
        this.loadPlugins(newProps.pluginsState, newProps);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.pluginsConfig !== this.props.pluginsConfig
            || nextProps.plugins !== this.props.plugins
            || nextProps.params !== this.props.params
            || nextProps.mode !== this.props.mode
            || nextProps.monitoredState !== this.props.monitoredState
            || nextProps.className !== this.props.className
            || nextProps.style !== this.props.style
            || nextProps.defaultMode !== this.props.defaultMode
            || !isEqual(nextProps.pluginsState, this.props.pluginsState)
            || !isEqual(nextState.loadedPlugins, this.state.loadedPlugins);
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
            // filter out plugins by localConfig hide property (the plugin is hidden when "hide" resolves to true)
            // @deprecated: use cfg.disablePluginIf to achieve the same behaviour
            .filter((Plugin) => !PluginsUtils.handleExpression(this.getState, this.props.plugins && this.props.plugins.requires, Plugin.hide))
            .map(this.getPluginDescriptor)
            // filter out plugins who are disabled (disablePluginIf property in plugin definition or cfg resolves to true)
            .filter(this.filterDisabled)
            // renders only loaded plugins (skip lazy ones, not loaded yet)
            .filter(this.filterLoaded)
            // renders only root plugins (children of other plugins are skipped)
            .filter(this.filterRoot)
            .map((Plugin) => <Plugin.impl key={Plugin.id}
                {...this.props.params} {...Plugin.cfg} pluginCfg={Plugin.cfg} items={Plugin.items}/>);
    };

    render() {
        const pluginsConfig = this.props.pluginsConfig && this.props.pluginsConfig[this.props.mode] ? this.props.pluginsConfig[this.props.mode] : this.props.pluginsConfig[this.props.defaultMode];
        if (pluginsConfig) {
            const {bodyPlugins, ...containerPlugins} = PluginsUtils.mapPluginsPosition(pluginsConfig);
            const containerProps = Object.keys(containerPlugins).reduce( (o, k) => ({
                ...o,
                [k]: this.renderPlugins(containerPlugins[k])
            }), {});
            return (
                <Component id={this.props.id} className={this.props.className} style={this.props.style} component={this.props.component} {...containerProps}>
                    {
                       this.renderPlugins(bodyPlugins)
                    }
                </Component>
            );
        }
        return null;
    }

    filterDisabled = (plugin) => {
        return PluginsUtils.filterDisabledPlugins({
            plugin: plugin && plugin.impl || plugin,
            cfg: plugin && plugin.cfg || {}
        }, this.getState);
    };

    filterLoaded = (plugin) => plugin && !plugin.impl.loadPlugin;

    filterRoot = (plugin) => {
        const container = PluginsUtils.getMorePrioritizedContainer(plugin.impl, this.props.pluginsConfig[this.props.mode], 0);
        // render on root if container is root (plugin === null || plugin.impl === null) or plugin explicitly wants to render on root (doNotHide = true)
        // in addition to the container
        return !container.plugin || !container.plugin.impl || container.plugin.impl.doNotHide;
    };

    loadPlugins = (state, newProps) => {
        const getState = (path) => this.getState(path, newProps);
        (this.props.pluginsConfig && this.props.pluginsConfig[this.props.mode] || [])
            .map((plugin) => PluginsUtils.getPluginDescriptor(getState, this.props.plugins,
                this.props.pluginsConfig[this.props.mode], plugin, this.state.loadedPlugins))
            .filter(plugin => PluginsUtils.filterDisabledPlugins({ plugin: plugin && plugin.impl || plugin, cfg: plugin && plugin.cfg || {}}, getState))
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
