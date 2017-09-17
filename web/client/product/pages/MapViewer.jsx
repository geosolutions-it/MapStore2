/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;
const MapViewer = require('../components/viewer/MapViewer');
const {loadMapConfig} = require('../../actions/config');
const {initMap} = require('../../actions/map');

class MapViewerPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadMapConfig: PropTypes.func,
        onInit: PropTypes.func,
        plugins: PropTypes.object,
        location: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        plugins: {},
        match: {
            params: {}
        }
    };

    render() {
        return (<MapViewer {...this.props} loadMapConfig={this.props.loadMapConfig} />);
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
    {
        loadMapConfig,
        onInit: initMap
    })(MapViewerPage);
