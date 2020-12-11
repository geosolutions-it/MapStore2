/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {loadMapConfig, loadNewMap} from '../../actions/config';
import {initMap} from '../../actions/map';
import MapViewerContainer from '../../containers/MapViewer';
import MapViewerCmp from '../components/viewer/MapViewerCmp';

const urlQuery = url.parse(window.location.href, true).query;

/**
 * Main page for the Map. It is used to render the main page (or context)
 * It renders the plugins dedicated to the map (depending on mobile/desktop/embedded... mode),
 * and it triggers the initial actions to load the map config (using the parameter received in `match` property).
 * @name MapViewer
 * @class
 * @memberof pages
 */
class MapViewerPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadNewMap: PropTypes.func,
        loadMapConfig: PropTypes.func,
        onInit: PropTypes.func,
        plugins: PropTypes.object,
        wrappedContainer: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        location: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        plugins: {},
        match: {
            params: {}
        },
        wrappedContainer: MapViewerContainer
    };

    render() {
        return (<MapViewerCmp {...this.props} />);
    }
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    loadNewMap,
    loadMapConfig,
    onInit: initMap
})(MapViewerPage);
