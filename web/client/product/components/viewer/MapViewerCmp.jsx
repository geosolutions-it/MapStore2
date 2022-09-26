/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import PropTypes from 'prop-types';
import ConfigUtils from '../../../utils/ConfigUtils';
import '../../assets/css/viewer.css';
let oldLocation;

class MapViewerComponent extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadNewMap: PropTypes.func,
        loadMapConfig: PropTypes.func,
        onInit: PropTypes.func,
        plugins: PropTypes.object,
        pluginsConfig: PropTypes.object,
        loaderComponent: PropTypes.func,
        wrappedContainer: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        location: PropTypes.object,
        className: PropTypes.string,
        onLoaded: PropTypes.func
    };
    static defaultProps = {
        mode: 'desktop',
        plugins: {},
        onInit: () => {},
        loadNewMap: () => {},
        loadMapConfig: () => {},
        match: {
            params: {}
        },
        loaderComponent: () => null,
        onLoaded: () => null
    };

    state = {};

    componentDidUpdate(oldProps) {
        const id = this.props.match.params.mapId || '0';
        const oldId = oldProps.match.params.mapId || '0';
        const contextId = this.props.match.params.contextId;
        const oldContextId = oldProps.match.params.contextId;
        if ((id !== oldId || contextId  !== oldContextId) && this.state.pluginsAreLoaded) {
            this.updateMap(id, contextId);
        }
    }

    onLoaded = (pluginsAreLoaded) => {
        if (pluginsAreLoaded && !this.state.pluginsAreLoaded) {
            this.setState({pluginsAreLoaded: true}, () => {
                const id = this.props.match.params.mapId || '0';
                const contextId = this.props.match.params.contextId;
                this.updateMap(id, contextId);
                this.props.onLoaded(true);
            });
        }
    };
    render() {
        const WrappedContainer = this.props.wrappedContainer;
        return (<WrappedContainer
            pluginsConfig={this.props.pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.match.params}
            className={this.props.className}
            loaderComponent={this.props.loaderComponent}
            onLoaded={this.onLoaded}
        />);
    }

    updateMap = (id, contextId) => {
        if (id && oldLocation !== this.props.location) {
            oldLocation = this.props.location;
            if (!ConfigUtils.getDefaults().ignoreMobileCss) {
                if (this.props.mode === 'mobile') {
                    require('../../assets/css/mobile.css');
                }
            }
            const url = require('url');
            const urlQuery = url.parse(window.location.href, true).query;

            // if 0 it loads config.json
            // if mapId is a string it loads mapId.json
            // if it is a number it loads the config from geostore
            let mapId = id === '0' ? null : id;
            let config = urlQuery && urlQuery.config || null;
            const { configUrl } = ConfigUtils.getConfigUrl({ mapId, config });
            this.props.onInit();

            if (mapId === 'new') {
                this.props.loadNewMap(configUrl, contextId && parseInt(contextId, 10));
            } else {
                this.props.loadMapConfig(configUrl, mapId);
            }
        }
    }
}

export default MapViewerComponent;
