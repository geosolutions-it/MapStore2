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

import ConfigUtils from '../utils/ConfigUtils';
import {compose} from "redux";
import PluginsContainerComponent from "../components/plugins/PluginsContainer";

const PluginsContainer = compose(
    connect((state) => ({
        statePluginsConfig: state.plugins,
        pluginsState: assign({}, state && state.controls, state && state.layers && state.layers.settings && {
            layerSettings: state.layers.settings
        })
    }))
)(PluginsContainerComponent);

class MapViewer extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        params: PropTypes.object,
        statePluginsConfig: PropTypes.object,
        pluginsConfig: PropTypes.object,
        loadMapConfig: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func
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
            loaderComponent={this.props.loaderComponent}
        />);
    }
}

export default MapViewer;
