/*
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {isString, trim, isNumber, pick, get, find, mapKeys, mapValues, keys, uniq, uniqWith, isEqual} = require('lodash');
const uuidv1 = require('uuid/v1');


const DEFAULT_SCREEN_DPI = 96;

const METERS_PER_UNIT = {
    'm': 1,
    'degrees': 111194.87428468118,
    'ft': 0.3048,
    'us-ft': 1200 / 3937
};

const GOOGLE_MERCATOR = {
    RADIUS: 6378137,
    TILE_WIDTH: 256,
    ZOOM_FACTOR: 2
};

const EXTENT_TO_ZOOM_HOOK = 'EXTENT_TO_ZOOM_HOOK';

/**
 * `ZOOM_TO_EXTENT_HOOK` hook takes 2 arguments:
 * - `extent`: array of the extent [minx, miny, maxx, maxy]
 * - `options` object, with the following attributes:
 *   - `crs`: crs of the extent
 *   - `maxZoom`: max zoom for the zoom to functionality.
 *   - `padding`: object with attributes, `top`, `right`, `bottom` and `top` with the size, in pixels of the padding for the visible part of the map. When supported by the mapping lib, it will zoom to visible area
 */
const ZOOM_TO_EXTENT_HOOK = 'ZOOM_TO_EXTENT_HOOK';
const RESOLUTIONS_HOOK = 'RESOLUTIONS_HOOK';
const RESOLUTION_HOOK = 'RESOLUTION_HOOK';
const COMPUTE_BBOX_HOOK = 'COMPUTE_BBOX_HOOK';
const GET_PIXEL_FROM_COORDINATES_HOOK = 'GET_PIXEL_FROM_COORDINATES_HOOK';
const GET_COORDINATES_FROM_PIXEL_HOOK = 'GET_COORDINATES_FROM_PIXEL_HOOK';

let hooks = {};
let CoordinatesUtils = require('./CoordinatesUtils');
let {set} = require('./ImmutableUtils');
const LayersUtils = require('./LayersUtils');
const assign = require('object-assign');
const {isEmpty, findIndex, cloneDeep} = require('lodash');

function registerHook(name, hook) {
    hooks[name] = hook;
}

function getHook(name) {
    return hooks[name];
}

function executeHook(hookName, existCallback, dontExistCallback) {
    const hook = getHook(hookName);
    if (hook) {
        return existCallback(hook);
    }
    if (dontExistCallback) {
        return dontExistCallback();
    }
    return null;
}

function clearHooks() {
    hooks = {};
}

/**
 * @param dpi {number} dot per inch resolution
 * @return {number} dot per meter resolution
 */
function dpi2dpm(dpi) {
    return dpi * (100 / 2.54);
}

/**
 * @param dpi {number} screen resolution in dots per inch.
 * @param projection {string} map projection.
 * @return {number} dots per map unit.
 */
function dpi2dpu(dpi, projection) {
    const units = CoordinatesUtils.getUnits(projection || "EPSG:3857");
    return METERS_PER_UNIT[units] * dpi2dpm(dpi || DEFAULT_SCREEN_DPI);
}

/**
 * @param radius {number} Earth's radius of the model in meters.
 * @param tileWidth {number} width of the tiles used to draw the map.
 * @param zoomFactor {number} zoom factor.
 * @param zoomLvl {number} target zoom level.
 * @param dpi {number} screen resolution in dot per inch.
 * @return {number} the scale of the showed map.
 */
function getSphericalMercatorScale(radius, tileWidth, zoomFactor, zoomLvl, dpi) {
    return 2 * Math.PI * radius / (tileWidth * Math.pow(zoomFactor, zoomLvl) / dpi2dpm(dpi || DEFAULT_SCREEN_DPI));
}

/**
 * @param zoomLvl {number} target zoom level.
 * @param dpi {number} screen resolution in dot per inch.
 * @return {number} the scale of the showed map.
 */
function getGoogleMercatorScale(zoomLvl, dpi) {
    return getSphericalMercatorScale(GOOGLE_MERCATOR.RADIUS, GOOGLE_MERCATOR.TILE_WIDTH, GOOGLE_MERCATOR.ZOOM_FACTOR, zoomLvl, dpi);
}

/**
 * @param radius {number} Earth's radius of the model in meters.
 * @param tileWidth {number} width of the tiles used to draw the map.
 * @param zoomFactor {number} zoom factor.
 * @param minZoom {number} min zoom level.
 * @param maxZoom {number} max zoom level.
 * @param dpi {number} screen resolution in dot per inch.
 * @return {array} a list of scale for each zoom level in the given interval.
 */
function getSphericalMercatorScales(radius, tileWidth, zoomFactor, minZoom, maxZoom, dpi) {
    var retval = [];
    for (let l = minZoom; l <= maxZoom; l++) {
        retval.push(
            getSphericalMercatorScale(
                radius,
                tileWidth,
                zoomFactor,
                l,
                dpi
            )
        );
    }
    return retval;
}

/**
 * Get a list of scales for each zoom level of the Google Mercator.
 * @param minZoom {number} min zoom level.
 * @param maxZoom {number} max zoom level.
 * @return {array} a list of scale for each zoom level in the given interval.
 */
function getGoogleMercatorScales(minZoom, maxZoom, dpi) {
    return getSphericalMercatorScales(
        GOOGLE_MERCATOR.RADIUS,
        GOOGLE_MERCATOR.TILE_WIDTH,
        GOOGLE_MERCATOR.ZOOM_FACTOR,
        minZoom,
        maxZoom,
        dpi
    );
}

/**
 * @param scales {array} list of scales.
 * @param projection {string} map projection.
 * @param dpi {number} screen resolution in dots per inch.
 * @return {array} a list of resolutions corresponding to the given scales, projection and dpi.
 */
function getResolutionsForScales(scales, projection, dpi) {
    const dpu = dpi2dpu(dpi, projection);
    const resolutions = scales.map((scale) => {
        return scale / dpu;
    });
    return resolutions;
}

function getGoogleMercatorResolutions(minZoom, maxZoom, dpi) {
    return getResolutionsForScales(getGoogleMercatorScales(minZoom, maxZoom, dpi), "EPSG:3857", dpi);
}

function getResolutions() {
    if (getHook('RESOLUTIONS_HOOK')) {
        return getHook('RESOLUTIONS_HOOK')();
    }
    return getGoogleMercatorResolutions(0, 21, DEFAULT_SCREEN_DPI);
}

function getScales(projection, dpi) {
    const dpu = dpi2dpu(dpi, projection);
    return getResolutions().map((resolution) => resolution * dpu);
}

function defaultGetZoomForExtent(extent, mapSize, minZoom, maxZoom, dpi, mapResolutions) {
    const wExtent = extent[2] - extent[0];
    const hExtent = extent[3] - extent[1];

    const xResolution = Math.abs(wExtent / mapSize.width);
    const yResolution = Math.abs(hExtent / mapSize.height);
    const extentResolution = Math.max(xResolution, yResolution);

    const resolutions = mapResolutions || getResolutionsForScales(getGoogleMercatorScales(
        minZoom, maxZoom, dpi || DEFAULT_SCREEN_DPI), "EPSG:3857", dpi);

    const {zoom} = resolutions.reduce((previous, resolution, index) => {
        const diff = Math.abs(resolution - extentResolution);
        return diff > previous.diff ? previous : {diff: diff, zoom: index};
    }, {diff: Number.POSITIVE_INFINITY, zoom: 0});

    return Math.max(0, Math.min(zoom, maxZoom));
}

/**
 * Calculates the best fitting zoom level for the given extent.
 *
 * @param extent {Array} [minx, miny, maxx, maxy]
 * @param mapSize {Object} current size of the map.
 * @param minZoom {number} min zoom level.
 * @param maxZoom {number} max zoom level.
 * @param dpi {number} screen resolution in dot per inch.
 * @return {Number} the zoom level fitting th extent
 */
function getZoomForExtent(extent, mapSize, minZoom, maxZoom, dpi) {
    if (getHook("EXTENT_TO_ZOOM_HOOK")) {
        return getHook("EXTENT_TO_ZOOM_HOOK")(extent, mapSize, minZoom, maxZoom, dpi);
    }
    const resolutions = getHook("RESOLUTIONS_HOOK") ?
        getHook("RESOLUTIONS_HOOK")(extent, mapSize, minZoom, maxZoom, dpi, dpi2dpm(dpi || DEFAULT_SCREEN_DPI)) : null;
    return defaultGetZoomForExtent(extent, mapSize, minZoom, maxZoom, dpi, resolutions);
}

/**
* It returns the current resolution.
*
* @param currentZoom {number} the current zoom
* @param minZoom {number} min zoom level.
* @param maxZoom {number} max zoom level.
* @param dpi {number} screen resolution in dot per inch.
* @return {Number} the actual resolution
*/
function getCurrentResolution(currentZoom, minZoom, maxZoom, dpi) {
    if (getHook("RESOLUTION_HOOK")) {
        return getHook("RESOLUTION_HOOK")(currentZoom, minZoom, maxZoom, dpi);
    }
    /* if no hook is registered (leaflet) it is used the GoogleMercatorResolutions in
       in order to get the list of resolutions */
    return getGoogleMercatorResolutions(minZoom, maxZoom, dpi)[currentZoom];
}

/**
 * Calculates the center for for the given extent.
 *
 * @param  {Array} extent [minx, miny, maxx, maxy]
 * @param  {String} projection projection of the extent
 * @return {object} center object
 */
function getCenterForExtent(extent, projection) {

    var wExtent = extent[2] - extent[0];
    var hExtent = extent[3] - extent[1];

    var w = wExtent / 2;
    var h = hExtent / 2;

    return {
        x: extent[0] + w,
        y: extent[1] + h,
        crs: projection
    };
}

/**
 * Calculates the bounding box for the given center and zoom.
 *
 * @param  {object} center object
 * @param  {number} zoom level
 */
function getBbox(center, zoom) {
    return executeHook("COMPUTE_BBOX_HOOK",
        (hook) => {
            return hook(center, zoom);
        }
    );
}

const isNearlyEqual = function(a, b) {
    if (a === undefined || b === undefined) {
        return false;
    }
    return a.toFixed(12) - b.toFixed(12) === 0;
};

/**
 * checks if maps has changed by looking at center or zoom
 * @param {object} oldMap map object
 * @param {object} newMap map object
 */
function mapUpdated(oldMap, newMap) {
    if (oldMap && !isEmpty(oldMap) &&
        newMap && !isEmpty(newMap)) {
        const centersEqual = isNearlyEqual(newMap?.center?.x, oldMap?.center?.x) &&
                              isNearlyEqual(newMap?.center?.y, oldMap?.center?.y);
        return !centersEqual || newMap?.zoom !== oldMap?.zoom;
    }
    return false;
}

/* Transform width and height specified in meters to the units of the specified projection */
function transformExtent(projection, center, width, height) {
    let units = CoordinatesUtils.getUnits(projection);
    if (units === 'ft') {
        return {width: width / METERS_PER_UNIT.ft, height: height / METERS_PER_UNIT.ft};
    } else if (units === 'us-ft') {
        return {width: width / METERS_PER_UNIT['us-ft'], height: height / METERS_PER_UNIT['us-ft']};
    } else if (units === 'degrees') {
        return {
            width: width / (111132.92 - 559.82 * Math.cos(2 * center.y) + 1.175 * Math.cos(4 * center.y)),
            height: height / (111412.84 * Math.cos(center.y) - 93.5 * Math.cos(3 * center.y))
        };
    }
    return {width, height};
}

const groupSaveFormatted = (node) => {
    return {
        id: node.id,
        title: node.title,
        description: node.description,
        tooltipOptions: node.tooltipOptions,
        tooltipPlacement: node.tooltipPlacement,
        expanded: node.expanded
    };
};


function saveMapConfiguration(currentMap, currentLayers, currentGroups, currentBackgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions) {

    const map = {
        center: currentMap.center,
        maxExtent: currentMap.maxExtent,
        projection: currentMap.projection,
        units: currentMap.units,
        mapInfoControl: currentMap.mapInfoControl,
        zoom: currentMap.zoom,
        mapOptions: currentMap.mapOptions || {}
    };

    const layers = currentLayers.map((layer) => {
        return LayersUtils.saveLayer(layer);
    });

    const flatGroupId = currentGroups.reduce((a, b) => {
        const flatGroups = a.concat(LayersUtils.getGroupNodes(b));
        return flatGroups;
    }, [].concat(currentGroups.map(g => g.id)));

    const groups = flatGroupId.map(g => {
        const node = LayersUtils.getNode(currentGroups, g);
        return node && node.nodes ? groupSaveFormatted(node) : null;
    }).filter(g => g);

    const backgrounds = currentBackgrounds.filter(background => !!background.thumbnail);

    // extract sources map
    const sources = LayersUtils.extractSourcesFromLayers(layers);

    /* removes tilematrixset from layers and reduced matrix ids to a list */
    const formattedLayers = layers.map(l => {
        return assign({}, l, {tileMatrixSet: l.tileMatrixSet && l.tileMatrixSet.length > 0, matrixIds: l.matrixIds && Object.keys(l.matrixIds)});
    });

    /* removes the geometryGeodesic property from the features in the annotations layer*/
    let annotationsLayerIndex = findIndex(formattedLayers, layer => layer.id === "annotations");
    if (annotationsLayerIndex !== -1) {
        let featuresLayer = formattedLayers[annotationsLayerIndex].features.map(feature => {
            if (feature.type === "FeatureCollection") {
                return {
                    ...feature,
                    features: feature.features.map(f => {
                        if (f.properties.geometryGeodesic) {
                            return set("properties.geometryGeodesic", null, f);
                        }
                        return f;
                    })
                };
            }
            if (feature.properties.geometryGeodesic) {
                return set("properties.geometryGeodesic", null, feature);
            }
            return {};
        });
        formattedLayers[annotationsLayerIndex] = set("features", featuresLayer, formattedLayers[annotationsLayerIndex]);
    }

    return {
        version: 2,
        // layers are defined inside the map object
        map: assign({}, map, {layers: formattedLayers, groups, backgrounds, text_search_config: textSearchConfig, bookmark_search_config: bookmarkSearchConfig},
            !isEmpty(sources) && {sources} || {}),
        ...additionalOptions
    };
}

const generateNewUUIDs = (mapConfig = {}) => {
    const newMapConfig = cloneDeep(mapConfig);

    const oldIdToNew = {
        ...get(mapConfig, 'map.layers', []).reduce((result, layer) => ({
            ...result,
            [layer.id]: layer.id === 'annotations' ? layer.id : uuidv1()
        }), {}),
        ...get(mapConfig, 'widgetsConfig.widgets', []).reduce((result, widget) => ({...result, [widget.id]: uuidv1()}), {})
    };

    return set('map.backgrounds', get(mapConfig, 'map.backgrounds', []).map(background => ({...background, id: oldIdToNew[background.id]})),
        set('widgetsConfig', {
            collapsed: mapValues(mapKeys(get(mapConfig, 'widgetsConfig.collapsed', {}), (value, key) => oldIdToNew[key]), (value) =>
                ({...value, layouts: mapValues(value.layouts, (layout) => ({...layout, i: oldIdToNew[layout.i]}))})),
            layouts: mapValues(get(mapConfig, 'widgetsConfig.layouts', {}), (value) =>
                value.map(layout => ({...layout, i: oldIdToNew[layout.i]}))),
            widgets: get(mapConfig, 'widgetsConfig.widgets', [])
                .map(widget => ({
                    ...widget,
                    id: oldIdToNew[widget.id],
                    layer: ({...get(widget, 'layer', {}), id: oldIdToNew[get(widget, 'layer.id')]})
                }))
        },
        set('map.layers', get(mapConfig, 'map.layers', [])
            .map(layer => ({...layer, id: oldIdToNew[layer.id]})), newMapConfig)));
};

const mergeMapConfigs = (cfg1 = {}, cfg2 = {}) => {
    // removes empty props from layer as it can cause bugs
    const fixLayers = (layers = []) => layers.map(layer => pick(layer, keys(layer).filter(key => layer[key] !== undefined)));

    const cfg2Fixed = generateNewUUIDs(cfg2);

    const backgrounds = [...get(cfg1, 'map.backgrounds', []), ...get(cfg2Fixed, 'map.backgrounds', [])];

    const layers1 = fixLayers(get(cfg1, 'map.layers', []));
    const layers2 = fixLayers(get(cfg2Fixed, 'map.layers', []));

    const annotationsLayer1 = find(layers1, layer => layer.id === 'annotations');
    const annotationsLayer2 = find(layers2, layer => layer.id === 'annotations');

    const layers = [
        ...layers2.filter(layer => layer.id !== 'annotations'),
        ...layers1.filter(layer => layer.id !== 'annotations'),
        ...(annotationsLayer1 || annotationsLayer2 ? [{
            ...(annotationsLayer1 || {}),
            ...(annotationsLayer2 || {}),
            features: [
                ...get(annotationsLayer1, 'features', []), ...get(annotationsLayer2, 'features', [])
            ]
        }] : [])
    ];
    const backgroundLayers = layers.filter(layer => layer.group === 'background');
    const firstVisible = findIndex(backgroundLayers, layer => layer.visibility);

    const sources1 = get(cfg1, 'map.sources', {});
    const sources2 = get(cfg2Fixed, 'map.sources', {});
    const sources = {...sources1, ...sources2};

    const widgetsConfig1 = get(cfg1, 'widgetsConfig', {});
    const widgetsConfig2 = get(cfg2Fixed, 'widgetsConfig', {});

    return {
        ...cfg2Fixed,
        ...cfg1,
        catalogServices: {
            ...get(cfg1, 'catalogServices', {}),
            services: {
                ...get(cfg1, 'catalogServices.services', {}),
                ...get(cfg2Fixed, 'catalogServices.services', {})
            }
        },
        map: {
            ...cfg2Fixed.map,
            ...cfg1.map,
            backgrounds,
            groups: uniqWith([...get(cfg1, 'map.groups', []), ...get(cfg2Fixed, 'map.groups', [])],
                (group1, group2) => group1.id === group2.id),
            layers: [
                ...backgroundLayers.slice(0, firstVisible + 1),
                ...backgroundLayers.slice(firstVisible + 1).map(layer => ({...layer, visibility: false})),
                ...layers.filter(layer => layer.group !== 'background')
            ],
            sources: !isEmpty(sources) ? sources : undefined
        },
        widgetsConfig: {
            collapsed: {...widgetsConfig1.collapsed, ...widgetsConfig2.collapsed},
            layouts: uniq([...keys(widgetsConfig1.layouts), ...keys(widgetsConfig2.layouts)])
                .reduce((result, key) => ({
                    ...result,
                    [key]: [
                        ...get(widgetsConfig1, `layouts.${key}`, []),
                        ...get(widgetsConfig2, `layouts.${key}`, [])
                    ]
                }), {}),
            widgets: [...get(widgetsConfig1, 'widgets', []), ...get(widgetsConfig2, 'widgets', [])]
        },
        timelineData: {
            ...get(cfg1, 'timelineData', {}),
            ...get(cfg2Fixed, 'timelineData', {})
        },
        dimensionData: {
            ...get(cfg1, 'dimensionData', {}),
            ...get(cfg2Fixed, 'dimensionData', {})
        }
    };
};

const addRootParentGroup = (cfg = {}, groupTitle = 'RootGroup') => {
    const groups = get(cfg, 'map.groups', []);
    const groupsWithoutDefault = groups.filter(({id}) => id !== 'Default');
    const defaultGroup = find(groups, ({id}) => id === 'Default');
    const fixedDefaultGroup = defaultGroup && {
        id: uuidv1(),
        title: groupTitle,
        expanded: defaultGroup.expanded
    };
    const groupsWithFixedDefault = defaultGroup ?
        [
            ...groupsWithoutDefault.map(({id, ...other}) => ({
                id: `${fixedDefaultGroup.id}.${id}`,
                ...other
            })),
            fixedDefaultGroup
        ] :
        groupsWithoutDefault;

    return {
        ...cfg,
        map: {
            ...cfg.map,
            groups: groupsWithFixedDefault,
            layers: get(cfg, 'map.layers', []).map(({group, ...other}) => ({
                ...other,
                group: defaultGroup && group !== 'background' && (group === 'Default' || !group) ? fixedDefaultGroup.id :
                    defaultGroup && find(groupsWithFixedDefault, ({id}) => id.slice(id.indexOf('.') + 1) === group)?.id || group
            }))
        }
    };
};

function isSimpleGeomType(geomType) {
    switch (geomType) {
    case "MultiPoint": case "MultiLineString": case "MultiPolygon": case "GeometryCollection": case "Text": return false;
    case "Point": case "Circle": case "LineString": case "Polygon": default: return true;
    }
}
function getSimpleGeomType(geomType = "Point") {
    switch (geomType) {
    case "Point": case "LineString": case "Polygon": case "Circle": return geomType;
    case "MultiPoint": case "Marker": return "Point";
    case "MultiLineString": return "LineString";
    case "MultiPolygon": return "Polygon";
    case "GeometryCollection": return "GeometryCollection";
    case "Text": return "Point";
    default: return geomType;
    }
}

const getIdFromUri = (uri, regex = /data\/(\d+)/) => {
    // this decode is for backward compatibility with old linked resources`rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` not needed for new ones `rest/geostore/data/2/raw?decode=datauri`
    const decodedUri = decodeURIComponent(uri);
    const findDataDigit = regex.exec(decodedUri);
    return findDataDigit && findDataDigit.length && findDataDigit.length > 1 ? findDataDigit[1] : null;
};

/**
 * Return parsed number from layout value
 * if percentage returns percentage of second argument that should be a number
 * eg. 20% of map height parseLayoutValue(20%, map.size.height)
 * but if value is stored as number it will return the number
 * eg. parseLayoutValue(50, map.size.height) returns 50
 * @param value {number|string} number or percentage value string
 * @param size {number} only in case of percentage
 * @return {number}
 */
const parseLayoutValue = (value, size = 0) => {
    if (isString(value) && value.indexOf('%') !== -1) {
        return parseFloat(trim(value)) * size / 100;
    }
    return isNumber(value) ? value : 0;
};

/**
 * Method for cleanup map object from uneseccary fields which
 * updated map contains and were set on map render
 * @param {object} obj
 */

const prepareMapObjectToCompare = obj => {
    const skippedKeys = ['apiKey', 'time', 'args', 'fixed'];
    const shouldBeSkipped = (key) => skippedKeys.reduce((p, n) => p || key === n, false);
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const type = typeof value;
        if (type === "object" && value !== null && !shouldBeSkipped(key)) {
            prepareMapObjectToCompare(value);
            if (!Object.keys(value).length) {
                delete obj[key];
            }
        } else if (type === "undefined" || !value || shouldBeSkipped(key)) {
            delete obj[key];
        }
    });
};

/**
 * Method added for support old key with objects provided for compareMapChanges feature
 * like text_serch_config
 * @param {object} obj
 * @param {string} oldKey
 * @param {string} newKey
 */
const updateObjectFieldKey = (obj, oldKey, newKey) => {
    if (obj[oldKey]) {
        Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, oldKey));
        delete obj[oldKey];
    }
};

/**
 * Feature for map change recognition. Returns value of isEqual method from lodash
 * @param {object} map1 original map before changes
 * @param {object} map2 updated map
 * @returns {boolean}
 */
const compareMapChanges = (map1 = {}, map2 = {}) => {
    const pickedFields = [
        'map.layers',
        'map.backgrounds',
        'map.text_search_config',
        'map.bookmark_search_config',
        'map.text_serch_config',
        'map.zoom',
        'widgetsConfig'
    ];
    const filteredMap1 = pick(cloneDeep(map1), pickedFields);
    const filteredMap2 = pick(cloneDeep(map2), pickedFields);
    // ABOUT: used for support text_serch_config field in old maps
    updateObjectFieldKey(filteredMap1.map, 'text_serch_config', 'text_search_config');
    updateObjectFieldKey(filteredMap2.map, 'text_serch_config', 'text_search_config');

    prepareMapObjectToCompare(filteredMap1);
    prepareMapObjectToCompare(filteredMap2);
    return isEqual(filteredMap1, filteredMap2);
};

/**
 * creates utilities for registering, fetching, executing hooks
 * used to override default ones in order to have a local hooks object
 * one for each map widget
 */
const createRegisterHooks = () => {
    let hooksCustom = {};
    return {
        registerHook: (name, hook) => {
            hooksCustom[name] = hook;
        },
        getHook: (name) => hooksCustom[name],
        executeHook: (hookName, existCallback, dontExistCallback) => {
            const hook = hooksCustom[hookName];
            if (hook) {
                return existCallback(hook);
            }
            if (dontExistCallback) {
                return dontExistCallback();
            }
            return null;
        }
    };
};
module.exports = {
    createRegisterHooks,
    EXTENT_TO_ZOOM_HOOK,
    RESOLUTIONS_HOOK,
    RESOLUTION_HOOK,
    COMPUTE_BBOX_HOOK,
    GET_PIXEL_FROM_COORDINATES_HOOK,
    GET_COORDINATES_FROM_PIXEL_HOOK,
    DEFAULT_SCREEN_DPI,
    ZOOM_TO_EXTENT_HOOK,
    registerHook,
    getHook,
    dpi2dpm,
    getSphericalMercatorScales,
    getSphericalMercatorScale,
    getGoogleMercatorScales,
    getGoogleMercatorResolutions,
    getGoogleMercatorScale,
    getResolutionsForScales,
    getZoomForExtent,
    defaultGetZoomForExtent,
    getCenterForExtent,
    getResolutions,
    getScales,
    getBbox,
    mapUpdated,
    getCurrentResolution,
    transformExtent,
    saveMapConfiguration,
    generateNewUUIDs,
    mergeMapConfigs,
    addRootParentGroup,
    isSimpleGeomType,
    getSimpleGeomType,
    getIdFromUri,
    parseLayoutValue,
    prepareMapObjectToCompare,
    updateObjectFieldKey,
    compareMapChanges,
    clearHooks
};
