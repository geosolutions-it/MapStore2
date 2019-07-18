/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const ConfigUtils = require('../../../utils/ConfigUtils');
require('../../assets/css/viewer.css');
let oldLocation;
const Url = require('url');

class MapViewerComponent extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadMapConfig: PropTypes.func,
        onInit: PropTypes.func,
        plugins: PropTypes.object,
        pluginsConfig: PropTypes.object,
        searchWithFilter: PropTypes.func,
        wrappedContainer: PropTypes.object,
        location: PropTypes.object
    };
    static defaultProps = {
        mode: 'desktop',
        plugins: {},
        onInit: () => {},
        searchWithFilter: () => {},
        loadMapConfig: () => {},
        match: {
            params: {}
        }
    };
    componentWillMount() {
        const id = this.props.match.params.mapId || '0';
        this.updateMap(id);
        this.searchWithFilter();
    }
    componentDidUpdate(oldProps) {
        const id = this.props.match.params.mapId || '0';
        const oldId = oldProps.match.params.mapId || '0';
        if (id !== oldId ) {
            this.updateMap(id);
        }
        const search = this.props.location.search || '';
        const oldSearch = oldProps.location.search || '';
        if (id !== oldId || oldSearch !== search) {
            this.searchWithFilter();
        }
    }
    /**
     * parse url by taking the query params arrived to the viewer page
     * @return {object} query object
    */
    getGFIFilter = () => {
        let search = this.props.location.search;
        if (search) {
            // after # the Url.parse does not catch query params, so we use this workaround
            let query = Url.parse("http://localhost:8081/" + this.props.location.search, true).query;
            if (query.layer && query.cql_filter) {
                return query;
            }
        }
        return null;
    }
    render() {
        const WrappedContainer = this.props.wrappedContainer;
        return (<WrappedContainer
            pluginsConfig={this.props.pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.match.params}
            />);
    }
    /**
     * Trigger a GetFeature with a subsequent getFeatureInfo with a point taken from geometry of first feature retrieved
    */
    searchWithFilter = () => {
        const filter = this.getGFIFilter();
        if (filter) {
            this.props.searchWithFilter(filter);
        }
    }
    updateMap = (id) => {
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
            mapId = mapId === 'new' ? null : mapId;
            this.props.onInit();
            this.props.loadMapConfig(configUrl, mapId);
        }
    }
}

module.exports = MapViewerComponent;
