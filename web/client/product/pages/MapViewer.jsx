const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

require('../assets/css/viewer.css');

const {connect} = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const ConfigUtils = require('../../utils/ConfigUtils');
const {loadMapConfig} = require('../../actions/config');
const {initMap} = require('../../actions/map');

const MapViewer = require('../../containers/MapViewer');

let oldLocation;

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

    componentWillMount() {
        if (this.props.match.params.mapId && oldLocation !== this.props.location) {
            oldLocation = this.props.location;
            if (!ConfigUtils.getDefaults().ignoreMobileCss) {
                if (this.props.mode === 'mobile') {
                    require('../assets/css/mobile.css');
                }
            }

            // VMap = require('../components/viewer/Map')(this.props.params.mapType);

            // TODO let's put this into a utils since it will be needed in login section
            let mapId = this.props.match.params.mapId === '0' ? null : this.props.match.params.mapId;
            let config = urlQuery && urlQuery.config || null;
            const {configUrl} = ConfigUtils.getConfigUrl({mapId, config});
            mapId = this.props.match.params.mapId === 'new' ? null : mapId;

            this.props.onInit();
            this.props.loadMapConfig(configUrl, mapId);
        }
    }

    render() {
        return (<MapViewer
            plugins={this.props.plugins}
            params={this.props.match.params}
            />);
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
    {
        loadMapConfig,
        onInit: initMap
    })(MapViewerPage);
