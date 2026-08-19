/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import PropTypes from 'prop-types';
import React from 'react';
import { connect, createPlugin } from '../utils/PluginsUtils';
import './map/css/map.css';
import Message from '../components/I18N/Message';
import ConfigUtils from '../utils/ConfigUtils';
import { setMapResolutions, mapPluginLoad } from '../actions/map';
import { isString } from 'lodash';
import selector from './map/selector';
import MapSettings from './map/mapsettings/MapSettings';
import mapReducer from "../reducers/map";
import layersReducer from "../reducers/layers";
import drawReducer from "../reducers/draw";
import boxReducer from '../reducers/box';
import highlightReducer from "../reducers/highlight";
import mapTypeReducer from "../reducers/maptype";
import additionalLayersReducer from "../reducers/additionallayers";
import mapEpics from "../epics/map";
import pluginsCreator from "./map/index";
import withScalesDenominators from "../components/map/enhancers/withScalesDenominators";
import { createVectorFeatureFilter } from '../utils/FilterUtils';
import ErrorPanel from '../components/map/ErrorPanel';
import catalog from "../epics/catalog";
import backgroundSelector from "../epics/backgroundselector";
import API from '../api/catalog';
import { MapLibraries } from '../utils/MapTypeUtils';
import { groupWMSLayers } from '../utils/WMSCoalesceUtils';
import {getHighlightLayerOptions} from "../utils/HighlightUtils";
import Spinner from '../components/layout/Spinner';
import { MAIN_MAP_CONTAINER_ID } from '../utils/MapUtils';

/**
 * The Map plugin allows adding mapping library dependent functionality using support tools.
 * Some are already available for the supported mapping libraries (openlayers, leaflet, cesium), but it's possible to develop new ones.
 * The list of enabled tools can be configured using the tools property, as in the following example:
 *
 * ```
 * {
 * "name": "Map",
 * "cfg": {
 *     "tools": ["overview", "scalebar", "draw", "highlight"]
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
 * }
 * ```
 * In addition to standard tools, you can also develop your own, ad configure them to be used.
 *
 * To do that you need to:
 *  - develop a tool Component, in JSX (e.g. TestSupport), for each supported mapping library
 * ```
 * const React = require('react');
 *    class TestSupport extends React.Component {
 *     static propTypes = {
 *            label: PropTypes.string
 *        }
 *        render() {
 *            alert(this.props.label);
 *            return null;
 *        }
 *    }
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
 *        "tools": ["overview", "scalebar", "draw", {
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
 *
 * You can no longer specify a list of fonts that have to be loaded before map rendering, we are now only loading FontAwesome for the icons
 * We will pre-load FontAwesome only if needed, i.e you need to show markers with symbols (e.g. Annotations).
 *
 * An additional feature to is limit the area and/or the minimum level of zoom in the localConfig.json file using "mapConstraints" property
 *
 *  e.g
 * ```json
 * "mapConstraints": {
 *  "minZoom": 12, // minimal allowed zoom used by default
 *  "crs":"EPSG:3857", // crs of the restrictedExtent
 *  "restrictedExtent":[ // limits the area accessible to the user to this bounding box
 *    1060334.456371965,5228292.734706056,
 *    1392988.403469052,5503466.036532691
 *   ],
 *   "projectionsConstraints": {
 *       "EPSG:1234": { "minZoom": 5 } // customization of minZoom for different projections
 *   }
 *  }
 * ```
 *
 * With this setup you can configure a restricted area and/or a minimum zoom level for the whole application.
 * If you have different reference systems for your maps, for each of them you can even set a minimum zoom
 * using the entry `projectionsConstraints` as written in the example.
 *
 * ```
 *
 * @memberof plugins
 * @class Map
 * @prop {array} additionalLayers static layers available in addition to those loaded from the configuration
 * @prop {boolean} coalesceWMSLayers when true, adjacent WMS layers from the same source with compatible options are combined into a single GetMap request to reduce the number of requests sent to the server (default false); if not set, falls back to the current map's `mapOptions.coalesceWMSLayers` (set from Map Settings) and then to `miscSettings.coalesceWMSLayers` in localConfig.json; a layer can opt out with `coalesce: false` in its own options; not supported on leaflet, where it is always disabled
 * @prop {number} coalesceWMSLayersMaxGroupSize maximum number of WMS layers that can be combined into a single coalesced GetMap request (default 10)
 * @prop {object} mapOptions map options grouped by map type
 * @prop {boolean} mapOptions.cesium.navigationTools enable cesium navigation tool (default false)
 * @prop {boolean} mapOptions.cesium.showSkyAtmosphere enable sky atmosphere of the globe (default true)
 * @prop {boolean} mapOptions.cesium.showGroundAtmosphere enable ground atmosphere of the globe (default false)
 * @prop {boolean} mapOptions.cesium.enableFog enable fog in the view (default false)
 * @prop {boolean} mapOptions.cesium.depthTestAgainstTerrain if true all primitive 3d features will be tested against the terrain while if false they will be drawn on top of the terrain even if hidden by it (default true)
 * @prop {number} mapOptions.cesium.maximumZoomDistance max zoom limit (in meter unit) to restrict the zoom out operation based on it
 * @prop {number} mapOptions.cesium.minimumZoomDistance  min zoom limit (in meter unit) to restrict the zoom in operation based on it
 * @prop {boolean} mapOptions.cesium.enableImageryOverlay when true, enables draping of 2D imagery layers (WMS, TMS, WMTS) over 3D Tiles with sequential rendering in TOC order; this global setting is automatically applied to each 3D Tiles layer added to the map (default true)
 * @static
 * @example
 * // Adding a layer to be used as a source for the elevation (shown in the MousePosition plugin configured with showElevation = true)
 * {
 *   "cfg": {
 *     "additionalLayers": [{
 *         "type": "wms",
 *         "url": "http://localhost:8090/geoserver/wms",
 *         "visibility": true,
 *         "title": "Elevation",
 *         "name": "topp:elevation",
 *         "format": "application/bil16",
 *         "useForElevation": true,
 *         "nodata": -9999,
 *         "littleendian": false,
 *         "hidden": true
 *      }]
 *   }
 * }
 *
 */


class MapPlugin extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        map: PropTypes.object,
        layers: PropTypes.array,
        additionalLayers: PropTypes.array,
        zoomControl: PropTypes.bool,
        mapLoadingMessage: PropTypes.string,
        loadingSpinner: PropTypes.bool,
        loadingError: PropTypes.string,
        tools: PropTypes.array,
        options: PropTypes.object,
        mapOptions: PropTypes.object,
        projectionDefs: PropTypes.array,
        toolsOptions: PropTypes.object,
        onResolutionsChange: PropTypes.func,
        actions: PropTypes.object,
        features: PropTypes.array,
        securityToken: PropTypes.string,
        elevationEnabled: PropTypes.bool,
        isLocalizedLayerStylesEnabled: PropTypes.bool,
        localizedLayerStylesName: PropTypes.string,
        currentLocaleLanguage: PropTypes.string,
        items: PropTypes.array,
        onLoadingMapPlugins: PropTypes.func,
        onMapTypeLoaded: PropTypes.func,
        pluginsCreator: PropTypes.func,
        mapTitle: PropTypes.string,
        coalesceWMSLayers: PropTypes.bool,
        coalesceWMSLayersMaxGroupSize: PropTypes.number,
        coalesceExcludeIds: PropTypes.array
    };

    static defaultProps = {
        mapType: MapLibraries.OPENLAYERS,
        actions: {},
        zoomControl: false,
        mapLoadingMessage: "map.loading",
        loadingSpinner: true,
        tools: ["scalebar", "draw", "highlight", "popup", "box"],
        options: {},
        mapOptions: {},
        toolsOptions: {
            measurement: {},
            locate: {},
            scalebar: {
                [MapLibraries.LEAFLET]: {
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
        securityToken: '',
        additionalLayers: [],
        elevationEnabled: false,
        onResolutionsChange: () => {},
        items: [],
        onLoadingMapPlugins: () => {},
        onMapTypeLoaded: () => {},
        pluginsCreator,
        coalesceWMSLayersMaxGroupSize: 10
    };

    state = {};
    componentDidMount() {
        let isMapResource = this.props?.mapId;
        if (isMapResource) {
            this.oldDocumentTitle = document.title;
        }
    }
    componentDidUpdate() {
        let isMapResource = this.props?.mapId;
        if (this.props.mapTitle && isMapResource) {
            document.title = this.props.mapTitle;
        }
    }
    UNSAFE_componentWillMount() {
        // moved the font load of FontAwesome only to styleParseUtils (#9653)
        this.updatePlugins(this.props);
        this._isMounted = true;
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.mapType !== this.props.mapType || newProps.actions !== this.props.actions) {
            this.updatePlugins(newProps);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        let isMapResource = this.props?.mapId;
        if (isMapResource) {
            document.title = this.oldDocumentTitle;
        }
    }

    getHighlightLayer = (projection, index, env) => {
        const plugins = this.state.plugins;
        const {features, ...options} = getHighlightLayerOptions({features: this.props.features});
        return (<plugins.Layer type="vector"
            srs={projection}
            position={index}
            key="highlight"
            env={env}
            options={{
                name: "highlight",
                ...options,
                features
            }} >
            {features.map( (feature) => {
                return (<plugins.Feature
                    msId={feature.id}
                    properties={feature.properties}
                    key={feature.id}
                    crs={projection}
                    type={feature.type}
                    style={feature.style || null }
                    geometry={feature.geometry}/>);
            })}
        </plugins.Layer>);
    };

    getTool = (tool) => {
        if (isString(tool)) {
            return {
                name: tool,
                impl: this.state.plugins.tools[tool]
            };
        }
        return tool[this.props.mapType] || tool;
    };

    getConfigMapOptions = () => {
        return this.props.mapOptions && this.props.mapOptions[this.props.mapType] ||
            ConfigUtils.getConfigProp("defaultMapOptions") && ConfigUtils.getConfigProp("defaultMapOptions")[this.props.mapType] || {};
    };

    renderLayers = () => {
        const projection = this.props.map.projection || 'EPSG:3857';
        const env = [];

        if (this.props.isLocalizedLayerStylesEnabled) {
            env.push({
                name: this.props.localizedLayerStylesName,
                value: this.props.currentLocaleLanguage
            });
        }
        const plugins = this.state.plugins;
        const layers = [
            ...this.props.layers,
            ...this.props.additionalLayers.map(({ id, ...layer }, idx) => ({ ...layer, id: id ? id : `additional-layers-${idx}` }))
        ].filter(this.filterLayer);

        return this.getLayerUnits(layers).map((unit, index) => {
            return (
                <plugins.Layer
                    type={unit.options.type}
                    srs={projection}
                    position={index}
                    key={unit.key}
                    options={unit.options}
                    securityToken={this.props.securityToken}
                    env={env}
                >
                    {this.renderLayerContent(unit.options, projection)}
                </plugins.Layer>
            );
        }).concat(this.props.features && this.props.features.length && this.getHighlightLayer(projection, this.props.layers.length, env) || []);
    };

    getLayerUnits = (layers) => {
        if (!this.isCoalesceEnabled()) {
            return layers.map((layer) => ({ key: layer.id || layer.name, options: layer }));
        }
        const deps = [this.props.layers, this.props.additionalLayers, this.props.elevationEnabled, this.props.mapType, this.props.coalesceWMSLayersMaxGroupSize, this.props.coalesceExcludeIds];
        if (!this._coalesceDeps || deps.some((dep, idx) => dep !== this._coalesceDeps[idx])) {
            this._coalesceDeps = deps;
            this._coalesceUnits = groupWMSLayers(layers, {
                maxGroupSize: this.props.coalesceWMSLayersMaxGroupSize,
                excludeIds: this.props.coalesceExcludeIds
            });
        }
        return this._coalesceUnits;
    };
    /**
     * Logic for coalescing priority is: map settings > plugin cfg > config miscSettings.
     * A single layer can always opt out with `coalesce: false` in its own options.
     * @returns true if coalescing is enabled, false otherwise
     */
    isCoalesceEnabled = () => {
        if (this.props.mapType === MapLibraries.LEAFLET) {
            return false;
        }
        return this.props.map?.mapOptions?.coalesceWMSLayers
            ?? this.props.coalesceWMSLayers
            ?? ConfigUtils.getConfigProp('miscSettings')?.coalesceWMSLayers
            ?? false;
    };

    renderLayerContent = (layer, projection) => {
        const plugins = this.state.plugins;
        if (layer.features) {
            const vectorFeatureFilter = createVectorFeatureFilter(layer);
            return layer.features.filter(vectorFeatureFilter).map((feature) => {
                return (
                    <plugins.Feature
                        key={feature.id}
                        msId={feature.id}
                        type={feature.type}
                        crs={projection}
                        geometry={feature.geometry}
                        features={feature.features}
                        featuresCrs={ layer.featuresCrs || 'EPSG:4326' }
                        layerStyle={layer.style}
                        style={ feature.style || layer.style || null }
                        properties={feature.properties}/>
                );
            });
        }
        return null;
    };

    renderSupportTools = () => {
        // Tools passed by other plugins
        const toolsFromItems = this.props.items
            .filter(({Tool}) => !!Tool)
            .map(({Tool, name, cfg}) => <Tool {...cfg} key={name} mapType={this.props.mapType} />);

        return this.props.tools.map((tool) => {
            const Tool = this.getTool(tool);
            const options = this.props.toolsOptions[Tool.name] && this.props.toolsOptions[Tool.name][this.props.mapType] || this.props.toolsOptions[Tool.name] || {};
            return <Tool.impl key={Tool.name} {...options}/>;
        }).concat(toolsFromItems);
    };

    render() {
        if (this.isValidMapConfiguration(this.props.map) && this.state.plugins) {
            const {mapOptions = {}} = this.props.map;

            return (
                <this.state.plugins.Map id={MAIN_MAP_CONTAINER_ID}
                    {...this.props.options}
                    projectionDefs={this.props.projectionDefs}
                    {...this.props.map}
                    mapOptions={{...this.getConfigMapOptions(), ...mapOptions}}
                    zoomControl={this.props.zoomControl}
                    onResolutionsChange={this.props.onResolutionsChange}
                    errorPanel={ErrorPanel}
                >
                    {this.renderLayers()}
                    {this.renderSupportTools()}
                </this.state.plugins.Map>
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
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1rem"
        }} className="mapLoadingMessage">
            {this.props.loadingSpinner ? <Spinner /> : null}
            <Message msgId={this.props.mapLoadingMessage}/>
        </div>);
    }
    filterLayer = (layer) => {
        if (layer.useForElevation) {
            return this.props.mapType === 'cesium' || this.props.elevationEnabled;
        }
        return layer.type !== 'elevation' || this.props.elevationEnabled;
    };
    updatePlugins = (props) => {
        this.currentMapType = props.mapType;
        props.onLoadingMapPlugins(true);
        // reset the map plugins to avoid previous map library in children
        this.setState({plugins: undefined });
        this.props.pluginsCreator(props.mapType, props.actions).then((plugins) => {
            // #6652 fix mismatch on multiple concurrent plugins loading
            // to make the last mapType match the list of plugins
            if (this._isMounted && plugins.mapType === this.currentMapType) {
                this.setState({plugins});
                props.onLoadingMapPlugins(false, props.mapType);
                props.onMapTypeLoaded(true, props.mapType);
            }
        });
    };
    isValidMapConfiguration = (map) => {
        // when the center is included inside the map config
        // we know that the configuration has been loaded
        // we should prevent to mount the map component
        // in case we have a configuration like this one: { eventListeners: {}, mousePointer: '' }
        // if we allow invalid configuration default props will be used instead
        // initializing the map in the wrong position
        return !!map?.center;
    }
}

export default createPlugin('Map', {
    component: connect(selector, {
        onResolutionsChange: setMapResolutions,
        onMapTypeLoaded: mapPluginLoad
    })(withScalesDenominators(MapPlugin)),
    reducers: {
        map: mapReducer,
        layers: layersReducer,
        draw: drawReducer,
        box: boxReducer,
        highlight: highlightReducer,
        maptype: mapTypeReducer,
        additionallayers: additionalLayersReducer
    },
    epics: {
        ...mapEpics,
        ...backgroundSelector,
        ...catalog(API)
    },
    containers: {
        Settings: () => ({
            tool: <MapSettings />,
            position: 2
        })
    }
});
