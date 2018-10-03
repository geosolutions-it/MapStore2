/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CoordinatesUtils = require('./CoordinatesUtils');
const MapUtils = require('./MapUtils');
const {colorToHexStr} = require("./ColorUtils");

const {isArray} = require('lodash');

const url = require('url');

const defaultScales = MapUtils.getGoogleMercatorScales(0, 21);

const assign = require('object-assign');

const getGeomType = function(layer) {
    return layer.features && layer.features[0] ? layer.features[0].geometry.type : undefined;
};
/**
 * Utilities for Print
 * @memberof utils
 */
const PrintUtils = {
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
        const mapScale = mapScales[zoom];
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
        const scale = scales[scaleZoom];
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
                    "scale": spec.scale || defaultScales[spec.scaleZoom],
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
            map: (layer) => ({
                "baseURL": PrintUtils.normalizeUrl(layer.url) + '?',
                "opacity": layer.opacity || 1.0,
                "singleTile": false,
                "type": "WMS",
                "layers": [
                    layer.name
                ],
                "format": layer.format || "image/png",
                "styles": [
                    layer.style || ''
                ],
                "customParams": assign({
                    "TRANSPARENT": true,
                    "TILED": true,
                    "EXCEPTIONS": "application/vnd.ogc.se_inimage",
                    "scaleMethod": "accurate"
                }, layer.baseParams || {}, layer.params || {})
            }),
            legend: (layer, spec) => ({
                "name": layer.title || layer.name,
                "classes": [
                   {
                      "name": "",
                      "icons": [
                         PrintUtils.normalizeUrl(layer.url) + url.format({
                             query: {
                                 TRANSPARENT: true,
                                 EXCEPTIONS: "application/vnd.ogc.se_xml",
                                 VERSION: "1.1.1",
                                 SERVICE: "WMS",
                                 REQUEST: "GetLegendGraphic",
                                 LAYER: layer.name,
                                 STYLE: layer.style || '',
                                 SCALE: spec.scale,
                                 height: spec.iconSize,
                                 width: spec.iconSize,
                                 minSymbolSize: spec.iconSize,
                                 LEGEND_OPTIONS: "forceLabels:" + (spec.forceLabels ? "on" : "") + ";fontAntialiasing:" + spec.antiAliasing + ";dpi:" + spec.legendDpi + ";fontStyle:" + (spec.bold && "bold" || (spec.italic && "italic") || '') + ";fontName:" + spec.fontFamily + ";fontSize:" + spec.fontSize,
                                 format: "image/png",
                                 ...assign({}, layer.params)
                             }
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
                "opacity": layer.opacity || 1.0,
                styleProperty: "ms_style",
                styles: {
                    1: PrintUtils.toOpenLayers2Style(layer, layer.style)
                },
                geoJson: CoordinatesUtils.reprojectGeoJson({
                    type: "FeatureCollection",
                    features: layer.features.map( f => ({...f, properties: {...f.properties, ms_style: 1}}))
                },
                "EPSG:4326",
                spec.projection)
            })
        },
        osm: {
            map: () => ({
                "baseURL": "http://a.tile.openstreetmap.org/",
                "opacity": 1,
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
            map: () => ({
                "baseURL": "http://otile1.mqcdn.com/tiles/1.0.0/map/",
                "opacity": 1,
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
        }
    },
    rgbaTorgb: (rgba = "") => {
        return rgba.indexOf("rgba") !== -1 ? `rgb${rgba.slice(rgba.indexOf("("), rgba.lastIndexOf(","))})` : rgba;
    },
    /**
     * Useful for print (Or generic Openlayers 2 conversion style)
     * http://dev.openlayers.org/docs/files/OpenLayers/Feature/Vector-js.html#OpenLayers.Feature.Vector.OpenLayers.Feature.Vector.style
     */
    toOpenLayers2Style: function(layer, style) {
        if (!style) {
            return PrintUtils.getOlDefaultStyle(layer);
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
    getOlDefaultStyle(layer) {
        switch (getGeomType(layer)) {
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
