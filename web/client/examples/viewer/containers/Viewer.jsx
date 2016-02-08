/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const assign = require('object-assign');

const {connect} = require('react-redux');
const {bindActionCreators} = require('redux');

const ConfigUtils = require('../../../utils/ConfigUtils');
const MapInfoUtils = require('../../../utils/MapInfoUtils');

const {loadLocale} = require('../../../actions/locale');

const {changeLocateState, onLocateError} = require('../../../actions/locate');

const {changeMapView, clickOnMap, changeMousePointer} = require('../../../actions/map');

const changeMeasurementState = require('../../../actions/measurement');

const VMap = require('../components/Map');

const Localized = require('../../../components/I18N/Localized');

const Viewer = React.createClass({
    propTypes: {
        map: ConfigUtils.PropTypes.config,
        mapParams: React.PropTypes.object,
        mapOptions: React.PropTypes.object,// specific options to initialize the map tool
        layers: React.PropTypes.object,
        configPlugins: React.PropTypes.array,
        browser: React.PropTypes.object,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        mapInfo: React.PropTypes.object,
        locate: React.PropTypes.object,
        snapshot: React.PropTypes.object,
        mousePosition: React.PropTypes.object,
        mousePositionEnabled: React.PropTypes.bool,
        localeError: React.PropTypes.string,
        loadLocale: React.PropTypes.func,
        changeMapView: React.PropTypes.func,
        changeLayerProperties: React.PropTypes.func,
        getFeatureInfo: React.PropTypes.func,
        changeMapInfoState: React.PropTypes.func,
        changeMousePositionState: React.PropTypes.func,
        changeMousePosition: React.PropTypes.func,
        changeMousePositionCrs: React.PropTypes.func,
        purgeMapInfoResults: React.PropTypes.func,
        clickOnMap: React.PropTypes.func,
        changeMousePointer: React.PropTypes.func,
        activatePanel: React.PropTypes.func,
        floatingPanel: React.PropTypes.object,
        plugins: React.PropTypes.func,
        layerLoading: React.PropTypes.func,
        layerLoad: React.PropTypes.func,
        showSpinner: React.PropTypes.func,
        hideSpinner: React.PropTypes.func,
        changeMeasurementState: React.PropTypes.func,
        measurement: React.PropTypes.object,
        searchResults: React.PropTypes.array,
        changeHelpState: React.PropTypes.func,
        changeHelpText: React.PropTypes.func,
        changeLocateState: React.PropTypes.func,
        onLocateError: React.PropTypes.func
    },
    renderViewer() {
        if (this.props.messages) {
            let plugins = this.props.plugins(this.props);
            if (this.props.configPlugins) {
                let mapPlugins = this.props.configPlugins.map((plugin) => {
                    let props = assign({}, plugin);
                    delete props.type;
                    for (let propName in props) {
                        if (props.hasOwnProperty(propName)) {
                            let value = props[propName];
                            if (value.indexOf("${") === 0) {
                                value = value.substring(2, value.length - 1);
                                value = this.props[value];
                            }
                        }
                    }
                    return React.createElement(require('../components/' + plugin.type), props);
                });
                plugins = plugins.concat(mapPlugins);
            }
            let layers = this.props.mapInfo.showMarker ?
                [...this.props.layers.flat, MapInfoUtils.getMarkerLayer("GetFeatureInfo", this.props.mapInfo.clickPoint.latlng)] :
                [...this.props.layers.flat];
            return (
                <div key="viewer" className="fill">
                    <VMap key="map" config={this.props.map} layers={layers} onMapViewChanges={this.manageNewMapView}
                        onClick={this.props.clickOnMap} onMouseMove={this.manageMousePosition}
                        onLayerLoading={this.props.layerLoading} onLayerLoad={this.props.layerLoad}
                        measurement={this.props.measurement}
                        changeMeasurementState={this.props.changeMeasurementState}
                        locate={this.props.locate} locateMessages={this.props.messages.locate}
                        mapOptions={this.props.mapOptions}
                        changeLocateState={this.props.changeLocateState}
                        onLocateError={this.props.onLocateError}
                        {...this.props.mapParams} />
                {plugins}
                </div>
            );
        }
        return null;
    },
    render() {
        if (this.props.map) {
            let config = this.props.map;
            if (config.loadingError) {
                return <div className="mapstore-error">{config.loadingError}</div>;
            }

            return (
                <Localized messages={this.props.messages} locale={this.props.locale} loadingError={this.props.localeError}>
                    {this.renderViewer()}
                </Localized>
            );
        }
        return null;
    },
    manageNewMapView(center, zoom, bbox, size, mapStateSource, projection) {
        this.props.changeMapView(center, zoom, bbox, size, mapStateSource, projection);
    },
    manageMousePosition(position) {
        if (this.props.mousePositionEnabled) {
            this.props.changeMousePosition(position);
        }
    }
});

var denormalizeGroups = function(layers, groups) {
    let normalizedLayers = layers.map((layer) => assign({}, layer, {expanded: layer.expanded || false}));
    return {
        flat: normalizedLayers,
        groups: groups.map((group) => assign({}, group, {
            nodes: group.nodes.map((layerId) => normalizedLayers.filter((layer) => layer.id === layerId)[0])
        }))
    };
};

module.exports = (actions) => {
    return connect((state) => {
        return {
            map: state.map ? state.map.present : null,
            layers: state.layers ? denormalizeGroups(state.layers.flat, state.layers.groups) : state.layers,
            configPlugins: state.plugins,
            mapHistory: state.map,
            browser: state.browser,
            messages: state.locale ? state.locale.messages : null,
            locale: state.locale ? state.locale.current : null,
            locate: state.locate ? state.locate : {state: "DISABLED"},
            mapInfo: state.mapInfo ? state.mapInfo : {enabled: false, responses: [], requests: {length: 0}, clickPoint: {}, showMarker: false},
            floatingPanel: state.floatingPanel ? state.floatingPanel : {activeKey: ""},
            localeError: state.locale && state.locale.loadingError ? state.locale.loadingError : undefined,
            mousePosition: state.mousePosition ? state.mousePosition.position : null,
            mousePositionCrs: state.mousePosition ? state.mousePosition.crs : null,
            mousePositionEnabled: state.mousePosition ? state.mousePosition.enabled || false : false,
            measurement: state.measurement ? state.measurement : {lineMeasureEnabled: false, areaMeasureEnabled: false, bearingMeasureEnabled: false, geomType: null, len: 0, area: 0, bearing: 0},
            searchResults: state.searchResults || null,
            help: state.help ? state.help : {enabled: false, helpText: ''},
            snapshot: state.snapshot ? state.snapshot : {state: "DISABLED", img: {}}
        };
    }, dispatch => {
        return bindActionCreators(assign({}, {
            loadLocale: loadLocale.bind(null, '../../translations'),
            changeMapView,
            clickOnMap,
            changeMousePointer,
            changeMeasurementState,
            changeLocateState,
            onLocateError
        }, actions), dispatch);
    })(Viewer);
};
