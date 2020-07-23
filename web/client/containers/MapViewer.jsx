/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import assign from 'object-assign';
import { isArray } from 'lodash';

import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;

import PluginsContainerCmp from '../components/plugins/PluginsContainer';

import ConfigUtils from '../utils/ConfigUtils';
import PluginsUtils from '../utils/PluginsUtils';

const PluginsContainer = connect((state) => ({
    statePluginsConfig: state.plugins,
    mode: urlQuery.mode || state.mode || (state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    pluginsState: assign({}, state && state.controls, state && state.layers && state.layers.settings && {
        layerSettings: state.layers.settings
    }),
    monitoredState: PluginsUtils.getMonitoredState(state, ConfigUtils.getConfigProp('monitorState'))
}))(PluginsContainerCmp);

export default class MapViewer extends React.Component {
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

    getPluginsConfig() {
        const pluginsConfig = this.props.pluginsConfig || this.props.statePluginsConfig || ConfigUtils.getConfigProp('internalPlugins') || {};

        if (isArray(pluginsConfig)) {
            return {
                desktop: pluginsConfig,
                mobile: pluginsConfig,
                embedded: pluginsConfig
            };
        }
        if (pluginsConfig.desktop || pluginsConfig.mobile) {
            return {
                desktop: pluginsConfig.desktop ?? pluginsConfig.mobile ?? pluginsConfig.embedded ?? [],
                mobile: pluginsConfig.mobile ?? pluginsConfig.desktop ?? pluginsConfig.embedded ?? [],
                embedded: pluginsConfig.embedded ?? pluginsConfig.desktop ?? pluginsConfig.mobile ?? []
            };
        }

        const mapViewerConf = pluginsConfig.mapviewer;

        return {
            desktop: mapViewerConf?.desktop ?? [],
            mobile: mapViewerConf?.mobile ?? [],
            embedded: mapViewerConf?.embedded ?? []
        };
    }

    render() {
        return (<PluginsContainer key="viewer" id="viewer" className={this.props.className}
            pluginsConfig={this.getPluginsConfig()}
            plugins={this.props.plugins}
            params={this.props.params}
        />);
    }
}
