/*
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
const RESOLUTIONS_HOOK = 'RESOLUTIONS_HOOK';
const RESOLUTION_HOOK = 'RESOLUTION_HOOK';
const COMPUTE_BBOX_HOOK = 'COMPUTE_BBOX_HOOK';
const GET_PIXEL_FROM_COORDINATES_HOOK = 'GET_PIXEL_FROM_COORDINATES_HOOK';
const GET_COORDINATES_FROM_PIXEL_HOOK = 'GET_COORDINATES_FROM_PIXEL_HOOK';

var hooks = {};
var CoordinatesUtils = require('./CoordinatesUtils');
const LayersUtils = require('./LayersUtils');
const assign = require('object-assign');
const {isObject, head, isEmpty} = require('lodash');

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

    const {zoom, ...other} = resolutions.reduce((previous, resolution, index) => {
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

function mapUpdated(oldMap, newMap) {
    const centersEqual = isNearlyEqual(newMap.center.x, oldMap.center.x) &&
                          isNearlyEqual(newMap.center.y, oldMap.center.y);
    return !centersEqual || newMap.zoom !== oldMap.zoom;
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
    if (isObject(node.title) && head(Object.keys(node.title).filter(t => node.title[t]))) {
        return {id: node.id, title: node.title, expanded: node.expanded};
    }
    return {id: node.id, expanded: node.expanded};
};

/**
* It extracts tile matrix set from layers and add them to sources object
*
* @param sourcesFromLayers {object} layers grouped by url
* @param sources {object} current source object if exists, default { }
* @return {object} new sources object with data from layers
*/
const extractTileMatrixSetFromLayers = (sourcesFromLayers, sources = {}) => {
    return sourcesFromLayers && Object.keys(sourcesFromLayers).reduce((src, url) => {
        const matrixIds = sourcesFromLayers[url].reduce((a, b) => {
            return assign(a, {[b.id || b.name]: { srs: [...Object.keys(b.matrixIds)], matrixIds: assign({}, b.matrixIds)}});
        }, {});

        const newMatrixSet = sourcesFromLayers[url].reduce((nMS, l) => {

            const matrixSetObject = l.tileMatrixSet.reduce((i, tM) => assign({}, i, {[tM['ows:Identifier']]: assign({}, tM)}), {});

            const matrixFilteredByLayers = Object.keys(matrixSetObject).reduce((mFBL, key) => {

                const layers = Object.keys(matrixIds)
                    .filter(layerId => head(matrixIds[layerId].srs.filter(mId => mId === key)))
                    .map(layerId => matrixIds[layerId].matrixIds[key]);

                const TileMatrix = layers[0] && matrixSetObject[key].TileMatrix.map((m, idx) => layers[0][idx] && layers[0][idx].ranges ? assign({}, m, {ranges: layers[0][idx].ranges}) : assign({}, m));

                return !head(layers) ? assign({}, mFBL) : assign({}, mFBL, {[key]: assign({}, matrixSetObject[key], {TileMatrix}) });
            }, {});

            return assign({}, nMS, matrixFilteredByLayers);
        }, {});
        return assign({}, src, { [url]: assign({}, sources[url] || {}, { tileMatrixSet: assign({}, src[url] && src[url].tileMatrixSet || {}, newMatrixSet)})});
    }, assign({}, sources)) || sources;
};

function saveMapConfiguration(currentMap, currentLayers, currentGroups, textSearchConfig, additionalOptions) {

    const map = {
        center: currentMap.center,
        maxExtent: currentMap.maxExtent,
        projection: currentMap.projection,
        units: currentMap.units,
        zoom: currentMap.zoom
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


    /* layers gruped by url to create the source object */
    const groupByUrl = layers.filter(l => l.tileMatrixSet).reduce((a, l) => {
        return a[l.url] ? assign({}, a, {[l.url]: [...a[l.url], l]}) : assign({}, a, {[l.url]: [l]});
    }, {});

    /* extract and add tilematrixseto to sources object  */
    const sources = extractTileMatrixSetFromLayers(groupByUrl);

    /* removes tilematrixset from layers and reduced matrix ids to a list */
    const formattedLayers = layers.map(l => {
        return assign({}, l, {tileMatrixSet: l.tileMatrixSet && l.tileMatrixSet.length > 0, matrixIds: l.matrixIds && Object.keys(l.matrixIds)});
    });

    return {
        version: 2,
        // layers are defined inside the map object
        map: assign({}, map, {layers: formattedLayers, groups, text_serch_config: textSearchConfig}, !isEmpty(sources) && {sources} || {}),
        ...additionalOptions
    };
}

function isSimpleGeomType(geomType) {
    switch (geomType) {
        case "MultiPoint": case "MultiLineString": case "MultiPolygon": return false;
        case "Point": case "LineString": case "Polygon": case "Circle": default: return true;
    }
}
function getSimpleGeomType(geomType = "Point") {
    switch (geomType) {
        case "Point": case "LineString": case "Polygon": case "Circle": return geomType;
        case "MultiPoint": return "Point";
        case "MultiLineString": return "LineString";
        case "MultiPolygon": return "Polygon";
        default: return geomType;
    }
}

module.exports = {
    EXTENT_TO_ZOOM_HOOK,
    RESOLUTIONS_HOOK,
    RESOLUTION_HOOK,
    COMPUTE_BBOX_HOOK,
    GET_PIXEL_FROM_COORDINATES_HOOK,
    GET_COORDINATES_FROM_PIXEL_HOOK,
    DEFAULT_SCREEN_DPI,
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
    isSimpleGeomType,
    getSimpleGeomType,
    extractTileMatrixSetFromLayers
};
