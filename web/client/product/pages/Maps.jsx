/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {resetControls} from '../../actions/controls';
import {loadMaps} from '../../actions/maps';
import Page from '../../containers/Page';
import ConfigUtils from '../../utils/ConfigUtils';

import("../assets/css/maps.css");

const urlQuery = url.parse(window.location.href, true).query;

/**
  * @name Maps
  * @memberof pages
  * @class
  * @classdesc
  * This is the home page of MapStore.
  * Renders plugins and triggers the initial load action for loading contents in the page.
  */
class MapsPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        reset: PropTypes.func,
        loadMaps: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func
    };

    static defaultProps = {
        mode: 'desktop',
        reset: () => {}
    };

    state = {};

    UNSAFE_componentWillMount() {
        if (this.props.match.params.mapType && this.props.match.params.mapId) {
            if (this.props.mode === 'mobile') {
                require('../assets/css/mobile.css');
            }
            this.props.reset();
        }
    }

    onPluginsLoaded = (pluginsAreLoaded) => {
        if (pluginsAreLoaded && !this.state.pluginsAreLoaded) {
            this.setState({pluginsAreLoaded: true}, () => {
                this.props.loadMaps();
            });
        }
    }

    render() {
        return (<Page
            id="maps"
            onPluginsLoaded={this.onPluginsLoaded}
            plugins={this.props.plugins}
            params={this.props.match.params}
            loaderComponent={this.props.loaderComponent}
        />);
    }
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    loadMaps: () => loadMaps(
        ConfigUtils.getDefaults().geoStoreUrl,
        ConfigUtils.getDefaults().initialMapFilter || "*"
    ),
    reset: resetControls
})(MapsPage);
