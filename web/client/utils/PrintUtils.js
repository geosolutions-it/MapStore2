/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { reproject, getUnits, reprojectGeoJson, normalizeSRS } from './CoordinatesUtils';

import {addAuthenticationParameter} from './SecurityUtils';
import { calculateExtent, getGoogleMercatorScales, getResolutionsForProjection, getScales } from './MapUtils';
import { optionsToVendorParams } from './VendorParamsUtils';
import { colorToHexStr } from './ColorUtils';
import { getLayerConfig } from './TileConfigProvider';
import { extractValidBaseURL } from './TileProviderUtils';
import { getTileMatrix } from './WMTSUtils';
import { guessFormat } from './TMSUtils';
import { get as getProjection } from 'ol/proj';
import { isArray, filter, find, isEmpty, toNumber, castArray, reverse, includes } from 'lodash';
import { getFeature } from '../api/WFS';
import { generateEnvString } from './LayerLocalizationUtils';
import { ServerTypes } from './LayersUtils';
import PrintStyleParser from './styleparser/PrintStyleParser';
import url from 'url';

import { getStore } from "./StateUtils";
import { isLocalizedLayerStylesEnabledSelector, localizedLayerStylesEnvSelector } from '../selectors/localizedLayerStyles';
import { currentLocaleLanguageSelector } from '../selectors/locale';
import { printSpecificationSelector } from "../selectors/print";
import assign from 'object-assign';
import sortBy from "lodash/sortBy";
import head from "lodash/head";
import isNil from "lodash/isNil";
import get from "lodash/get";
import min from "lodash/min";
import trimEnd from 'lodash/trimEnd';

import { getGridGeoJson } from "./grids/MapGridsUtils";
import { isImageServerUrl } from './ArcGISUtils';
import { getWMSLegendConfig, LEGEND_FORMAT } from './LegendUtils';

const defaultScales = getGoogleMercatorScales(0, 21);
let PrintUtils;

const printStyleParser = new PrintStyleParser();


// Try to guess geomType, getting the first type available.
export const getGeomType = function(layer) {
    return layer.features && layer.features[0] && layer.features[0].geometry ? layer.features[0].geometry.type :
        layer.features && layer.features[0].features && layer.features[0].style && layer.features[0].style.type ? layer.features[0].style.type : undefined;
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

export const mapProjectionSelector = (state) => state?.print?.map?.projection ?? "EPSG:3857";

/**
 * Parse credit/attribution text by removing html tags within its text plus removing '|' symbol
 * @param  {string} creditText the layer credit/attribution text
 * @returns {string}       the parsed credit/attribution text after removing html tags plus '|' symbol within
 * @memberof utils.PrintUtils
 */
export function parseCreditRemovingTagsOrSymbol(creditText = "") {
    let parsedCredit = creditText;
    do {
        let tagStartIndex = parsedCredit.indexOf("<");
        let tagEndIndex = parsedCredit.indexOf(">");
        if (tagStartIndex !== -1 && tagEndIndex !== -1) {
            parsedCredit = parsedCredit.replace(parsedCredit.substring(tagStartIndex, tagEndIndex + 1), "");
        }
    } while (parsedCredit.includes("<") || parsedCredit.includes(">"));
    let hasOrSymbol = parsedCredit && parsedCredit.includes("|");
    if (hasOrSymbol) {
        parsedCredit = parsedCredit?.replaceAll("|", "")?.replaceAll("  ", " ");
    }
    return parsedCredit;
}
/**
 * Gets the credits of layers in one text with '|' separated
 * @param  {object} layers the map layers for print
 * @returns {string}       the layers credits as a text '|' separated
 * @memberof utils.PrintUtils
 */
export const getLayersCredits = (layers) => {
    const layerCredits = layers.filter(lay => lay?.credits?.title).map((layer) => {
        const layerCreditTitle = layer?.credits?.title || '';
        const hasOrSymbol = layerCreditTitle.includes('|');
        const hasHtmlTag = layerCreditTitle.includes('<');
        const layerCredit = (hasHtmlTag || hasOrSymbol)
            ? parseCreditRemovingTagsOrSymbol(layerCreditTitle)
            : layerCreditTitle;
        return layerCredit;
    }).join(' | ');
    return layerCredits;
};

/**
 * Creates the mapfish print specification from the current configuration
 * @param  {object} spec the current configuration
 * @returns {object}      the mapfish print configuration to send to the server
 * @memberof utils.PrintUtils
 */
export const getMapfishPrintSpecification = (rawSpec, state) => {
    const {params, mergeableParams, excludeLayersFromLegend, ...baseSpec} = rawSpec;
    const spec = {...baseSpec, ...params};
    const printMap = state?.print?.map;
    const projectedCenter = reproject(spec.center, 'EPSG:4326', spec.projection);
    // * use [spec.zoom] the actual zoom in case useFixedScale = false else use [spec.scaleZoom] the fixed zoom scale not actual
    const projectedZoom = Math.round(printMap?.useFixedScales ? spec.scaleZoom : spec.zoom);
    const scales = spec.scales || getScales(spec.projection);
    const reprojectedScale = scales[projectedZoom] || defaultScales[projectedZoom];

    const projectedSpec = {
        ...spec,
        center: projectedCenter,
        scaleZoom: projectedZoom
    };
    let legendLayers = spec.layers.filter(layer => !includes(excludeLayersFromLegend, layer.name));
    legendLayers = PrintUtils.getMapfishLayersSpecification(legendLayers, projectedSpec, state, 'legend');
    return {
        "units": getUnits(spec.projection),
        "srs": normalizeSRS(spec.projection || 'EPSG:3857'),
        "layout": PrintUtils.getLayoutName(projectedSpec),
        "dpi": parseInt(spec.resolution, 10),
        "outputFilename": "mapstore-print",
        "geodetic": false,
        "mapTitle": spec.name || '',
        "comment": spec.description || '',
        "layers": PrintUtils.getMapfishLayersSpecification(spec.layers, projectedSpec, state, 'map'),
        "pages": [
            {
                "center": [
                    projectedCenter.x,
                    projectedCenter.y
                ],
                "scale": reprojectedScale,
                "rotation": !isNil(spec.rotation) ? -Number(spec.rotation) : 0 // negate the rotation value to match rotation in map preview and printed output
            }
        ],
        "legends": legendLayers,
        "credits": getLayersCredits(spec.layers),
        ...(mergeableParams ? {mergeableParams} : {}),
        ...params
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
export const toMapfish = (state, spec) => Promise.resolve(getMapfishPrintSpecification(spec, state));

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
 *
 * If you need to use addTransformer in an extension, use action ADD_PRINT_TRANSFORMER from print module
 * Otherwise, the let userTransformerChain are copy to your extension and not override the reference in the print module of MapStore2 framework
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
        print: (extra) => {
            const state = getStore().getState();
            const printSpec = printSpecificationSelector(state);
            const intialSpec = extra ? {
                ...printSpec,
                ...extra
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
 * Default screen DPI (96) to Print DPI (72). Used to calculate correct resolution for
 * screen preview and printed map.
 * @memberof utils.PrintUtils
 */
export const DEFAULT_PRINT_RATIO = 96.0 / 72.0;

/**
 * Returns the correct multiplier to sync the screen resolution and the printed map resolution.
 * @param {number} printSize printed map size (in print points (1/72"))
 * @param {number} screenSize screen preview size (in pixels)
 * @param {number} dpiRatio ratio screen_dpi / printed_dpi
 * @return {number} the resolution multiplier to apply to the screen preview
 * @memberof utils.PrintUtils
 */
export function getResolutionMultiplier(printSize, screenSize, dpiRatio = DEFAULT_PRINT_RATIO) {
    return printSize / screenSize * dpiRatio;
}

/**
 * Returns vendor params that can be used when calling wms server for print requests
 * @param {layer} the layer object
 */
export const getPrintVendorParams = (layer) => {
    if (layer?.serverType === ServerTypes.NO_VENDOR) {
        return {};
    }
    return { "TILED": true };
};

export const getLegendIconsSize = (spec = {}, layer = {}) => {
    const forceIconSize = (spec.forceIconsSize || layer.group === 'background');
    const width = forceIconSize ? spec.iconsWidth : get(layer, 'legendOptions.legendWidth', 12);
    const height = forceIconSize ? spec.iconsHeight : get(layer, 'legendOptions.legendHeight', 12);
    return {
        width,
        height,
        minSymbolSize: min([width, height])
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
export const getMapfishLayersSpecification = (layers, spec, state, purpose) => {
    return layers.filter((layer) => PrintUtils.specCreators[layer.type] && PrintUtils.specCreators[layer.type][purpose])
        .map((layer) => PrintUtils.specCreators[layer.type][purpose](layer, spec, state));
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
                ...getPrintVendorParams(layer),
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
        legend: (layer, spec) => {
            const legendOptions = "forceLabels:" + (spec.forceLabels ? "on" : "") + ";fontAntialiasing:" + spec.antiAliasing + ";dpi:" + spec.legendDpi + ";fontStyle:" + (spec.bold && "bold" || (spec.italic && "italic") || '') + ";fontName:" + spec.fontFamily + ";fontSize:" + spec.fontSize;
            return {
                "name": layer.title || layer.name,
                "classes": [
                    {
                        "name": "",
                        "icons": [
                            PrintUtils.normalizeUrl(layer.url) + url.format({
                                query: addAuthenticationParameter(PrintUtils.normalizeUrl(layer.url), {
                                    ...getWMSLegendConfig({layer, legendOptions, mapBbox: spec.bbox, mapSize: spec.size, projection: spec.projection, format: LEGEND_FORMAT.IMAGE}),
                                    TRANSPARENT: true,
                                    EXCEPTIONS: "application/vnd.ogc.se_xml",
                                    VERSION: "1.1.1",
                                    SCALE: spec.scale,
                                    ...getLegendIconsSize(spec, layer),
                                    ...(spec.language ? {LANGUAGE: spec.language} : {})
                                })
                            })
                        ]
                    }
                ]
            };
        }
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
                features: layer?.style?.format === 'geostyler' && layer?.style?.body
                    ? printStyleParser.writeStyle(layer.style.body, true)({ layer, spec })
                    : layer.features.map( f => ({...f, properties: {...f.properties, ms_style: f && f.geometry && f.geometry.type && f.geometry.type.replace("Multi", "") || 1}}))
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
                    "lines": PrintUtils.toOpenLayers2Style(layer, layer.style, "GraticuleLines"),
                    "xlabels": PrintUtils.toOpenLayers2TextStyle(layer, layer.labelXStyle, "GraticuleXLabels"),
                    "ylabels": PrintUtils.toOpenLayers2TextStyle(layer, layer.labelYStyle, "GraticuleYLabels"),
                    "frame": PrintUtils.toOpenLayers2Style(layer, layer.frameStyle, "GraticuleFrame")
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
                    xLabelStyle: PrintUtils.toOpenLayers2TextStyle(layer, layer.labelXStyle, "GraticuleXLabels"),
                    yLabelStyle: PrintUtils.toOpenLayers2TextStyle(layer, layer.labelYStyle, "GraticuleYLabels"),
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
                1: PrintUtils.toOpenLayers2Style(layer, layer.style),
                "Polygon": PrintUtils.toOpenLayers2Style(layer, layer.style, "Polygon"),
                "LineString": PrintUtils.toOpenLayers2Style(layer, layer.style, "LineString"),
                "Point": PrintUtils.toOpenLayers2Style(layer, layer.style, "Point"),
                "FeatureCollection": PrintUtils.toOpenLayers2Style(layer, layer.style, "FeatureCollection")
            },
            // NOTE: data in this case have to be pre-loaded, in the correct projection
            geoJson: layer.geoJson && {
                type: "FeatureCollection",
                features: layer?.style?.format === 'geostyler' && layer?.style?.body
                    ? printStyleParser.writeStyle(layer.style.body, true)({ layer: { ...layer, features: layer.geoJson.features } })
                    : layer.geoJson.features.map(f => ({ ...f, properties: { ...f.properties, ms_style: f && f.geometry && f.geometry.type && f.geometry.type.replace("Multi", "") || 1 } }))
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
                const queryIndex = validURL.indexOf("?");
                const firstBracketIndex = validURL.indexOf('{');
                const baseURL = validURL.slice(0, firstBracketIndex);
                const pathSection = queryIndex < 0
                    ? validURL.slice(firstBracketIndex)
                    : validURL.slice(firstBracketIndex, queryIndex);
                const pathFormat = pathSection
                    .replace("{x}", "${x}")
                    .replace("{y}", "${y}")
                    .replace("{z}", "${z}");
                // TODO: support bounds
                return {
                    baseURL,
                    path_format: pathFormat,
                    "type": 'xyz',
                    "extension": pathSection.split('.').pop() || "png",
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
                    }),
                    "customParams": Object.fromEntries((new URL(validURL)).searchParams)
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
    },
    arcgis: {
        map: (layer, spec, state) => {
            const layout = head(state?.print?.capabilities.layouts.filter((l) => l.name === getLayoutName(spec)));
            const ratio = getResolutionMultiplier(layout?.map?.width, spec.size?.width ?? 370) ?? 1;
            const resolutions = getResolutionsForProjection(spec.projection).map(r => r * ratio);
            const resolution = resolutions[spec.scaleZoom];
            const extent = calculateExtent(spec.center, resolution, spec.size, spec.projection);
            const sr = spec.projection
                .replace('EPSG:', '')
                .replace('900913', '3857');
            return {
                type: 'Image',
                opacity: layer.opacity ?? 1.0,
                name: layer.name ?? -1,
                baseURL: url.format({
                    ...url.parse(`${trimEnd(layer.url, '/')}/${isImageServerUrl(layer.url) ? 'exportImage' : 'export'}`),
                    query: {
                        F: 'image',
                        ...(layer.name !== undefined  && { LAYERS: `show:${layer.name}` }),
                        FORMAT: layer.format || 'PNG32',
                        TRANSPARENT: true,
                        SIZE: `${layout?.map?.width},${layout?.map?.height}`,
                        bbox: extent.join(','),
                        BBOXSR: sr,
                        IMAGESR: sr,
                        DPI: 90
                    }
                }),
                extent
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

function getLabelAlign(horizontal, vertical) {
    const hAlign = horizontal === "start" ? "l" : (horizontal === "end" ? "r" : "c");
    const vAlign = vertical === "top" ? "t" : (vertical === "bottom" ? "b" : "m");
    return [hAlign, vAlign].join("");
}

/**
 *
 * @param {*} layer
 * @param {*} style
 * @param {*} styleType
 * @memberof utils.PrintUtils
 */
export const toOpenLayers2TextStyle = function(layer, style, styleType) {
    if (!style) {
        return PrintUtils.getOlDefaultStyle(layer, styleType);
    }
    switch (styleType) {
    case 'GraticuleXLabels': {
        return {
            "fontColor": style.color || "#000000",
            "fontFamily": style.font || "12px Calibri,sans-serif",
            "fontWeight": style.fontWeight || "bold",
            "fontSize": style.fontSize || "14",
            "label": "{properties.valueText}",
            "labelAlign": getLabelAlign(style.textAlign || "center", style.verticalAlign || "bottom"),
            "labelOutlineColor": style.labelOutlineColor || "#FFFFFF",
            "labelOutlineWidth": style.labelOutlineWidth / 4.0 || 0.5,
            "rotation": style.rotation ? -style.rotation : 0
        };
    }
    case 'GraticuleYLabels': {
        return {
            "fontColor": style.color || "#000000",
            "fontFamily": style.font || "12px Calibri,sans-serif",
            "fontWeight": style.fontWeight || "bold",
            "fontSize": style.fontSize || "14",
            "label": "{properties.valueText}",
            "labelAlign": getLabelAlign(style.textAlign || "end", style.verticalAlign || "middle"),
            "labelOutlineColor": style.labelOutlineColor || "#FFFFFF",
            "labelOutlineWidth": style.labelOutlineWidth / 4.0 || 0.5,
            "rotation": style.rotation ? -style.rotation : 0
        };
    }
    default: {
        return {
            "fontColor": "#000000",
            "fontFamily": "12px Calibri,sans-serif",
            "fontWeight": "bold",
            "fontSize": "14",
            "label": "{properties.valueText}",
            "labelAlign": "cb",
            "labelOutlineColor": "#FFFFFF",
            "labelOutlineWidth": 0.5
        };
    }
    }
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
    // TODO: add support for grid labels (x and y)
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
        "strokeWidth": style.weight,
        "strokeDashstyle": style.lineDash ? reverse(style.lineDash).join(" ") : undefined
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
    case 'GraticuleLines': {
        return {
            "strokeColor": '#ff7800',
            "strokeOpacity": 0.9,
            "strokeWidth": 2,
            "strokeDashstyle": "4 0.5"
        };
    }
    case 'GraticuleFrame': {
        return {
            "strokeColor": '#000000',
            "strokeOpacity": 1.0,
            "strokeWidth": 1,
            "fillColor": "#FFFFFF",
            "fillOpacity": 1.0
        };
    }
    case 'GraticuleXLabels': {
        return {
            "fontColor": "#000000",
            "fontFamily": "12px Calibri,sans-serif",
            "fontWeight": "bold",
            "fontSize": "14",
            "label": "{properties.valueText}",
            "labelAlign": "cb",
            "labelOutlineColor": "#FFFFFF",
            "labelOutlineWidth": 0.5
        };
    }
    case 'GraticuleYLabels': {
        return {
            "fontColor": "#000000",
            "fontFamily": "12px Calibri,sans-serif",
            "fontWeight": "bold",
            "fontSize": "14",
            "label": "{properties.valueText}",
            "labelAlign": "rm",
            "labelOutlineColor": "#FFFFFF",
            "labelOutlineWidth": 0.5
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
    toOpenLayers2TextStyle,
    getWMTSMatrixIds,
    getOlDefaultStyle
};
