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
const assign = require('object-assign');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const ConfigUtils = require('../utils/ConfigUtils');
const PluginsUtils = require('../utils/PluginsUtils');

const PluginsContainer = connect((state) => ({
    statePluginsConfig: state.plugins,
    mode: urlQuery.mode || state.mode || (state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    pluginsState: assign({}, state && state.controls, state && state.layers && state.layers.settings && {
        layerSettings: state.layers.settings
    }),
    monitoredState: PluginsUtils.getMonitoredState(state, ConfigUtils.getConfigProp('monitorState'))
}))(require('../components/plugins/PluginsContainer'));

class MapViewer extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        params: PropTypes.object,
        statePluginsConfig: PropTypes.object,
        pluginsConfig: PropTypes.object,
        loadMapConfig: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        className: 'viewer',
        loadMapConfig: () => {}
    };

    UNSAFE_componentWillMount() {
        this.props.loadMapConfig();
    }

    render() {
        return (<PluginsContainer key="viewer" id="viewer" className={this.props.className}
            pluginsConfig={this.props.pluginsConfig || this.props.statePluginsConfig || ConfigUtils.getConfigProp('plugins')}
            plugins={this.props.plugins}
            params={this.props.params}
        />);
    }
}

module.exports = MapViewer;
