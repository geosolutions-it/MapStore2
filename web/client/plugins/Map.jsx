/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

var Spinner = require('react-spinkit');
require('./map/css/map.css');

const Message = require('../components/I18N/Message');

let plugins;

const MapPlugin = React.createClass({
    propTypes: {
        mapType: React.PropTypes.string,
        map: React.PropTypes.object,
        layers: React.PropTypes.array,
        zoomControl: React.PropTypes.bool,
        mapLoadingMessage: React.PropTypes.string,
        loadingSpinner: React.PropTypes.bool,
        loadingError: React.PropTypes.string,
        tools: React.PropTypes.array,
        options: React.PropTypes.object,
        toolsOptions: React.PropTypes.object,
        actions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            mapType: 'leaflet',
            actions: {},
            zoomControl: true,
            mapLoadingMessage: "map.loading",
            loadingSpinner: true,
            tools: ['measurement', 'locate', 'overview', 'scalebar'],
            options: {},
            toolsOptions: {
                measurement: {},
                locate: {},
                scalebar: {},
                overview: {
                    overviewOpt: {
                        position: 'bottomright',
                        collapsedWidth: 25,
                        collapsedHeight: 25,
                        zoomLevelOffset: -5,
                        toggleDisplay: true
                    },
                    layers: [{type: "osm"}]
                }
            }
        };
    },
    componentWillMount() {
        this.updatePlugins(this.props);
    },
    componentWillReceiveProps(newProps) {
        if (newProps.mapType !== this.props.mapType || newProps.actions !== this.props.actions) {
            this.updatePlugins(newProps);
        }
    },
    renderLayerContent(layer) {
        if (layer.features && layer.type === "vector") {
            return layer.features.map( (feature) => {
                return (
                    <plugins.Feature
                        key={feature.id}
                        type={feature.type}
                        geometry={feature.geometry}
                        msId={feature.id}
                        featuresCrs={ layer.featuresCrs || 'EPSG:4326' }
                        // FEATURE STYLE OVERWRITE LAYER STYLE
                        style={ feature.style || layer.style || null }/>
                );
            });
        }
        return null;
    },
    renderLayers() {
        const projection = this.props.map.projection || 'EPSG:3857';
        return this.props.layers.map((layer, index) => {
            return (
                <plugins.Layer type={layer.type} srs={projection} position={index} key={layer.id || layer.name} options={layer}>
                    {this.renderLayerContent(layer)}
                </plugins.Layer>
            );
        });
    },
    renderSupportTools() {
        return this.props.tools.map((tool) => {
            const Tool = plugins.tools[tool];
            const options = (this.props.toolsOptions[tool] && this.props.toolsOptions[tool][this.props.mapType]) || this.props.toolsOptions[tool] || {};
            return <Tool key={tool} {...options}/>;
        });
    },
    render() {
        if (this.props.map) {
            return (
                <plugins.Map id="map"
                    {...this.props.options}
                    {...this.props.map}
                    zoomControl={this.props.zoomControl}>
                    {this.renderLayers()}
                    {this.renderSupportTools()}
                </plugins.Map>
            );
        }
        if (this.props.loadingError) {
            return (<div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }} className="mapErrorMessage">
                <Message msgId="map.loadingerror"/>:
                    {this.props.loadingError}
            </div>);
        }
        return (<div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
            }} className="mapLoadingMessage">
                {this.props.loadingSpinner ? <Spinner spinnerName="circle" /> : null}
                <Message msgId={this.props.mapLoadingMessage}/>
        </div>);
    },
    updatePlugins(props) {
        plugins = require('./map/index')(props.mapType, props.actions);
    }
});
const {mapSelector} = require('../selectors/map');
const {layerSelectorWithMarkers} = require('../selectors/layers');

const selector = createSelector(
    [mapSelector, layerSelectorWithMarkers, (state) => state.mapInitialConfig && state.mapInitialConfig.loadingError && state.mapInitialConfig.loadingError.data], (map, layers, loadingError) => ({
        map,
        layers,
        loadingError
    })
);
module.exports = {
    MapPlugin: connect(selector)(MapPlugin),
    reducers: {}
};
