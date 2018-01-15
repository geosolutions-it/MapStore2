/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const assign = require('object-assign');
const Spinner = require('react-spinkit');
require('./map/css/map.css');

const Message = require('../components/I18N/Message');
const ConfigUtils = require('../utils/ConfigUtils');

const {isString} = require('lodash');
let plugins;
const {handleCreationLayerError, handleCreationBackgroundError, resetMapOnInit} = require('../epics/map');
/**
 * The Map plugin allows adding mapping library dependent functionality using support tools.
 * Some are already available for the supported mapping libraries (openlayers, leaflet, cesium), but it's possible to develop new ones.
 * An example is the MeasurementSupport tool that allows implementing measurement on a map.
 * The list of enabled tools can be configured using the tools property, as in the following example:
 *
 * ```
 * {
 * "name": "Map",
 * "cfg": {
 *     "tools": ["measurement", "locate", "overview", "scalebar", "draw", "highlight"]
 *   ...
 *  }
 * }
 * ```
 * // Each tool can be configured using the toolsOptions. Tool configuration can be mapping library dependent:
 * ```
 * "toolsOptions": {
 *        "scalebar": {
 *            "leaflet": {
 *                "position": "bottomright"
 *            }
 *            ...
 *        }
 *        ...
 *    }
 *
 * ```
 * or not
 * ```
 * "toolsOptions": {
 * "scalebar": {
 *        "position": "bottomright"
 *        ...
 *    }
 *    ...
 * ```
 * }
 * In addition to standard tools, you can also develop your own, ad configure them to be used.
 *
 * To do that you need to:
 *  - develop a tool Component, in JSX (e.g. TestSupport), for each supported mapping library
 * ```
 * const React = require('react');
 *    const TestSupport = React.createClass({
 *     propTypes: {
 *            label: PropTypes.string
 *        },
 *        render() {
 *            alert(this.props.label);
 *            return null;
 *        }
 *    });
 *    module.exports = TestSupport;
 * ```
 *  - include the tool(s) in the requires section of plugins.js amd give it a name:
 * ```
 *    module.exports = {
 *        plugins: {
 *            MapPlugin: require('../plugins/Map'),
 *            ...
 *        },
 *        requires: {
 *            ...
 *            TestSupportLeaflet: require('../components/map/leaflet/TestSupport')
 *        }
 *    };
 * ```
 *  - configure the Map plugin including the new tool and related options. You can configure the tool to be used for each mapping library, giving it a name and impl attributes, where:
 * ```
 *    {
 *      "name": "Map",
 *      "cfg": {
 *        "tools": ["measurement", "locate", "overview", "scalebar", "draw", {
 *          "leaflet": {
 *            "name": "test",
 *            "impl": "{context.TestSupportLeaflet}"
 *          }
 *          }],
 *        "toolsOptions": {
 *          "test": {
 *            "label": "Hello"
 *          }
 *          ...
 *        }
 *      }
 *    }
 * ```
 *  - name is a unique name for the tool
 *  - impl is a placeholder (“{context.ToolName}”) where ToolName is the name you gave the tool in plugins.js (TestSupportLeaflet in our example)
 * @memberof plugins
 * @class Map
 * @static
 *
 */
class MapPlugin extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        map: PropTypes.object,
        layers: PropTypes.array,
        zoomControl: PropTypes.bool,
        mapLoadingMessage: PropTypes.string,
        loadingSpinner: PropTypes.bool,
        loadingError: PropTypes.string,
        tools: PropTypes.array,
        options: PropTypes.object,
        mapOptions: PropTypes.object,
        projectionDefs: PropTypes.array,
        toolsOptions: PropTypes.object,
        actions: PropTypes.object,
        features: PropTypes.array,
        securityToken: PropTypes.string
    };

    static defaultProps = {
        mapType: 'leaflet',
        actions: {},
        zoomControl: false,
        mapLoadingMessage: "map.loading",
        loadingSpinner: true,
        tools: ["measurement", "locate", "scalebar", "draw", "highlight"],
        options: {},
        mapOptions: {},
        toolsOptions: {
            measurement: {},
            locate: {},
            scalebar: {
                leaflet: {
                    position: "bottomright"
                }
            },
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
        },
        securityToken: ''
    };

    componentWillMount() {
        this.updatePlugins(this.props);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.mapType !== this.props.mapType || newProps.actions !== this.props.actions) {
            this.updatePlugins(newProps);
        }
    }

    getHighlightLayer = (projection, index) => {
        return (<plugins.Layer type="vector" srs={projection} position={index} key="highlight" options={{name: "highlight"}}>
                    {this.props.features.map( (feature) => {
                        return (<plugins.Feature
                            msId={feature.id}
                            key={feature.id}
                            crs={projection}
                            type={feature.type}
                            geometry={feature.geometry}/>);
                    })}
                </plugins.Layer>);
    };

    getTool = (tool) => {
        if (isString(tool)) {
            return {
                name: tool,
                impl: plugins.tools[tool]
            };
        }
        return tool[this.props.mapType] || tool;
    };

    getMapOptions = () => {
        return this.props.mapOptions && this.props.mapOptions[this.props.mapType] ||
            ConfigUtils.getConfigProp("defaultMapOptions") && ConfigUtils.getConfigProp("defaultMapOptions")[this.props.mapType];
    };

    renderLayers = () => {
        const projection = this.props.map.projection || 'EPSG:3857';
        return this.props.layers.map((layer, index) => {
            return (
                <plugins.Layer type={layer.type} srs={projection} position={index} key={layer.id || layer.name} options={layer} securityToken={this.props.securityToken}>
                    {this.renderLayerContent(layer, projection)}
                </plugins.Layer>
            );
        }).concat(this.props.features && this.props.features.length && this.getHighlightLayer(projection, this.props.layers.length) || []);
    };

    renderLayerContent = (layer, projection) => {
        if (layer.features && layer.type === "vector") {
            return layer.features.map( (feature) => {
                return (
                    <plugins.Feature
                        key={feature.id}
                        msId={feature.id}
                        type={feature.type}
                        crs={projection}
                        geometry={feature.geometry}
                        msId={feature.id}
                        featuresCrs={ layer.featuresCrs || 'EPSG:4326' }
                        // FEATURE STYLE OVERWRITE LAYER STYLE
                        layerStyle={layer.style}
                        style={ feature.style || layer.style || null }
                        properties={feature.properties}/>
                );
            });
        }
        return null;
    };

    renderSupportTools = () => {
        return this.props.tools.map((tool) => {
            const Tool = this.getTool(tool);
            const options = this.props.toolsOptions[Tool.name] && this.props.toolsOptions[Tool.name][this.props.mapType] || this.props.toolsOptions[Tool.name] || {};
            return <Tool.impl key={Tool.name} {...options}/>;
        });
    };

    render() {
        if (this.props.map) {
            return (
                <plugins.Map id="map"
                    {...this.props.options}
                    mapOptions={this.getMapOptions()}
                    projectionDefs={this.props.projectionDefs}
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
                {this.props.loadingSpinner ? <Spinner spinnerName="circle" overrideSpinnerClassName="spinner"/> : null}
                <Message msgId={this.props.mapLoadingMessage}/>
        </div>);
    }

    updatePlugins = (props) => {
        plugins = require('./map/index')(props.mapType, props.actions);
    };
}

const {mapSelector, projectionDefsSelector} = require('../selectors/map');
const {layerSelectorWithMarkers} = require('../selectors/layers');
const {selectedFeatures} = require('../selectors/highlight');
const {securityTokenSelector} = require('../selectors/security');

const selector = createSelector(
    [
        projectionDefsSelector,
        mapSelector,
        layerSelectorWithMarkers,
        selectedFeatures,
        (state) => state.mapInitialConfig && state.mapInitialConfig.loadingError && state.mapInitialConfig.loadingError.data,
        securityTokenSelector
    ], (projectionDefs, map, layers, features, loadingError, securityToken) => ({
        projectionDefs,
        map,
        layers,
        features,
        loadingError,
        securityToken
    })
);
module.exports = {
    MapPlugin: connect(selector)(MapPlugin),
    reducers: {
        draw: require('../reducers/draw'),
        highlight: require('../reducers/highlight')
     },
    epics: assign({}, {handleCreationLayerError, handleCreationBackgroundError, resetMapOnInit})
};
