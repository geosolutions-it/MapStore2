/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import assign from 'object-assign';
import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;

import ConfigUtils from '../utils/ConfigUtils';
import { getMonitoredState } from '../utils/PluginsUtils';
import ModulePluginsContainer from "../product/pages/containers/ModulePluginsContainer";

const PluginsContainer = connect((state) => ({
    statePluginsConfig: state.plugins,
    mode: urlQuery.mode || state.mode || (state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    pluginsState: assign({}, state && state.controls, state && state.layers && state.layers.settings && {
        layerSettings: state.layers.settings
    }),
    monitoredState: getMonitoredState(state, ConfigUtils.getConfigProp('monitorState'))
}))(ModulePluginsContainer);

class MapViewer extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        params: PropTypes.object,
        statePluginsConfig: PropTypes.object,
        pluginsConfig: PropTypes.object,
        loadMapConfig: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func,
        onPluginsLoaded: PropTypes.func
    };

    static defaultProps = {
        mode: 'desktop',
        className: 'viewer',
        loadMapConfig: () => {},
        onPluginsLoaded: () => {}
    };

    UNSAFE_componentWillMount() {
        this.props.loadMapConfig();
    }

    render() {
        return (<PluginsContainer key="viewer" id="viewer" className={this.props.className}
            pluginsConfig={this.props.pluginsConfig || this.props.statePluginsConfig || ConfigUtils.getConfigProp('plugins')}
            plugins={this.props.plugins}
            params={this.props.params}
            loaderComponent={this.props.loaderComponent}
            onPluginsLoaded={this.props.onPluginsLoaded}
        />);
    }
}

export default MapViewer;
