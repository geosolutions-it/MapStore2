/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import assign from 'object-assign';
import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;
import { getMonitoredState } from '../utils/PluginsUtils';
import ConfigUtils from '../utils/ConfigUtils';

const PluginsContainer = connect((state) => ({
    mode: urlQuery.mode || (state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    pluginsState: assign({}, state && state.controls, state && state.layers && state.layers.settings && {
        layerSettings: state.layers.settings
    }),
    monitoredState: getMonitoredState(state, ConfigUtils.getConfigProp('monitorState'))
}))(require('../components/plugins/PluginsContainer').default);

class Embedded extends React.Component {
    static propTypes = {
        params: PropTypes.object,
        plugins: PropTypes.object,
        pluginsConfig: PropTypes.object,
        onInit: PropTypes.func
    };

    static defaultProps = {
        mode: 'desktop',
        pluginsConfig: {
            desktop: [],
            mobile: []
        },
        onInit: () => {}
    };

    UNSAFE_componentWillMount() {
        this.props.onInit();
    }

    render() {
        return (<PluginsContainer key="embedded" id="mapstore2-embedded" className="mapstore2-embedded"
            pluginsConfig={this.props.pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.params}
        />);
    }
}

export default Embedded;
