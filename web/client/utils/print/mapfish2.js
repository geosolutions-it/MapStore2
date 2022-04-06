import { getSheetName, getLayoutName, getMapfishLayersSpecification, normalizeUrl, getOpacity, toOpenLayers2Style,
    isAnnotationLayer, getResolutionMultiplier, toOpenLayers2TextStyle, getWMTSMatrixIds } from "../PrintUtils";
import { getUnits, normalizeSRS, reprojectGeoJson } from '../CoordinatesUtils';
import { generateEnvString } from '../LayerLocalizationUtils';
import {addAuthenticationParameter} from '../SecurityUtils';
import { calculateExtent, getResolutionsForProjection } from '../MapUtils';
import { optionsToVendorParams } from '../VendorParamsUtils';
import { annotationsToPrint } from '../AnnotationsUtils';
import { getLayerConfig } from '../TileConfigProvider';
import { extractValidBaseURL } from '../TileProviderUtils';
import { getTileMatrix } from '../WMTSUtils';
import { guessFormat } from '../TMSUtils';
import { getGridGeoJson } from "../grids/MapGridsUtils";
import { isEmpty, castArray, head } from 'lodash';
import url from 'url';

import assign from "object-assign";


export function parseCapabilities(capabilities, defaultSpec) {
    const layouts = capabilities?.layouts ?? [{name: 'A4'}];
    const sheetName = layouts.filter(l => getSheetName(l.name) === defaultSpec.sheet).length ?
        defaultSpec.sheet : getSheetName(layouts[0].name);
    return {
        capabilities,
        spec: {
            ...defaultSpec,
            type: "mapfish2",
            sheet: sheetName,
            resolution: capabilities
                    && capabilities.dpis
                    && capabilities.dpis.length
                    && capabilities.dpis[0].value
        }
    };
}

export function getPrintSpecification(spec, state, center, scale, params) {
    return {
        "units": getUnits(spec.projection),
        "srs": normalizeSRS(spec.projection || 'EPSG:3857'),
        "layout": getLayoutName(spec),
        "dpi": parseInt(spec.resolution, 10),
        "outputFilename": "mapstore-print",
        "geodetic": false,
        "mapTitle": spec.name || '',
        "comment": spec.description || '',
        "layers": getMapfishLayersSpecification(spec.layers, spec, state, 'map'),
        "pages": [
            {
                "center": [
                    center.x,
                    center.y
                ],
                "scale": scale,
                "rotation": 0
            }
        ],
        "legends": getMapfishLayersSpecification(spec.layers, spec, state, 'legend'),
        ...params
    };
}

export const specCreators = {
    wms: {
        map: (layer, spec) => ({
            "baseURL": normalizeUrl(layer.url) + '?',
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
            "customParams": addAuthenticationParameter(normalizeUrl(layer.url), assign({
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
                        normalizeUrl(layer.url) + url.format({
                            query: addAuthenticationParameter(normalizeUrl(layer.url), {
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
                1: toOpenLayers2Style(layer, layer.style),
                "Polygon": toOpenLayers2Style(layer, layer.style, "Polygon"),
                "LineString": toOpenLayers2Style(layer, layer.style, "LineString"),
                "Point": toOpenLayers2Style(layer, layer.style, "Point"),
                "FeatureCollection": toOpenLayers2Style(layer, layer.style, "FeatureCollection")
            },
            geoJson: reprojectGeoJson({
                type: "FeatureCollection",
                features: isAnnotationLayer(layer) && annotationsToPrint(layer.features) ||
                                layer.features.map( f => ({...f, properties: {...f.properties, ms_style: f && f.geometry && f.geometry.type && f.geometry.type.replace("Multi", "") || 1}}))
            },
            "EPSG:4326",
            spec.projection)
        }
        )
    },
    graticule: {
        map: (layer, spec, state) => {
            const layout = head(state?.print?.capabilities.layouts.filter((l) => l.name === getLayoutName(spec)));
            const ratio = getResolutionMultiplier(layout?.map?.width, spec.size?.width ?? 370) ?? 1;
            const resolutions = getResolutionsForProjection(spec.projection).map(r => r * ratio);
            const resolution = resolutions[spec.scaleZoom];
            return {
                type: 'Vector',
                name: layer.name || "graticule",
                "opacity": getOpacity(layer),
                styleProperty: "ms_style",
                styles: {
                    "lines": toOpenLayers2Style(layer, layer.style, "GraticuleLines"),
                    "xlabels": toOpenLayers2TextStyle(layer, layer.labelXStyle, "GraticuleXLabels"),
                    "ylabels": toOpenLayers2TextStyle(layer, layer.labelYStyle, "GraticuleYLabels"),
                    "frame": toOpenLayers2Style(layer, layer.frameStyle, "GraticuleFrame")
                },
                geoJson: getGridGeoJson({
                    resolutions,
                    mapProjection: spec.projection,
                    gridProjection: layer.srs || spec.projection,
                    extent: calculateExtent(spec.center, resolution, spec.size, spec.projection),
                    zoom: spec.scaleZoom,
                    withLabels: true,
                    xLabelFormatter: layer.xLabelFormatter,
                    yLabelFormatter: layer.yLabelFormatter,
                    xLabelStyle: toOpenLayers2TextStyle(layer, layer.labelXStyle, "GraticuleXLabels"),
                    yLabelStyle: toOpenLayers2TextStyle(layer, layer.labelYStyle, "GraticuleYLabels"),
                    frameSize: layer.frameRatio
                })
            };
        }
    },
    wfs: {
        map: (layer) => ({
            type: 'Vector',
            name: layer.name,
            "opacity": getOpacity(layer),
            styleProperty: "ms_style",
            styles: {
                1: toOpenLayers2Style(layer, layer.style),
                "Polygon": toOpenLayers2Style(layer, layer.style, "Polygon"),
                "LineString": toOpenLayers2Style(layer, layer.style, "LineString"),
                "Point": toOpenLayers2Style(layer, layer.style, "Point"),
                "FeatureCollection": toOpenLayers2Style(layer, layer.style, "FeatureCollection")
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
            const { tileMatrixSet, tileMatrixSetName} = getTileMatrix(layer, SRS); // TODO: use spec SRS.
            if (!tileMatrixSet) {
                throw Error("tile matrix not found for pdf EPSG" + SRS);
            }
            const matrixIds = getWMTSMatrixIds(layer, tileMatrixSet);
            const baseURL = normalizeUrl(castArray(layer.url)[0]);
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
                "customParams ": addAuthenticationParameter(layer.capabilitiesURL, assign({
                    "TRANSPARENT": true
                })),
                // rest parameter style is not included
                // so simulate with dimensions and params
                ...dimensionParams,
                "matrixIds": matrixIds,
                "matrixSet": tileMatrixSetName,
                "style": layer.style,
                "name": layer.name,
                "requestEncoding": layer.requestEncoding === "RESTful" ? "REST" : layer.requestEncoding || "KVP",
                "opacity": getOpacity(layer),
                "version": layer.version || "1.0.0"
            };
        }
    },
    tileprovider: {
        map: (layer) => {
            // details here: http://www.mapfish.org/doc/print/protocol.html#xyz
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
                // TODO: support bounds
                return {
                    baseURL,
                    path_format: pathFormat,
                    "type": 'xyz',
                    "extension": validURL.split('.').pop() || "png",
                    "opacity": getOpacity(layer),
                    "tileSize": [256, 256],
                    "maxExtent": [-20037508.3392, -20037508.3392, 20037508.3392, 20037508.3392],
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
                    ].filter( (_, i) => {
                        let isIncluded = true;
                        if (layerConfig.maxNativeZoom) {
                            isIncluded = isIncluded && i <= layerConfig.maxNativeZoom;
                        }
                        return isIncluded;
                    })
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
};

export function getPrintUrl(response) {
    return response?.getURL;
}

export default {
    parseCapabilities,
    getPrintSpecification,
    specCreators,
    getPrintUrl
};
