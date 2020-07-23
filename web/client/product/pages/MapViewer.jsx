/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;

import MapViewerCmp from '../components/viewer/MapViewerCmp';
import {loadNewMap, loadMapConfig} from '../../actions/config';
import {initMap} from '../../actions/map';
import MapViewerContainer from '../../containers/MapViewer';

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
