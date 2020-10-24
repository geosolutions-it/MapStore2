/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState, useEffect} from "react";
import ConfigUtils from "../../utils/ConfigUtils";
import { loadFont } from "../../utils/AgentUtils";
import Message from "../I18N/Message";
import Spinner from "react-spinkit";
import isString from "lodash/isString";

function getHighlightLayer(components, features, projection, index, env) {
    const {Layer, Feature} = components;
    return (<Layer type="vector" srs={projection} position={index} key="highlight" options={{name: "highlight"}} env={env}>
        {features.map( (feature) => {
            return (<Feature
                msId={feature.id}
                key={feature.id}
                crs={projection}
                type={feature.type}
                style={feature.style || null }
                geometry={feature.geometry}/>);
        })}
    </Layer>);
}

function renderLayerContent(components, layer, projection) {
    const {Feature} = components;
    if (layer.features && layer.type === "vector") {
        return layer.features.map( (feature) => {
            return (
                <Feature
                    key={feature.id}
                    msId={feature.id}
                    type={feature.type}
                    crs={projection}
                    geometry={feature.geometry}
                    features={feature.features}
                    featuresCrs={ layer.featuresCrs || 'EPSG:4326' }
                    // FEATURE STYLE OVERWRITE LAYER STYLE
                    layerStyle={layer.style}
                    style={ feature.style || layer.style || null }
                    properties={feature.properties}/>
            );
        });
    }
    return null;
}

function renderLayers({
    projection,
    layers,
    features,
    components,
    securityToken,
    env,
    isLocalizedLayerStylesEnabled,
    localizedLayerStylesName,
    currentLocaleLanguage
}) {
    const globalEnv = isLocalizedLayerStylesEnabled ? [{
        name: localizedLayerStylesName,
        value: currentLocaleLanguage
    }] : [];
    const {Layer} = components;
    return layers.map((layer, index) => {
        return (
            <Layer
                type={layer.type}
                srs={projection}
                position={index}
                key={layer.id || layer.name}
                options={layer}
                securityToken={securityToken}
                env={layer.localizedLayerStyles ? env : globalEnv}
            >
                {renderLayerContent(layer, projection)}
            </Layer>
        );
    }).concat(features?.length && getHighlightLayer(components, features, projection, layers.length, env) || []);
}

function getTool(mapType, components, tool) {
    if (isString(tool)) {
        return {
            name: tool,
            impl: components.tools[tool]
        };
    }
    return tool[mapType] || tool;
}

function renderSupportTools({mapType, components, items, tools, toolsOptions}) {
    // Tools passed by other plugins
    const toolsFromItems = items
        .filter(({Tool}) => !!Tool)
        .map(({Tool, name}) => <Tool key={name} />);

    const toolsFromTools = tools.map((tool) => {
        const Tool = getTool(mapType, components, tool);
        const options = toolsOptions[Tool.name]?.[mapType] ?? toolsOptions[Tool.name];
        return <Tool.impl key={Tool.name} {...options}/>;
    });

    return [...toolsFromItems, ...toolsFromTools];
}

const Map = ({
    mapType = "leaflet",
    id = "map",
    components,
    map = {
        center: { x: 0, y: 0 },
        zoom: 1
    },
    layers = [],
    additionalLayers = [],
    features = [],
    mapOptions = {},
    options = {},
    projectionDefs,
    zoomControl = false,
    onResolutionsChange = () => {},
    loadingError = false,
    loadingSpinner = true,
    mapLoadingMessage = "map.loading",
    shouldLoadFont = false,
    fonts = ['FontAwesome'],
    onFontError = () => {},
    isLocalizedLayerStylesEnabled = false,
    localizedLayerStylesName,
    currentLocaleLanguage,
    securityToken = "",
    elevationEnabled = false,
    tools = ["measurement", "locate", "scalebar", "draw", "highlight", "popup"],
    toolsOptions = {
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
    items = [],
    initMapComponents = c => c,
    actions = {},
    styleMap = {},
    eventHandlers = {},
    hookRegister,
    mapStateSource,
    env = []
}) => {
    const [mapTypeComponents, setMapTypeComponents] = useState();
    const [fontsLoaded, setFontsLoaded] = useState(!shouldLoadFont);

    useEffect(() => {
        // Fonts are needed by vector layers rendering, and have to be loaded before the map
        // is created, to avoid missing symbols on map, so we load them and then
        // we enable rendering
        if (shouldLoadFont && fonts) {
            Promise.all(
                fonts.map(f =>
                    loadFont(f, {
                        timeoutAfter: 5000 // 5 seconds in milliseconds
                    }).catch(() => {
                        onFontError({family: f});
                    }
                    ))
            ).then(() => {
                setFontsLoaded(true);
            });
        }
    }, []);
    useEffect(() => {
        // we need to dynamically load map components for the selected mapType, and store
        // them for rendering
        if (components) {
            setMapTypeComponents(components);
        } else {
            import('./' + mapType + '/index').then((module) => {
                import('./' + mapType + '/plugins/index').then(() => {
                    setMapTypeComponents(initMapComponents(module.default, actions));
                });
            });
        }
    }, [mapType]);

    if (map && fontsLoaded && mapTypeComponents) {
        const byTypeMapOptions = mapOptions?.[mapType] ??
            ConfigUtils.getConfigProp("defaultMapOptions")?.[mapType];
        const {Map: MapCmp} = mapTypeComponents;
        // we filter out elevation layers if elevation support is not enabled
        // maybe we should move this at an higher level
        const filteredLayers = [...layers, ...additionalLayers].filter(
            l => !l.useForElevation || mapType === 'cesium' || elevationEnabled
        );
        const projection = map.projection || "EPSG:3857";
        return (
            <MapCmp
                id={id}
                style={styleMap}
                {...options}
                projectionDefs={projectionDefs}
                {...map}
                projection={projection}
                mapOptions={{...map.mapOptions, ...byTypeMapOptions}}
                zoomControl={zoomControl}
                {...eventHandlers}
                onResolutionsChange={onResolutionsChange}
                hookRegister={hookRegister}
                mapStateSource={mapStateSource || id}
            >
                {renderLayers({
                    projection,
                    layers: filteredLayers,
                    features,
                    components: mapTypeComponents,
                    securityToken,
                    env,
                    isLocalizedLayerStylesEnabled,
                    localizedLayerStylesName,
                    currentLocaleLanguage
                })}
                {renderSupportTools({
                    mapType,
                    components: mapTypeComponents,
                    items,
                    tools,
                    toolsOptions
                })}
            </MapCmp>
        );
    }
    if (loadingError) {
        return (<div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }} className="mapErrorMessage">
            <Message msgId="map.loadingerror"/>:
            {loadingError}
        </div>);
    }
    return (<div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }} className="mapLoadingMessage">
        {loadingSpinner ?
            <Spinner spinnerName="circle" overrideSpinnerClassName="spinner"/> :
            null}
        <Message msgId={mapLoadingMessage}/>
    </div>);
};

export default Map;
