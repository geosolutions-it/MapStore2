/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CoordinatesUtils = require('./CoordinatesUtils');
const SecurityUtils = require('./SecurityUtils');
const MapUtils = require('./MapUtils');
const {optionsToVendorParams} = require('./VendorParamsUtils');
const AnnotationsUtils = require("./AnnotationsUtils");
const {colorToHexStr} = require("./ColorUtils");
const {getLayerConfig} = require('./TileConfigProvider').default;
const { extractValidBaseURL } = require('./TileProviderUtils');
const WMTSUtils = require('./WMTSUtils');
const {guessFormat} = require('./TMSUtils');

const { get: getProjection } = require("ol/proj");
const { isArray, filter, find, isEmpty, toNumber, castArray} = require('lodash');
const { getFeature } = require('../api/WFS');
const {generateEnvString} = require('./LayerLocalizationUtils');

const url = require('url');

const defaultScales = MapUtils.getGoogleMercatorScales(0, 21);

const assign = require('object-assign');

// Try to guess geomType, getting the first type available.
const getGeomType = function(layer) {
    return layer.features && layer.features[0] && layer.features[0].geometry ? layer.features[0].geometry.type :
        layer.features && layer.features[0].features && layer.features[0].style && layer.features[0].style.type ? layer.features[0].style.type : undefined;
};

const isAnnotationLayer = (layer) => {
    return layer.id === "annotations" || layer.name === "Measurements";
};

/**
 * Extracts the correct opacity from layer. if Undefined, the opacity is `1`.
 * @ignore
 * @param {object} layer the MapStore layer
 */
const getOpacity = layer => layer.opacity || (layer.opacity === 0 ? 0 : 1.0);

/**
 * Utilities for Print
 * @memberof utils
 */
const PrintUtils = {
    /**
     * Preload data (e.g. WFS) before to sent it to the print tool.
     *
     */
    preloadData: (spec) => {
        // check if remote data
        const wfsLayers = filter(spec.layers, {type: "wfs"});
        if (wfsLayers.length > 0) {
            // get data from WFS
            return Promise.all(
                wfsLayers.map(l =>
                    getFeature(l.url, l.name, {
                        outputFormat: "application/json",
                        srsName: spec.projection,
                        ...(optionsToVendorParams(l) || {})
                    })
                        .then(({data}) => ({
                            id: l.id,
                            geoJson: data
                        }))
                )
            // set geoJson in layer's spec
            ).then(replies => {
                return {
                    ...spec,
                    layers: (spec.layers || []).map(l => {
                        const layerData = find(replies, {id: l.id});
                        if (l.type === "wfs" && layerData) {
                            return {
                                ...l,
                                ...layerData

                            };
                        }
                        return l;
                    })
                };
            });
        }
        return new Promise((resolve) => {
            resolve(spec);
        });
    },
    /**
     * Given a static resource, returns the resource's absolute
     * URL. Supports file paths with or without origin/protocol.
     * @param {string} uri the uri to transform
     * @param {string} [origin=window.location.origin] the origin to use
     */
    toAbsoluteURL: (uri, origin) => {
        // Handle absolute URLs (with protocol-relative prefix)
        // Example: //domain.com/file.png
        if (uri.search(/^\/\//) !== -1) {
            return window.location.protocol + uri;
        }

        // Handle absolute URLs (with explicit origin)
        // Example: http://domain.com/file.png
        if (uri.search(/:\/\//) !== -1) {
            return uri;
        }

        // Handle absolute URLs (without explicit origin)
        // Example: /file.png
        if (uri.search(/^\//) !== -1) {
            return (origin || window.location.origin) + uri;
        }
        return uri;
    },
    /**
     * Tranform the original URL configuration of the layer into a URL
     * usable for the print service.
     * @param  {string|array} input Original URL
     * @return {string}       the URL modified as GeoServer requires
     */
    normalizeUrl: (input) => {
        let result = isArray(input) ? input[0] : input;
        if (result.indexOf('?') !== -1) {
            result = result.substring(0, result.indexOf('?'));
        }
        return PrintUtils.toAbsoluteURL(result);
    },
    /**
     * Find the layout name for the given options.
     * The convention is: `PAGE_FORMAT + ("_2_pages_legend"|"_2_pages_legend"|"") + ("_landscape"|"")``
     * @param  {object} spec the spec with the options
     * @return {string}      the layout name.
     */
    getLayoutName: (spec) => {
        let layoutName = [spec.sheet];
        if (spec.includeLegend) {
            if (spec.twoPages) {
                layoutName.push('2_pages_legend');
            }
        } else {
            layoutName.push('no_legend');
        }
        if (spec.landscape) {
            layoutName.push('landscape');
        }
        return layoutName.join('_');
    },
    /**
     * Gets the print scales allowed from the capabilities of the print service.
     * @param  {capabilities} capabilities the capabilities of the print service
     * @return {array}              the scales array
     */
    getPrintScales: (capabilities) => {
        return capabilities.scales.slice(0).reverse().map((scale) => parseFloat(scale.value)) || [];
    },
    /**
     * Guess the nearest zoom level in the allowed scales
     * @param  {number} zoom                      the zoom level
     * @param  {array} scales                    the allowed scales
     * @param  {array} [mapScales=defaultScales] the map scales
     * @return {number}                          the index that best approximates the current map scale
     */
    getNearestZoom: (zoom, scales, mapScales = defaultScales) => {
        const mapScale = mapScales[Math.round(zoom)];
        return scales.reduce((previous, current, index) => {
            return current < mapScale ? previous : index;
        }, 0);
    },
    /**
     * Guess the map zoom level from print scale
     * @param  {number} zoom                      the zoom level
     * @param  {array} scales                    the allowed scales
     * @param  {array} [mapScales=defaultScales] the map scales
     * @return {number}                          the index that best approximates the current map scale
     */
    getMapZoom: (scaleZoom, scales, mapScales = defaultScales) => {
        const scale = scales[Math.round(scaleZoom)];
        return mapScales.reduce((previous, current, index) => {
            return current < scale ? previous : index;
        }, 0) + 1;
    },
    /**
     * Get the mapSize for print preview, parsing the layout and limiting the width.
     * @param  {object} layout   the layout object
     * @param  {number} maxWidth the max width for the mapSize
     * @return {object}          width and height of a map limited by the maxWidth and with the same ratio of the layout
     */
    getMapSize: (layout, maxWidth) => {
        if (layout) {
            const width = layout.rotation ? layout.map.height : layout.map.width;
            const height = layout.rotation ? layout.map.width : layout.map.height;
            return {
                width: maxWidth,
                height: height / width * maxWidth
            };
        }
        return {
            width: 100,
            height: 100
        };
    },
    /**
     * Creates the mapfish print specification from the current configuration
     * @param  {object} spec the current configuration
     * @return {object}      the mapfish print configuration to send to the server
     */
    getMapfishPrintSpecification: (spec) => {
        const projectedCenter = CoordinatesUtils.reproject(spec.center, 'EPSG:4326', spec.projection);
        return {
            "units": CoordinatesUtils.getUnits(spec.projection),
            "srs": CoordinatesUtils.normalizeSRS(spec.projection || 'EPSG:3857'),
            "layout": PrintUtils.getLayoutName(spec),
            "dpi": parseInt(spec.resolution, 10),
            "outputFilename": "mapstore-print",
            "geodetic": false,
            "mapTitle": spec.name || '',
            "comment": spec.description || '',
            "layers": PrintUtils.getMapfishLayersSpecification(spec.layers, spec, 'map'),
            "pages": [
                {
                    "center": [
                        projectedCenter.x,
                        projectedCenter.y
                    ],
                    "scale": spec.scale || defaultScales[Math.round(spec.scaleZoom)],
                    "rotation": 0
                }
            ],
            "legends": PrintUtils.getMapfishLayersSpecification(spec.layers, spec, 'legend')
        };
    },
    /**
     * Generate the layers (or legend) specification for print.
     * @param  {array} layers  the layers configurations
     * @param  {spec} spec    the print configurations
     * @param  {string} purpose allowed values: `map|legend`. Tells which spec to generate.
     * @return {array}         the configuration array for layers (or legend) to send to the print service.
     */
    getMapfishLayersSpecification: (layers, spec, purpose) => {
        return layers.filter((layer) => PrintUtils.specCreators[layer.type] && PrintUtils.specCreators[layer.type][purpose])
            .map((layer) => PrintUtils.specCreators[layer.type][purpose](layer, spec));
    },
    specCreators: {
        wms: {
            map: (layer, spec) => ({
                "baseURL": PrintUtils.normalizeUrl(layer.url) + '?',
                "opacity": getOpacity(layer),
                "singleTile": false,
                "type": "WMS",
                "layers": [
                    layer.name
                ],
                "format": layer.format || "image/png",
                "styles": [
                    layer.style || ''
                ],
                "customParams": SecurityUtils.addAuthenticationParameter(PrintUtils.normalizeUrl(layer.url), assign({
                    "TRANSPARENT": true,
                    "TILED": true,
                    "EXCEPTIONS": "application/vnd.ogc.se_inimage",
                    "scaleMethod": "accurate",
                    "ENV": generateEnvString(spec.env)
                }, layer.baseParams || {}, layer.params || {}, {
                    ...optionsToVendorParams({
                        layerFilter: layer.layerFilter,
                        filterObj: layer.filterObj
                    })
                }
                ))}),
            legend: (layer, spec) => ({
                "name": layer.title || layer.name,
                "classes": [
                    {
                        "name": "",
                        "icons": [
                            PrintUtils.normalizeUrl(layer.url) + url.format({
                                query: SecurityUtils.addAuthenticationParameter(PrintUtils.normalizeUrl(layer.url), {
                                    TRANSPARENT: true,
                                    EXCEPTIONS: "application/vnd.ogc.se_xml",
                                    VERSION: "1.1.1",
                                    SERVICE: "WMS",
                                    REQUEST: "GetLegendGraphic",
                                    LAYER: layer.name,
                                    LANGUAGE: spec.language || '',
                                    STYLE: layer.style || '',
                                    SCALE: spec.scale,
                                    height: spec.iconSize,
                                    width: spec.iconSize,
                                    minSymbolSize: spec.iconSize,
                                    LEGEND_OPTIONS: "forceLabels:" + (spec.forceLabels ? "on" : "") + ";fontAntialiasing:" + spec.antiAliasing + ";dpi:" + spec.legendDpi + ";fontStyle:" + (spec.bold && "bold" || (spec.italic && "italic") || '') + ";fontName:" + spec.fontFamily + ";fontSize:" + spec.fontSize,
                                    format: "image/png",
                                    ...assign({}, layer.params)
                                })
                            })
                        ]
                    }
                ]
            })
        },
        vector: {
            map: (layer, spec) => ({
                type: 'Vector',
                name: layer.name,
                "opacity": getOpacity(layer),
                styleProperty: "ms_style",
                styles: {
                    1: PrintUtils.toOpenLayers2Style(layer, layer.style),
                    "Polygon": PrintUtils.toOpenLayers2Style(layer, layer.style, "Polygon"),
                    "LineString": PrintUtils.toOpenLayers2Style(layer, layer.style, "LineString"),
                    "Point": PrintUtils.toOpenLayers2Style(layer, layer.style, "Point"),
                    "FeatureCollection": PrintUtils.toOpenLayers2Style(layer, layer.style, "FeatureCollection")
                },
                geoJson: CoordinatesUtils.reprojectGeoJson({
                    type: "FeatureCollection",
                    features: isAnnotationLayer(layer) && AnnotationsUtils.annotationsToPrint(layer.features) ||
                                    layer.features.map( f => ({...f, properties: {...f.properties, ms_style: f && f.geometry && f.geometry.type && f.geometry.type.replace("Multi", "") || 1}}))
                },
                "EPSG:4326",
                spec.projection)
            }
            )
        },
        wfs: {
            map: (layer) => ({
                type: 'Vector',
                name: layer.name,
                "opacity": getOpacity(layer),
                styleProperty: "ms_style",
                styles: {
                    1: PrintUtils.toOpenLayers2Style(layer, layer.style),
                    "Polygon": PrintUtils.toOpenLayers2Style(layer, layer.style, "Polygon"),
                    "LineString": PrintUtils.toOpenLayers2Style(layer, layer.style, "LineString"),
                    "Point": PrintUtils.toOpenLayers2Style(layer, layer.style, "Point"),
                    "FeatureCollection": PrintUtils.toOpenLayers2Style(layer, layer.style, "FeatureCollection")
                },
                // NOTE: data in this case have to be pre-loaded, in the correct projection
                geoJson: layer.geoJson && {
                    type: "FeatureCollection",
                    features: layer.geoJson.features.map(f => ({ ...f, properties: { ...f.properties, ms_style: f && f.geometry && f.geometry.type && f.geometry.type.replace("Multi", "") || 1 } }))
                }
            }
            )
        },
        osm: {
            map: (layer = {}) => ({
                "baseURL": "http://a.tile.openstreetmap.org/",
                "opacity": getOpacity(layer),
                "singleTile": false,
                "type": "OSM",
                "maxExtent": [
                    -20037508.3392,
                    -20037508.3392,
                    20037508.3392,
                    20037508.3392
                ],
                "tileSize": [
                    256,
                    256
                ],
                "extension": "png",
                "resolutions": [
                    156543.03390625,
                    78271.516953125,
                    39135.7584765625,
                    19567.87923828125,
                    9783.939619140625,
                    4891.9698095703125,
                    2445.9849047851562,
                    1222.9924523925781,
                    611.4962261962891,
                    305.74811309814453,
                    152.87405654907226,
                    76.43702827453613,
                    38.218514137268066,
                    19.109257068634033,
                    9.554628534317017,
                    4.777314267158508,
                    2.388657133579254,
                    1.194328566789627,
                    0.5971642833948135
                ]
            })
        },
        mapquest: {
            map: (layer = {}) => ({
                "baseURL": "http://otile1.mqcdn.com/tiles/1.0.0/map/",
                "opacity": getOpacity(layer),
                "singleTile": false,
                "type": "OSM",
                "maxExtent": [
                    -20037508.3392,
                    -20037508.3392,
                    20037508.3392,
                    20037508.3392
                ],
                "tileSize": [
                    256,
                    256
                ],
                "extension": "png",
                "resolutions": [
                    156543.03390625,
                    78271.516953125,
                    39135.7584765625,
                    19567.87923828125,
                    9783.939619140625,
                    4891.9698095703125,
                    2445.9849047851562,
                    1222.9924523925781,
                    611.4962261962891,
                    305.74811309814453,
                    152.87405654907226,
                    76.43702827453613,
                    38.218514137268066,
                    19.109257068634033,
                    9.554628534317017,
                    4.777314267158508,
                    2.388657133579254,
                    1.194328566789627,
                    0.5971642833948135
                ]
            })
        },
        wmts: {
            map: (layer, spec) => {
                const SRS =  spec.projection;
                const { tileMatrixSet, tileMatrixSetName} = WMTSUtils.getTileMatrix(layer, SRS); // TODO: use spec SRS.
                // const matrixIds = WMTSUtils.getMatrixIds(layer.matrixIds, tileMatrixSet || SRS);
                if (!tileMatrixSet) {
                    throw Error("tile matrix not found for pdf EPSG" + SRS);
                }
                const matrixIds = PrintUtils.getWMTSMatrixIds(layer, tileMatrixSet);
                const baseURL = PrintUtils.normalizeUrl(castArray(layer.url)[0]);
                let dimensionParams = {};
                if (baseURL.indexOf('{Style}') >= 0) {
                    dimensionParams = {
                        "dimensions": ["Style"],
                        "params": {
                            "STYLE": layer.style
                        }
                    };
                }
                return {
                    "baseURL": encodeURI(baseURL),
                    // "dimensions": isEmpty(layer.dimensions) && layer.dimensions || null,


                    "format": layer.format || "image/png",
                    "type": "WMTS",
                    "layer": layer.name,
                    "customParams ": SecurityUtils.addAuthenticationParameter(layer.capabilitiesURL, assign({
                        "TRANSPARENT": true
                    })),
                    // rest parameter style is not included
                    // so simulate with dimensions and params
                    ...dimensionParams,
                    "matrixIds": matrixIds,
                    "matrixSet": tileMatrixSetName,
                    "style": layer.style,
                    "name": layer.name,
                    "requestEncoding": layer.requestEncoding === "RESTful" ? "REST" : layer.requestEncoding,
                    "opacity": getOpacity(layer),
                    "version": layer.version || "1.0.0"
                };
            }
        },
        tileprovider: {
            map: (layer) => {

                const [providerURL, layerConfig] = getLayerConfig(layer.provider, layer);
                if (!isEmpty(layerConfig)) {
                    let validURL = extractValidBaseURL({ ...layerConfig, url: layerConfig?.url ?? providerURL });
                    if (!validURL) {
                        throw Error("No base URL found for this layer");
                    }
                    // transform in xyz format for mapfish-print.
                    const firstBracketIndex = validURL.indexOf('{');
                    const baseURL = validURL.slice(0, firstBracketIndex);
                    const pathSection = validURL.slice(firstBracketIndex);
                    const pathFormat = pathSection
                        .replace("{x}", "${x}")
                        .replace("{y}", "${y}")
                        .replace("{z}", "${z}");
                    return {
                        baseURL,
                        path_format: pathFormat,
                        "type": 'xyz',
                        "extension": validURL.split('.').pop() || "png",
                        "opacity": getOpacity(layer),
                        "tileSize": [256, 256],
                        "maxExtent": [-20037508.3392, -20037508.3392, 20037508.3392, 20037508.3392],
                        "resolutions": MapUtils.getResolutions()
                    };
                }
                return {};
            }
        },
        tms: {
            map: (layer) => {
                // layer.tileMapService is like tileMapUrl, but with the layer name in the tail.
                // e.g. "https://server.org/gwc/service/tms/1.0.0" - "https://server.org/gwc/service/tms/1.0.0/workspace%3Alayer@EPSG%3A3857@png"
                const layerName = layer.tileMapUrl.split(layer.tileMapService + "/")[1];
                return {
                    type: 'tms',
                    opacity: getOpacity(layer),
                    layer: layerName,
                    // baseURL for mapfish print required to remove the version
                    baseURL: layer.tileMapService.substring(0, layer.tileMapService.lastIndexOf("/1.0.0")),
                    tileSize: layer.tileSize,
                    format: guessFormat(layer.tileMapUrl),
                    "maxExtent": [
                        -20037508.3392,
                        -20037508.3392,
                        20037508.3392,
                        20037508.3392
                    ],
                    resolutions: layer.tileSets.map(({resolution}) => resolution)
                    // letters: ... to implement

                };
            }
        }
    },

    getWMTSMatrixIds: (layer, tileMatrixSet) => {
        let modifiedTileMatrixSet = [];
        const srs = CoordinatesUtils.normalizeSRS(layer.srs || 'EPSG:3857', layer.allowedSRS);
        const projection = getProjection(srs);
        const identifierText = "ows:Identifier";
        const metersPerUnit = projection.getMetersPerUnit();
        const scaleToResolution = s => s * 0.28E-3 / metersPerUnit;

        tileMatrixSet && tileMatrixSet.TileMatrix.map(tileMatrix => {
            const identifier = tileMatrix[identifierText];
            const resolution = scaleToResolution(tileMatrix.ScaleDenominator);
            const tileSize = [toNumber(tileMatrix.TileWidth), toNumber(tileMatrix.TileHeight)];
            const topLeftCorner = tileMatrix.TopLeftCorner && tileMatrix.TopLeftCorner.split(" ").map(v => toNumber(v));
            const matrixSize = [toNumber(tileMatrix.MatrixWidth), toNumber(tileMatrix.MatrixHeight)];

            return modifiedTileMatrixSet.push({ identifier, matrixSize, resolution, tileSize, topLeftCorner});
        });
        return modifiedTileMatrixSet;
    },
    rgbaTorgb: (rgba = "") => {
        return rgba.indexOf("rgba") !== -1 ? `rgb${rgba.slice(rgba.indexOf("("), rgba.lastIndexOf(","))})` : rgba;
    },

    /**
     * Useful for print (Or generic Openlayers 2 conversion style)
     * http://dev.openlayers.org/docs/files/OpenLayers/Feature/Vector-js.html#OpenLayers.Feature.Vector.OpenLayers.Feature.Vector.style
     */
    toOpenLayers2Style: function(layer, style, styleType) {
        if (!style || layer.styleName === "marker") {
            return PrintUtils.getOlDefaultStyle(layer, styleType);
        }
        // commented the available options.
        return {
            "fillColor": colorToHexStr(style.fillColor),
            "fillOpacity": style.fillOpacity,
            // "rotation": "30",
            "externalGraphic": style.iconUrl,
            // "graphicName": "circle",
            // "graphicOpacity": 0.4,
            "pointRadius": style.radius,
            "strokeColor": colorToHexStr(style.color),
            "strokeOpacity": style.opacity,
            "strokeWidth": style.weight
            // "strokeLinecap": "round",
            // "strokeDashstyle": "dot",
            // "fontColor": "#000000",
            // "fontFamily": "sans-serif",
            // "fontSize": "12px",
            // "fontStyle": "normal",
            // "fontWeight": "bold",
            // "haloColor": "#123456",
            // "haloOpacity": "0.7",
            // "haloRadius": "3.0",
            // "label": "${name}",
            // "labelAlign": "cm",
            // "labelRotation": "45",
            // "labelXOffset": "-25.0",
            // "labelYOffset": "-35.0"
        };
    },
    /**
     * Provides the default style for
     * each vector type.
     */
    getOlDefaultStyle(layer, styleType) {
        switch (styleType || getGeomType(layer) || "") {
        case 'Polygon':
        case 'MultiPolygon': {
            return {
                "fillColor": "#0000FF",
                "fillOpacity": 0.1,
                "strokeColor": "#0000FF",
                "strokeOpacity": 1,
                "strokeWidth": 3,
                "strokeDashstyle": "dash",
                "strokeLinecap": "round"
            };
        }
        case 'MultiLineString':
        case 'LineString':
            return {
                "strokeColor": "#0000FF",
                "strokeOpacity": 1,
                "strokeWidth": 3
            };
        case 'Point':
        case 'MultiPoint': {
            return layer.styleName === "marker" ? {
                "externalGraphic": "http://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/images/marker-icon.png",
                "graphicWidth": 25,
                "graphicHeight": 41,
                "graphicXOffset": -12, // different offset
                "graphicYOffset": -41
            } : {
                "fillColor": "#FF0000",
                "fillOpacity": 0,
                "strokeColor": "#FF0000",
                "pointRadius": 5,
                "strokeOpacity": 1,
                "strokeWidth": 1
            };
        }
        default: {
            return {
                "fillColor": "#0000FF",
                "fillOpacity": 0.1,
                "strokeColor": "#0000FF",
                "pointRadius": 5,
                "strokeOpacity": 1,
                "strokeWidth": 1
            };
        }
        }
    }
};

module.exports = PrintUtils;
