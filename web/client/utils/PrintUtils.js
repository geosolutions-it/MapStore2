/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CoordinatesUtils = require('./CoordinatesUtils');
const MapUtils = require('./MapUtils');

const {isArray} = require('lodash');

const url = require('url');

const defaultScales = MapUtils.getGoogleMercatorScales(0, 21);

const assign = require('object-assign');

const PrintUtils = {
    normalizeUrl: (input) => {
        let result = isArray(input) ? input[0] : input;
        if (result.indexOf('?') !== -1) {
            result = result.substring(0, result.indexOf('?'));
        }
        return result;
    },
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
    getPrintScales: (capabilities) => {
        return capabilities.scales.slice(0).reverse().map((scale) => parseFloat(scale.value)) || [];
    },
    getNearestZoom: (zoom, scales, mapScales = defaultScales) => {
        const mapScale = mapScales[zoom];
        return scales.reduce((previous, current, index) => {
            return current < mapScale ? previous : index;
        }, 0);
    },
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
                "format": layer.format || "image/jpeg",
                "styles": [
                   layer.style || ''
                ],
                "customParams": assign({
                   "TRANSPARENT": true,
                   "TILED": true,
                   "EXCEPTIONS": "application/vnd.ogc.se_inimage",
                   "scaleMethod": "accurate"
               }, layer.baseParams || {})
            }),
            legend: (layer, spec) => ({
                "name": layer.title || layer.name,
                "classes": [
                   {
                      "name": "",
                      "icons": [
                         (isArray(layer.url) ? layer.url[0] : layer.url) + url.format({
                             query: {
                                 TRANSPARENT: true,
                                 EXCEPTIONS: "application/vnd.ogc.se_xml",
                                 VERSION: "1.1.1",
                                 SERVICE: "WMS",
                                 REQUEST: "GetLegendGraphic",
                                 LAYER: layer.name,
                                 STYLE: layer.style || '',
                                 height: spec.iconSize,
                                 width: spec.iconSize,
                                 minSymbolSize: spec.iconSize,
                                 fontFamily: spec.fontFamily,
                                 LEGEND_OPTIONS: "forceLabels:" + (spec.forceLabels ? "on" : "") + ";fontAntialiasing:" + spec.antiAliasing + ";dpi:" + spec.legendDpi + ";fontStyle:" + (spec.bold && "bold" || (spec.italic && "italic") || ''),
                                 format: "image/png"
                             }
                         })
                      ]
                   }
                ]
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
    }
};

module.exports = PrintUtils;
