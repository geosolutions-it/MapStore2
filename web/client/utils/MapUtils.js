/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const DEFAULT_SCREEN_DPI = 96;

const GOOGLE_MERCATOR = {
    RADIUS: 6378137,
    TILE_WIDTH: 256,
    ZOOM_FACTOR: 2
};

const EXTENT_TO_ZOOM_HOOK = 'EXTENT_TO_ZOOM_HOOK';
const RESOLUTIONS_HOOK = 'RESOLUTIONS_HOOK';

var hooks = {};
var CoordinatesUtils = require('./CoordinatesUtils');

function registerHook(name, hook) {
    hooks[name] = hook;
}

function getHook(name) {
    return hooks[name];
}

/**
 * @param dpi {number} dot per inch resolution
 * @return {number} dot per meter resolution
 */
function dpi2dpm(dpi) {
    return dpi * (100 / 2.54);
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

function getResolutionsFromScales(scales, dpi) {
    const dpm = dpi2dpm((dpi || DEFAULT_SCREEN_DPI));

    return scales.map((scale) => scale / dpm);
}

function getResolutions() {
    if (getHook('RESOLUTIONS_HOOK')) {
        return getHook('RESOLUTIONS_HOOK')();
    }
    return [];
}

function getScales(projection, dpi) {
    const units = CoordinatesUtils.getUnits(projection);
    const dpm = dpi2dpm((dpi || DEFAULT_SCREEN_DPI));
    return getResolutions().map((resolution) => resolution * dpm * (units === 'degrees' ? 111194.87428468118 : 1));
}

function defaulGetZoomForExtent(extent, mapSize, minZoom, maxZoom, dpi, mapResolutions) {
    const wExtent = extent[2] - extent[0];
    const hExtent = extent[3] - extent[1];

    const xResolution = Math.abs(wExtent / mapSize.width);
    const yResolution = Math.abs(hExtent / mapSize.height);
    const extentResolution = Math.max(xResolution, yResolution);

    const resolutions = mapResolutions || getResolutionsFromScales(getGoogleMercatorScales(
        minZoom, maxZoom, (dpi || DEFAULT_SCREEN_DPI)));

    const {...other, zoom} = resolutions.reduce((previous, resolution, index) => {
        const diff = Math.abs(resolution - extentResolution);
        return diff > previous.diff ? previous : {diff: diff, zoom: index};
    }, {diff: Number.POSITIVE_INFINITY, zoom: 0});

    return Math.max(0, zoom);
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
        getHook("RESOLUTIONS_HOOK")(extent, mapSize, minZoom, maxZoom, dpi, dpi2dpm((dpi || DEFAULT_SCREEN_DPI))) : null;
    return defaulGetZoomForExtent(extent, mapSize, minZoom, maxZoom, dpi, resolutions);
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

    var w = (wExtent) / 2;
    var h = (hExtent) / 2;

    return {
        x: extent[0] + w,
        y: extent[1] + h,
        crs: projection
    };
}

module.exports = {
    EXTENT_TO_ZOOM_HOOK,
    RESOLUTIONS_HOOK,
    DEFAULT_SCREEN_DPI,
    registerHook,
    getHook,
    dpi2dpm,
    getSphericalMercatorScales,
    getSphericalMercatorScale,
    getGoogleMercatorScales,
    getGoogleMercatorScale,
    getZoomForExtent,
    defaulGetZoomForExtent,
    getCenterForExtent,
    getResolutions,
    getScales
};
