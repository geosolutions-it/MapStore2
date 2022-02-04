/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { reproject, getUnits, reprojectGeoJson, normalizeSRS } from './CoordinatesUtils';

import {addAuthenticationParameter} from './SecurityUtils';
import { getGoogleMercatorScales } from './MapUtils';
import { optionsToVendorParams } from './VendorParamsUtils';
import { annotationsToPrint } from './AnnotationsUtils';
import { colorToHexStr } from './ColorUtils';
import { getLayerConfig } from './TileConfigProvider';
import { extractValidBaseURL } from './TileProviderUtils';
import { getTileMatrix } from './WMTSUtils';
import { guessFormat } from './TMSUtils';
import { get as getProjection } from 'ol/proj';
import { isArray, filter, find, isEmpty, toNumber, castArray } from 'lodash';
import { getFeature } from '../api/WFS';
import { generateEnvString } from './LayerLocalizationUtils';
import url from 'url';

import { getStore } from "./StateUtils";
import { isLocalizedLayerStylesEnabledSelector, localizedLayerStylesEnvSelector } from '../selectors/localizedLayerStyles';
import { currentLocaleLanguageSelector } from '../selectors/locale';
import { printSpecificationSelector } from "../selectors/print";
import assign from 'object-assign';
import sortBy from "lodash/sortBy";

const defaultScales = getGoogleMercatorScales(0, 21);
let PrintUtils;


// Try to guess geomType, getting the first type available.
export const getGeomType = function(layer) {
    return layer.features && layer.features[0] && layer.features[0].geometry ? layer.features[0].geometry.type :
        layer.features && layer.features[0].features && layer.features[0].style && layer.features[0].style.type ? layer.features[0].style.type : undefined;
};

export const isAnnotationLayer = (layer) => {
    return layer.id === "annotations" || layer.name === "Measurements";
};

/**
 * Utility functions for thumbnails
 * @memberof utils
 * @static
 * @name PrintUtils
 */

/**
 * Extracts the correct opacity from layer. if Undefined, the opacity is `1`.
 * @ignore
 * @param {object} layer the MapStore layer
 */
export const getOpacity = layer => layer.opacity || (layer.opacity === 0 ? 0 : 1.0);

/**
 * Preload data (e.g. WFS) before to sent it to the print tool.
 * @memberof utils.PrintUtils
 */
export const preloadData = (spec) => {
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
    return Promise.resolve(spec);
};
/**
 * Given a static resource, returns the resource's absolute
 * URL. Supports file paths with or without origin/protocol.
 * @param {string} uri the uri to transform
 * @param {string} [origin=window.location.origin] the origin to use
 * @memberof utils.PrintUtils
 */
export const toAbsoluteURL = (uri, origin) => {
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
};
/**
 * Tranform the original URL configuration of the layer into a URL
 * usable for the print service.
 * @param  {string|array} input Original URL
 * @returns {string}       the URL modified as GeoServer requires
 * @memberof utils.PrintUtils
 */
export const normalizeUrl = (input) => {
    let result = isArray(input) ? input[0] : input;
    if (result.indexOf('?') !== -1) {
        result = result.substring(0, result.indexOf('?'));
    }
    return PrintUtils.toAbsoluteURL(result);
};
/**
 * Find the layout name for the given options.
 * The convention is: `PAGE_FORMAT + ("_2_pages_legend"|"_2_pages_legend"|"") + ("_landscape"|"")``
 * @param  {object} spec the spec with the options
 * @returns {string}      the layout name.
 */
export const getLayoutName = (spec) => {
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
};
/**
 * Gets the print scales allowed from the capabilities of the print service.
 * @param  {capabilities} capabilities the capabilities of the print service
 * @returns {array}              the scales array
 * @memberof utils.PrintUtils
 */
export const getPrintScales = (capabilities) => {
    return capabilities.scales.slice(0).reverse().map((scale) => parseFloat(scale.value)) || [];
};
/**
 * Guess the nearest zoom level in the allowed scales
 * @param  {number} zoom                      the zoom level
 * @param  {array} scales                    the allowed scales
 * @param  {array} [mapScales=defaultScales] the map scales
 * @returns {number}                          the index that best approximates the current map scale
 * @memberof utils.PrintUtils
 */
export const getNearestZoom = (zoom, scales, mapScales = defaultScales) => {
    const mapScale = mapScales[Math.round(zoom)];
    return scales.reduce((previous, current, index) => {
        return current < mapScale ? previous : index;
    }, 0);
};
/**
 * @memberof utils
 * Guess the map zoom level from print scale
 * @param  {number} zoom                      the zoom level
 * @param  {array} scales                    the allowed scales
 * @param  {array} [mapScales=defaultScales] the map scales
 * @returns {number}                          the index that best approximates the current map scale
 * @memberof utils.PrintUtils
 */
export const getMapZoom = (scaleZoom, scales, mapScales = defaultScales) => {
    const scale = scales[Math.round(scaleZoom)];
    return mapScales.reduce((previous, current, index) => {
        return current < scale ? previous : index;
    }, 0) + 1;
};
/**
 * Get the mapSize for print preview, parsing the layout and limiting the width.
 * @param  {object} layout   the layout object
 * @param  {number} maxWidth the max width for the mapSize
 * @returns {object}          width and height of a map limited by the maxWidth and with the same ratio of the layout
 * @memberof utils.PrintUtils
 */
export const getMapSize = (layout, maxWidth) => {
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
};

/**
 * Creates the mapfish print specification from the current configuration
 * @param  {object} spec the current configuration
 * @returns {object}      the mapfish print configuration to send to the server
 * @memberof utils.PrintUtils
 */
export const getMapfishPrintSpecification = (spec) => {
    const projectedCenter = reproject(spec.center, 'EPSG:4326', spec.projection);
    return {
        "units": getUnits(spec.projection),
        "srs": normalizeSRS(spec.projection || 'EPSG:3857'),
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
        "legends": PrintUtils.getMapfishLayersSpecification(spec.layers, spec, 'legend'),
        ...spec.params
    };
};

export const localizationFilter = (state, spec) => {
    const localizationEnabled = isLocalizedLayerStylesEnabledSelector(state);
    const localizationEnv = localizedLayerStylesEnvSelector(state);
    const localizedSpec = localizationEnabled ? {
        ...spec,
        env: localizationEnv,
        currentLanguage: currentLocaleLanguageSelector(state)
    } : spec;

    return Promise.resolve(localizedSpec);
};
export const wfsPreloaderFilter = (state, spec) => preloadData(spec);
export const toMapfish = (state, spec) => Promise.resolve(getMapfishPrintSpecification(spec));

const defaultPrintingServiceTransformerChain = [
    {name: "localization", transformer: localizationFilter},
    {name: "wfspreloader", transformer: wfsPreloaderFilter},
    {name: "mapfishSpecCreator", transformer: toMapfish}
];

let userTransformerChain = [];
let mapTransformerChain = [];
let validatorsChain = [];

function addOrReplaceTransformers(chain, transformers) {
    return transformers.reduce((res, transformer) => {
        if (res.findIndex(t => t.name === transformer.name) === -1) {
            return [...res, transformer];
        }
        return res.map(t => t.name === transformer.name ? transformer : t);
    }, chain);
}

export function getSpecTransformerChain() {
    const userOffset = defaultPrintingServiceTransformerChain.length;
    return sortBy(addOrReplaceTransformers(
        defaultPrintingServiceTransformerChain.map((t, index) => ({...t, position: index})),
        userTransformerChain.map((t, index) => ({...t, position: t.position ?? index + userOffset}))
    ), ["position"]);
}

export function getMapTransformerChain() {
    return mapTransformerChain;
}

export function getValidatorsChain() {
    return validatorsChain;
}

/**
 * Resets the list of transformers and validators.
 * @memberof utils.PrintUtils
 */
export function resetDefaultPrintingService() {
    userTransformerChain = [];
    mapTransformerChain = [];
    validatorsChain = [];
}

/**
 * Adds/Updates a user custom transformer for the default printing service spec transformer chain.
 *
 * Transformers are called by the default printing service to enrich / change the spec payload for mapfish-print
 * before calling the remote service.
 *
 * Adding a new transformer allows adding new variables for a custom config.yaml, or process the default
 * ones to implement custom behaviour.
 *
 * @param {string} name name of the transformer (allows replacing one of the default ones, by specifying its name).
 *      default transformers are: `localization`, `wfspreloader`, `mapfishSpecCreator`.
 * @param {function} transformer (state, spec) => Promise<spec>
 * @param {int} position position in the chain (0-indexed), allows inserting a transformer between existing ones
 * @memberof utils.PrintUtils
 *
 * @example
 * // add a transformer to append a new property to the spec
 * addTransformer("mytransform", (state, spec) => ({...spec, newprop: state.print.myprop}))
 */
export function addTransformer(name, transformer, position) {
    userTransformerChain = addOrReplaceTransformers(userTransformerChain, [{name, transformer, position}]);
}

/**
 * Adds/Updates a map custom transformer for the default printing service map object transformer chain.
 *
 * Map transformers can be used to implement custom behaviour that changes map related properties and
 * should be reflected on the printing plugin dialog (e.g. the map-preview).
 *
 * These are applied to the print state map fragment before being passed as a map property to the Print
 * plugin items.
 *
 * @param {string} name name of the transformer (allows replacing and existing one).
 * @param {function} transformer (state, map) => map
 * @example
 * // add a map transformer to increase the map zoom by 1
 * addMapTransformer("mymaptransform", (state, map) => ({...map, zoom: map.zoom + 1}))
 */
export function addMapTransformer(name, transformer) {
    mapTransformerChain = addOrReplaceTransformers(mapTransformerChain, [{name, transformer}]);
}

function addOrReplaceValidators(chain, list) {
    return list.reduce((res, validator) => {
        if (res.findIndex(v => v.id === validator.id) === -1) {
            return [...res, validator];
        }
        return res.map(v => v.id === validator.id ? validator : v);
    }, chain);
}

/**
 * Adds a new validation function.
 * @param {string} id unique id of the validator (a validator with the same id will be replaced).
 * @param {string} name binding name of the validator (bind the validator result to a specific item / plugin, by item id).
 * @param {function} validator (state, current_validation) => { valid: true/false, errors: ["message", ...] }
 *
 * @example
 * // add a validator for the myplugin plugin, bound to the map-preview component
 * addValidator("myplugin", "map-preview", (state, current) => state.print.myprop ? {valid: true} : {valid: false, errors: ["myprop missing"]})
 */
export function addValidator(id, name, validator) {
    validatorsChain = addOrReplaceValidators(validatorsChain, [{id, name, validator}]);
}

/**
 * Returns the default printing service.
 *
 * A printing service implements all the basic functionalities of a printing engine.
 *
 *  - The print function, whose goal is to transform the Print plugin
 *    specification object into a specification for the chosen printing engine.
 *
 *    This service is compatible with the mapfish-2 printing engine and works by applying a chain of transformers,
 *    summing up the defaultPrintingServiceTransformerChain list, to eventual custom transformers,
 *    added with addTransformer.
 *
 *    Each transformer is a function reiceiving two parameters, the redux global state and the print
 *    specification object returned by the previous chain step, and returning a Promise of the transformed
 *    specification:
 *
 *     (state, spec) => Promise.resolve(<transformed spec>)
 *
 *    Project specific transformers can be added to the end of the chain using the addTransformer function.
 *
 *  - The validate function, that validates current user input in the printing dialog and outputs
 *    eventual validation error to be used by the UI items (to show errors, etc.).
 *
 *    It works by applying a chain of validators, that enrich the validation result object.
 *
 *    Each validator has a name, and a function reiceiving two parameters, the redux global state and the
 *    actual validation object for the name:
 *
 *     (state, validation) => {valid: true/false, errors: ["message", ...]}
 *
 *    Project specific validators can be added to the end of the chain using the addValidator function.
 *
 *  - The getMapConfiguration function, that returns a map configuration object for the UI items.
 *
 *    It works by applying a chain of map transformers, that transform the map configuration object.
 *
 *    Each transformer is a function reiceiving two parameters, the redux global state and the
 *    actual map configuration object:
 *
 *     (state, map) => <transformed map>
 *
 *    Project specific transformers can be added to the end of the chain using the addMapTransformer function.
 *
 * @returns {object} the default printint service.
 * @memberof utils.PrintUtils
 */
export const getDefaultPrintingService = () => {
    return {
        print: (layers) => {
            const state = getStore().getState();
            const printSpec = printSpecificationSelector(state);
            const intialSpec = layers ? {
                ...printSpec,
                layers
            } : printSpec;
            return getSpecTransformerChain().map(t => t.transformer).reduce((previous, f) => {
                return previous.then(spec=> f(state, spec));
            }, Promise.resolve(intialSpec));
        },
        validate: () => {
            const state = getStore().getState();
            return getValidatorsChain().reduce((acc, current) => {
                const previousValidation = acc[current.name] ?? {valid: true, errors: []};
                const validation = current.validator(state, previousValidation);
                return {
                    ...acc,
                    [current.name]: {
                        valid: previousValidation.valid && validation.valid,
                        errors: [...previousValidation.errors, ...(validation.errors || [])]
                    }
                };
            }, {});
        },
        getMapConfiguration: () => {
            const state = getStore().getState();
            return getMapTransformerChain().map(t => t.transformer).reduce((acc, t) => {
                return t(state, acc);
            }, state?.print?.map || {});
        }
    };
};

/**
 * Generate the layers (or legend) specification for print.
 * @param  {array} layers  the layers configurations
 * @param  {spec} spec    the print configurations
 * @param  {string} purpose allowed values: `map|legend`. Tells which spec to generate.
 * @returns {array}         the configuration array for layers (or legend) to send to the print service.
 * @memberof utils.PrintUtils
 */
export const getMapfishLayersSpecification = (layers, spec, purpose) => {
    return layers.filter((layer) => PrintUtils.specCreators[layer.type] && PrintUtils.specCreators[layer.type][purpose])
        .map((layer) => PrintUtils.specCreators[layer.type][purpose](layer, spec));
};
export const specCreators = {
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
            "customParams": addAuthenticationParameter(PrintUtils.normalizeUrl(layer.url), assign({
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
                            query: addAuthenticationParameter(PrintUtils.normalizeUrl(layer.url), {
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
            const { tileMatrixSet, tileMatrixSetName} = getTileMatrix(layer, SRS); // TODO: use spec SRS.
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

export const getWMTSMatrixIds = (layer, tileMatrixSet) => {
    let modifiedTileMatrixSet = [];
    const srs = normalizeSRS(layer.srs || 'EPSG:3857', layer.allowedSRS);
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
};
export const rgbaTorgb = (rgba = "") => {
    return rgba.indexOf("rgba") !== -1 ? `rgb${rgba.slice(rgba.indexOf("("), rgba.lastIndexOf(","))})` : rgba;
};

/**
 * Useful for print (Or generic Openlayers 2 conversion style)
 * http://dev.openlayers.org/docs/files/OpenLayers/Feature/Vector-js.html#OpenLayers.Feature.Vector.OpenLayers.Feature.Vector.style
 * @memberof utils.PrintUtils
 */
export const toOpenLayers2Style = function(layer, style, styleType) {
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
};
/**
 * Provides the default style for
 * each vector type.
 * @memberof utils.PrintUtils
 */
export const getOlDefaultStyle = (layer, styleType) => {
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
};


PrintUtils = {
    toAbsoluteURL,
    getLayoutName,
    getMapfishLayersSpecification,
    specCreators,
    normalizeUrl,
    toOpenLayers2Style,
    getWMTSMatrixIds,
    getOlDefaultStyle
};
