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
import url from 'url';
import isEqual from 'lodash/isEqual';
const urlQuery = url.parse(window.location.href, true).query;

import ConfigUtils from '../utils/ConfigUtils';
import { getMonitoredState } from '../utils/PluginsUtils';
import ModulePluginsContainer from "../product/pages/containers/ModulePluginsContainer";
import { createShallowSelectorCreator } from '../utils/ReselectUtils';
import BorderLayout from '../components/layout/BorderLayout';

const PluginsContainer = connect(
    createShallowSelectorCreator(isEqual)(
        state => state.plugins,
        state => state.mode,
        state => state?.browser?.mobile,
        state => state.controls,
        state => getMonitoredState(state, ConfigUtils.getConfigProp('monitorState')),
        (statePluginsConfig, stateMode, mobile, controls, monitoredState) => ({
            statePluginsConfig,
            mode: urlQuery.mode || stateMode || (mobile ? 'mobile' : 'desktop'),
            pluginsState: controls,
            monitoredState
        })
    )
)(ModulePluginsContainer);

class MapViewer extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        params: PropTypes.object,
        statePluginsConfig: PropTypes.object,
        pluginsConfig: PropTypes.object,
        loadMapConfig: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func,
        onLoaded: PropTypes.func,
        component: PropTypes.any
    };

    static defaultProps = {
        mode: 'desktop',
        className: 'viewer',
        loadMapConfig: () => {},
        onLoaded: () => {}
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
            onLoaded={this.props.onLoaded}
            component={this.props.component || BorderLayout}
        />);
    }
}

export default MapViewer;
