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
import MapViewerLayout from '../components/layout/MapViewerLayout';
import { updateMapLayout } from '../actions/maplayout';

import { createShallowSelectorCreator } from '../utils/ReselectUtils';
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
        component: PropTypes.any,
        onContentResize: PropTypes.func,
        mapLayout: PropTypes.object
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

    handleContentResize = (changed) => {
        if (changed.bottom !== undefined) {
            const bottomOffset = Math.max(0, changed.bottom - 35);
            const {boundingMapRect, layout, boundingSidebarRect} = this.props.mapLayout;

            this.props.onContentResize({
                ...layout,
                ...boundingSidebarRect,
                boundingMapRect: {
                    ...boundingMapRect,
                    bottom: bottomOffset
                }
            });
        }
    };

    render() {
        return (<PluginsContainer key="viewer" id="viewer" className={this.props.className}
            pluginsConfig={this.props.pluginsConfig || this.props.statePluginsConfig || ConfigUtils.getConfigProp('plugins')}
            plugins={this.props.plugins}
            params={this.props.params}
            loaderComponent={this.props.loaderComponent}
            onLoaded={this.props.onLoaded}
            component={this.props.component || ((props) => <MapViewerLayout {...props} onResize={this.handleContentResize} />)}
        />);
    }
}

export default connect((state) => ({
    mapLayout: state.maplayout
}), { onContentResize: updateMapLayout })(MapViewer);
