/*
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Cesium from 'cesium';

import {
    pick,
    get,
    find,
    mapKeys,
    mapValues,
    keys,
    uniq,
    uniqWith,
    isEqual,
    isEmpty,
    findIndex,
    cloneDeep,
    minBy,
    omit,
    isObject
} from 'lodash';
import { get as getProjectionOL, getPointResolution, transform } from 'ol/proj';
import { get as getExtent } from 'ol/proj/projections';

import uuidv1 from 'uuid/v1';

import { getUnits, normalizeSRS, reproject } from './CoordinatesUtils';

import { getProjection } from './ProjectionUtils';

import { set } from './ImmutableUtils';
import {
    saveLayer,
    getGroupNodes,
    getNode,
    extractSourcesFromLayers,
    updateAvailableTileMatrixSetsOptions,
    getTileMatrixSetLink,
    DEFAULT_GROUP_ID
} from './LayersUtils';

export const DEFAULT_SCREEN_DPI = 96;

export const METERS_PER_UNIT = {
    'm': 1,
    'degrees': 111194.87428468118,
    'ft': 0.3048,
    'us-ft': 1200 / 3937
};

export const GOOGLE_MERCATOR = {
    RADIUS: 6378137,
    TILE_WIDTH: 256,
    ZOOM_FACTOR: 2
};

export const EMPTY_MAP = 'EMPTY_MAP';

import proj4 from "proj4";

export const EXTENT_TO_ZOOM_HOOK = 'EXTENT_TO_ZOOM_HOOK';

/**
 * `ZOOM_TO_EXTENT_HOOK` hook takes 2 arguments:
 * - `extent`: array of the extent [minx, miny, maxx, maxy]
 * - `options` object, with the following attributes:
 *   - `crs`: crs of the extent
 *   - `maxZoom`: max zoom for the zoom to functionality.
 *   - `padding`: object with attributes, `top`, `right`, `bottom` and `top` with the size, in pixels of the padding for the visible part of the map. When supported by the mapping lib, it will zoom to visible area
 */
export const ZOOM_TO_EXTENT_HOOK = 'ZOOM_TO_EXTENT_HOOK';
export const RESOLUTIONS_HOOK = 'RESOLUTIONS_HOOK';
export const RESOLUTION_HOOK = 'RESOLUTION_HOOK';
export const COMPUTE_BBOX_HOOK = 'COMPUTE_BBOX_HOOK';
export const GET_PIXEL_FROM_COORDINATES_HOOK = 'GET_PIXEL_FROM_COORDINATES_HOOK';
export const GET_COORDINATES_FROM_PIXEL_HOOK = 'GET_COORDINATES_FROM_PIXEL_HOOK';
export const CLICK_ON_MAP_HOOK = 'CLICK_ON_MAP_HOOK';

let hooks = {};


export function registerHook(name, hook) {
    hooks[name] = hook;
}

export function getHook(name) {
    return hooks[name];
}

export function executeHook(hookName, existCallback, dontExistCallback) {
    const hook = getHook(hookName);
    if (hook) {
        return existCallback(hook);
    }
    if (dontExistCallback) {
        return dontExistCallback();
    }
    return null;
}

export function clearHooks() {
    hooks = {};
}

/**
 * @param dpi {number} dot per inch resolution
 * @return {number} dot per meter resolution
 */
export function dpi2dpm(dpi) {
    return dpi * (100 / 2.54);
}

/**
 * @param dpi {number} screen resolution in dots per inch.
 * @param projection {string} map projection.
 * @return {number} dots per map unit.
 */
export function dpi2dpu(dpi, projection) {
    const units = getUnits(projection || "EPSG:3857");
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
export function getSphericalMercatorScale(radius, tileWidth, zoomFactor, zoomLvl, dpi) {
    return 2 * Math.PI * radius / (tileWidth * Math.pow(zoomFactor, zoomLvl) / dpi2dpm(dpi || DEFAULT_SCREEN_DPI));
}

/**
 * @param zoomLvl {number} target zoom level.
 * @param dpi {number} screen resolution in dot per inch.
 * @return {number} the scale of the showed map.
 */
export function getGoogleMercatorScale(zoomLvl, dpi) {
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
export function getSphericalMercatorScales(radius, tileWidth, zoomFactor, minZoom, maxZoom, dpi) {
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
export function getGoogleMercatorScales(minZoom, maxZoom, dpi) {
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
export function getResolutionsForScales(scales, projection, dpi) {
    const dpu = dpi2dpu(dpi, projection);
    const resolutions = scales.map((scale) => {
        return scale / dpu;
    });
    return resolutions;
}

export function getGoogleMercatorResolutions(minZoom, maxZoom, dpi) {
    return getResolutionsForScales(getGoogleMercatorScales(minZoom, maxZoom, dpi), "EPSG:3857", dpi);
}

/**
 * Calculates resolutions accordingly with default algorithm in GeoWebCache.
 * See this: https://github.com/GeoWebCache/geowebcache/blob/5e913193ff50a61ef9dd63a87887189352fa6b21/geowebcache/core/src/main/java/org/geowebcache/grid/GridSetFactory.java#L196
 * It allows to have the resolutions aligned to the default generated grid sets on server side.
 * **NOTES**: this solution doesn't support:
 * - custom grid sets with `alignTopLeft=true` (e.g. GlobalCRS84Pixel). Custom resolutions will need to be configured as `mapOptions.view.resolutions`
 * - custom grid set with custom extent. You need to customize the projection definition extent to make it work.
 * - custom grid set is partially supported by mapOptions.view.resolutions but this is not managed by projection change yet
 * - custom tile sizes
 * @param {string} srs projection code
 * @param {object} options optional configuration
 * @param {number} options.minResolution minimum resolution of the tile grid pyramid, default computed based on minimum zoom
 * @param {number} options.maxResolution maximum resolution of the tile grid pyramid, default computed based on maximum zoom
 * @param {number} options.minZoom minimum zoom of the tile grid pyramid, default 0
 * @param {number} options.maxZoom maximum zoom of the tile grid pyramid, default 30
 * @param {number} options.zoomFactor zoom factor, default 2
 * @param {array} options.extent extent of the tile grid pyramid in the projection coordinates, [minx, miny, maxx, maxy], default maximum extent of the projection
 * @param {number} options.tileWidth tile width, default 256
 * @param {number} options.tileHeight tile height, default 256
 * @return {array} a list of resolution based on the selected projection
 */
export function getResolutionsForProjection(srs, {
    minResolution: minRes,
    maxResolution: maxRes,
    minZoom: minZ,
    maxZoom: maxZ,
    zoomFactor: zoomF,
    extent: ext,
    tileWidth = 256,
    tileHeight = 256
} = {}) {
    const defaultMaxZoom = 30;
    const defaultZoomFactor = 2;

    let minZoom = minZ ?? 0;

    let maxZoom = maxZ ?? defaultMaxZoom;

    let zoomFactor = zoomF ?? defaultZoomFactor;

    const projection = proj4.defs(srs);

    const extent = ext ?? getProjection(srs)?.extent;

    const extentWidth = !extent ? 360 * METERS_PER_UNIT.degrees /
        METERS_PER_UNIT[projection.getUnits()] :
        extent[2] - extent[0];
    const extentHeight = !extent ? 360 * METERS_PER_UNIT.degrees /
        METERS_PER_UNIT[projection.getUnits()] :
        extent[3] - extent[1];

    let resX = extentWidth / tileWidth;
    let resY = extentHeight / tileHeight;
    let tilesWide;
    let tilesHigh;
    if (resX <= resY) {
        // use one tile wide by N tiles high
        tilesWide = 1;
        tilesHigh = Math.round(resY / resX);
        // previous resY was assuming 1 tile high, recompute with the actual number of tiles
        // high
        resY = resY / tilesHigh;
    } else {
        // use one tile high by N tiles wide
        tilesHigh = 1;
        tilesWide = Math.round(resX / resY);
        // previous resX was assuming 1 tile wide, recompute with the actual number of tiles
        // wide
        resX = resX / tilesWide;
    }
    // the maximum of resX and resY is the one that adjusts better
    const res = Math.max(resX, resY);

    /*
        // TODO: this is how GWC creates the bbox adjusted.
        // We should calculate it to have the correct extent for a grid set
        const adjustedExtentWidth = tilesWide * tileWidth * res;
        const adjustedExtentHeight = tilesHigh * tileHeight * res;
        BoundingBox adjExtent = new BoundingBox(extent);
        adjExtent.setMaxX(adjExtent.getMinX() + adjustedExtentWidth);
        // Do we keep the top or the bottom fixed?
        if (alignTopLeft) {
            adjExtent.setMinY(adjExtent.getMaxY() - adjustedExtentHeight);
        } else {
            adjExtent.setMaxY(adjExtent.getMinY() + adjustedExtentHeight);

     */

    const defaultMaxResolution = res;

    const defaultMinResolution = defaultMaxResolution / Math.pow(
        defaultZoomFactor, defaultMaxZoom - 0);

    // user provided maxResolution takes precedence
    let maxResolution = maxRes;
    if (maxResolution !== undefined) {
        minZoom = 0;
    } else {
        maxResolution = defaultMaxResolution / Math.pow(zoomFactor, minZoom);
    }

    // user provided minResolution takes precedence
    let minResolution = minRes;
    if (minResolution === undefined) {
        if (maxZoom !== undefined) {
            if (maxRes !== undefined) {
                minResolution = maxResolution / Math.pow(zoomFactor, maxZoom);
            } else {
                minResolution = defaultMaxResolution / Math.pow(zoomFactor, maxZoom);
            }
        } else {
            minResolution = defaultMinResolution;
        }
        // Cap resolutions to avoid inverted scales (< 1:1), since sub-millimeter scales are not meaningful.
        const minUsableResolution = 1 / dpi2dpu(DEFAULT_SCREEN_DPI, srs);
        minResolution = Math.max(minResolution, minUsableResolution);
    }

    // given discrete zoom levels, minResolution may be different than provided
    maxZoom = minZoom + Math.floor(
        Math.log(maxResolution / minResolution) / Math.log(zoomFactor));
    return Array.apply(0, Array(maxZoom - minZoom + 1)).map((x, y) => maxResolution / Math.pow(zoomFactor, y));
}

export function getResolutions(projection) {
    if (getHook('RESOLUTIONS_HOOK')) {
        return getHook('RESOLUTIONS_HOOK')(projection);
    }
    return projection && normalizeSRS(projection) !== "EPSG:3857" ? getResolutionsForProjection(projection) :
        getGoogleMercatorResolutions(0, 21, DEFAULT_SCREEN_DPI);
}

export function getScales(projection, dpi) {
    const dpu = dpi2dpu(dpi, projection);
    return getResolutions(projection).map((resolution) => resolution * dpu);
}

export function getScale(projection, dpi, resolution) {
    const dpu = dpi2dpu(dpi, projection);
    return resolution * dpu;
}

/**
 * Checks if the camera is looking perpendicular (nadir) to the surface
 * @param {Cesium.Camera} camera - The Cesium camera
 * @param {Cesium.Cartesian3} position - Position on the globe (Cartesian3)
 * @param {Cesium.Ellipsoid} ellipsoid - The ellipsoid (usually scene.globe.ellipsoid)
 * @param {number} threshold - Cosine threshold (0.95 = ~18°, 0.99 = ~8°)
 * @returns {boolean} True if camera is approximately perpendicular
 */
function isCameraPerpendicularToSurface(camera, position, ellipsoid, threshold = 0.95) {
    const surfaceNormal = ellipsoid.geodeticSurfaceNormal(position);
    const cameraDirection = camera.direction;

    // Dot product: -1 = exactly opposite (straight down), 0 = parallel to surface
    const dot = Cesium.Cartesian3.dot(cameraDirection, surfaceNormal);

    // Check if dot product is close to -1 (camera looking straight down)
    return dot < -threshold;
}

/**
 * Calculates the map scale denominator at the center of the Cesium viewer's screen.
 *
 * * @param {Cesium.Viewer} viewer - The Cesium Viewer instance containing the scene and camera.
 * @returns {number} The map scale denominator (M in 1:M) at the screen center.
 *                   Returns a fallback scale based on camera height if the camera
 *                   is looking at space or the globe intersection fails.
 **/
export function getMapScaleForCesium(viewer) {
    const FALLBACK_EARTH_CIRCUMFERENCE_METERS = 80000000;
    const cesiumDefaultProj = "EPSG:3857";
    const scene = viewer.scene;
    const camera = scene.camera;
    const canvas = scene.canvas;
    const ellipsoid = scene.globe.ellipsoid;
    // 1. Get two points at the center of the screen, 1 pixel apart horizontally
    const centerX = Math.floor(canvas.clientWidth / 2);
    const centerY = Math.floor(canvas.clientHeight / 2);

    const leftPoint = new Cesium.Cartesian2(centerX, centerY);
    const rightPoint = new Cesium.Cartesian2(centerX + 1, centerY);

    // 2. Convert screen pixels to Globe positions (Cartesian3)
    const leftRay = camera.getPickRay(leftPoint);
    const rightRay = camera.getPickRay(rightPoint);

    const leftPos = scene.globe.pick(leftRay, scene);
    const rightPos = scene.globe.pick(rightRay, scene);

    // Check if camera is perpendicular (only if we have a valid position to test against)
    const isPerpendicular = Cesium.defined(leftPos) ? isCameraPerpendicularToSurface(camera, leftPos, ellipsoid, 0.95) : false;

    if (!Cesium.defined(leftPos) || !Cesium.defined(rightPos) || isPerpendicular) {
        console.warn('Camera is looking at space/sky or is perpendicular');
        const cameraPosition = viewer.camera.positionCartographic;
        const currentZoom = Math.log2(FALLBACK_EARTH_CIRCUMFERENCE_METERS / (cameraPosition.height)) + 1;
        const resolutions = getResolutions();
        const resolution = resolutions[Math.round(currentZoom)];
        const scaleVal = getScale(cesiumDefaultProj, DEFAULT_SCREEN_DPI, resolution);
        return Math.round(scaleVal ?? 0);
    }

    const leftCartographic = scene.globe.ellipsoid.cartesianToCartographic(leftPos);
    const rightCartographic = scene.globe.ellipsoid.cartesianToCartographic(rightPos);

    const geodesic = new Cesium.EllipsoidGeodesic(leftCartographic, rightCartographic);
    const resolution = geodesic.surfaceDistance; // This is meters per 1 pixel [resolution]
    const scaleValue = getScale(cesiumDefaultProj, DEFAULT_SCREEN_DPI, resolution);
    return Math.round(scaleValue ?? 0);
}
/**
 * get random coordinates within CRS extent
 * @param {string} crs the code of the projection for example EPSG:4346
 * @returns {number[]} the point in [x,y] [lon,lat]
 */
export function getRandomPointInCRS(crs) {
    const extent = getExtent(crs); // Get the projection's extent
    if (!extent) {
        throw new Error(`Extent not available for CRS: ${crs}`);
    }
    const [minX, minY, maxX, maxY] = extent.extent_;

    // Check if the equator (latitude = 0) is within the CRS extent
    const isEquatorWithinExtent = minY <= 0 && maxY >= 0;

    // Generate a random X coordinate within the valid longitude range
    const randomX = Math.random() * (maxX - minX) + minX;

    // Set Y to 0 if the equator is within the extent, otherwise generate a random Y
    const randomY = isEquatorWithinExtent ? 0 : Math.random() * (maxY - minY) + minY;

    return [randomX, randomY];
}

/**
 * convert resolution between CRSs
 * @param {string} sourceCRS the code of a projection
 * @param {string} targetCRS the code of a projection
 * @param {number} sourceResolution the resolution to convert
 * @returns the converted resolution
 */
export function convertResolution(sourceCRS, targetCRS, sourceResolution) {
    const sourceProjection = getProjectionOL(sourceCRS);
    const targetProjection = getProjectionOL(targetCRS);

    if (!sourceProjection || !targetProjection) {
        throw new Error(`Invalid CRS: ${sourceCRS} or ${targetCRS}`);
    }

    // Get a random point in the extent of the source CRS
    const randomPoint = getRandomPointInCRS(sourceCRS);

    // Transform the resolution
    const transformedResolution = getPointResolution(
        sourceProjection,
        sourceResolution,
        transform(randomPoint, sourceCRS, targetCRS),
        targetProjection.getUnits()
    );

    return { randomPoint, transformedResolution };
}

/**
 * Convert a resolution to the nearest zoom
 * @param {number} targetResolution resolution to be converted in zoom
 * @param {array} resolutions list of all available resolutions
 */
export function getZoomFromResolution(targetResolution, resolutions = getResolutions()) {
    // compute the absolute difference for all resolutions
    // and store the idx as zoom
    const diffs = resolutions.map((resolution, zoom) => ({ diff: Math.abs(resolution - targetResolution), zoom }));
    // the minimum difference represents the nearest zoom to the target resolution
    const { zoom } = minBy(diffs, 'diff');
    return zoom;
}

/**
 * Calculate the exact zoom level corresponding to a given resolution
 *
 * @param {number} targetResolution resolution to be converted in zoom
 * @param {number[]} resolutions list of all available resolutions
 * @returns {number} - A floating-point number representing the exact zoom level that corresponds
 *                   to the provided resolution.
 *
 * @example
 * const resolutions = [2048, 1024, 512, 256];
 * const zoom = getExactZoom(600, resolutions);
 * console.log(zoom); // e.g., ~1.77
 */
export function getExactZoomFromResolution(targetResolution, resolutions = getResolutions()) {
    const maxResolution = resolutions[0]; // zoom level 0
    return Math.log2(maxResolution / targetResolution);
}

export function defaultGetZoomForExtent(extent, mapSize, minZoom, maxZoom, dpi, mapResolutions) {
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
export function getZoomForExtent(extent, mapSize, minZoom, maxZoom, dpi) {
    if (getHook("EXTENT_TO_ZOOM_HOOK")) {
        return getHook("EXTENT_TO_ZOOM_HOOK")(extent, mapSize, minZoom, maxZoom, dpi);
    }
    const resolutions = getHook("RESOLUTIONS_HOOK") ?
        getHook("RESOLUTIONS_HOOK")() : null;
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
export function getCurrentResolution(currentZoom, minZoom, maxZoom, dpi) {
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
export function getCenterForExtent(extent, projection) {

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
export function getBbox(center, zoom) {
    return executeHook("COMPUTE_BBOX_HOOK",
        (hook) => {
            return hook(center, zoom);
        }
    );
}

function createTinyNumber(num) {
    return Math.pow(10, -num);
}

/**
 * current implementation will update the map only if the movement
 * between 12 decimals in the reference system to avoid rounded value
 * changes due to float mathematic operations.
 * avoid errors like 44.40641479 !== 44.40641478999999
 * using abs because the difference can be negative, creating a false positive
 * @param {*} a first number
 * @param {*} b second number
 * @param {number} precision
 * @returns
 */
export const isNearlyEqual = function(a, b, numOfDecimals = 12) {
    if (a === undefined || b === undefined) {
        return false;
    }
    return Math.abs(Number(a).toFixed(8) - Number(b).toFixed(8)) <= createTinyNumber(numOfDecimals);

};

/**
 * checks if maps has changed by looking at center or zoom
 * @param {object} oldMap map object
 * @param {object} newMap map object
 */
export function mapUpdated(oldMap, newMap) {
    if (oldMap && !isEmpty(oldMap) &&
        newMap && !isEmpty(newMap)) {
        const centersEqual = isNearlyEqual(newMap?.center?.x, oldMap?.center?.x, 8) &&
                              isNearlyEqual(newMap?.center?.y, oldMap?.center?.y, 8);
        return !centersEqual || newMap?.zoom !== oldMap?.zoom;
    }
    return false;
}

/* Transform width and height specified in meters to the units of the specified projection */
export function transformExtent(projection, center, width, height) {
    let units = getUnits(projection);
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

export const groupSaveFormatted = (node) => {
    return {
        id: node.id,
        title: node.title,
        description: node.description,
        tooltipOptions: node.tooltipOptions,
        tooltipPlacement: node.tooltipPlacement,
        expanded: node.expanded,
        visibility: node.visibility,
        nodesMutuallyExclusive: node.nodesMutuallyExclusive
    };
};


export function saveMapConfiguration(currentMap, currentLayers, currentGroups, currentBackgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions) {

    const map = {
        center: currentMap.center,
        maxExtent: currentMap.maxExtent,
        projection: currentMap.projection,
        units: currentMap.units,
        mapInfoControl: currentMap.mapInfoControl,
        zoom: currentMap.zoom,
        mapOptions: currentMap.mapOptions || {},
        ...(currentMap.visualizationMode && { visualizationMode: currentMap.visualizationMode }),
        ...(currentMap.viewerOptions && { viewerOptions: currentMap.viewerOptions })
    };

    const layers = currentLayers.map((layer) => {
        return saveLayer(layer);
    });

    const flatGroupId = currentGroups.reduce((a, b) => {
        const flatGroups = a.concat(getGroupNodes(b));
        return flatGroups;
    }, [].concat(currentGroups.map(g => g.id)));

    const groups = flatGroupId.map(g => {
        const node = getNode(currentGroups, g);
        return node && node.nodes ? groupSaveFormatted(node) : null;
    }).filter(g => g);

    const backgrounds = currentBackgrounds.filter(background => !!background.thumbnail);

    // extract sources map
    const sources = extractSourcesFromLayers(layers);

    // removes tile matrix set from layers and replace it with a link if available in sources
    const formattedLayers = layers.map(layer => {
        const { availableTileMatrixSets, ...updatedLayer } = updateAvailableTileMatrixSetsOptions(layer);
        return availableTileMatrixSets
            ? {
                ...updatedLayer,
                availableTileMatrixSets: Object.keys(availableTileMatrixSets)
                    .reduce((acc, tileMatrixSetId) => {
                        const tileMatrixSetLink = getTileMatrixSetLink(layer, tileMatrixSetId);
                        if (get({ sources }, tileMatrixSetLink)) {
                            return {
                                ...acc,
                                [tileMatrixSetId]: {
                                    ...omit(availableTileMatrixSets[tileMatrixSetId], 'tileMatrixSet'),
                                    tileMatrixSetLink
                                }
                            };
                        }
                        return {
                            ...acc,
                            [tileMatrixSetId]: availableTileMatrixSets[tileMatrixSetId]
                        };
                    }, {})
            }
            : updatedLayer;
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
        map: Object.assign({}, map, {layers: formattedLayers, groups, backgrounds, text_search_config: textSearchConfig, bookmark_search_config: bookmarkSearchConfig},
            !isEmpty(sources) && {sources} || {}),
        ...additionalOptions
    };
}

export const generateNewUUIDs = (mapConfig = {}) => {
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

export const mergeMapConfigs = (cfg1 = {}, cfg2 = {}) => {
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
    const toleratedFields = ['id', 'visibility'];
    const backgroundLayers = layers.filter(layer => layer.group === 'background')
        // remove duplication by comparing all fields with some level of tolerance
        .filter((l1, i, a) => findIndex(a, (l2) => isEqual(omit(l1, toleratedFields), omit(l2, toleratedFields))) === i);
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

export const addRootParentGroup = (cfg = {}, groupTitle = 'RootGroup') => {
    const groups = get(cfg, 'map.groups', []);
    const groupsWithoutDefault = groups.filter(({id}) => id !== DEFAULT_GROUP_ID);
    const defaultGroup = find(groups, ({id}) => id === DEFAULT_GROUP_ID);
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
                group: defaultGroup && group !== 'background' && (group === DEFAULT_GROUP_ID || !group) ? fixedDefaultGroup.id :
                    defaultGroup && find(groupsWithFixedDefault, ({id}) => id.slice(id.indexOf('.') + 1) === group)?.id || group
            }))
        }
    };
};

export function isSimpleGeomType(geomType) {
    switch (geomType) {
    case "MultiPoint": case "MultiLineString": case "MultiPolygon": case "GeometryCollection": case "Text": return false;
    case "Point": case "Circle": case "LineString": case "Polygon": default: return true;
    }
}
export function getSimpleGeomType(geomType = "Point") {
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

export const getIdFromUri = (uri, regex = /data\/(\d+)/) => {
    // this decode is for backward compatibility with old linked resources`rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` not needed for new ones `rest/geostore/data/2/raw?decode=datauri`
    const decodedUri = decodeURIComponent(uri);
    const findDataDigit = regex.exec(decodedUri);
    return findDataDigit && findDataDigit.length && findDataDigit.length > 1 ? findDataDigit[1] : null;
};


/**
 * Determines if a field should be included in the comparison based on picked fields and exclusion rules.
 * @param {string} path - The full path to the field (e.g., 'root.obj.key').
 * @param {string} key - The key of the field being checked.
 * @param {any} value - The value of the field.
 * @param {object} rules - The rules object containing pickedFields and excludes.
 * @param {string[]} rules.pickedFields - Array of field paths to include in the comparison.
 * @param {object} rules.excludes - Object mapping parent paths to arrays of keys to exclude.
 * @returns {boolean} True if the field should be included, false otherwise.
 */
export const filterFieldByRules = (path, key, value, { pickedFields = [], excludes = {} }) => {
    // remove all empty objects, nill or false value to normalize comparison
    if (
        value === undefined
        || value === null
        || value === false
        || (isObject(value) && isEmpty(value))
    ) {
        return false;
    }
    if (pickedFields.some((field) => field.includes(path) || path.includes(field))) {
        // Fix: check parent path for excludes
        const parentPath = path.substring(0, path.lastIndexOf('.'));
        if (excludes[parentPath] === undefined) {
            return true;
        }
        if (excludes[parentPath] && excludes[parentPath].includes(key)) {
            return false;
        }
        return true;
    }
    return false;
};

/**
 * Apply a custom parser to a value based on the path
 * @param {string} path - The full path to the field (e.g., 'root.obj.key').
 * @param {string} key - The key of the field being checked.
 * @param {any} value - The value of the field.
 * @param {object} rules - The rules object containing pickedFields and excludes.
 * @param {object} rules.parsers - parsers configuration
 * @returns {any} parsed value
 */
export const parseFieldValue = (path, key, value, { parsers }) => {
    return parsers?.[path] ? parsers[path](value, key) : value;
};
/**
 * Prepares object entries for comparison by applying aliasing, filtering, and sorting.
 * @param {object} obj - The object whose entries are to be prepared.
 * @param {object} rules - The rules object containing aliases, pickedFields, and excludes.
 * @param {string} parentKey - The parent key path for the current object.
 * @returns {array} Array of [key, value] pairs, filtered and sorted for comparison.
 */
export const prepareObjectEntries = (obj, rules, parentKey) => {
    const safeObj = obj || {};
    // First apply aliasing and parsing, then filter using the aliased keys
    return Object.entries(safeObj)
        .map(([originalKey, value]) => {
            const key = rules?.aliases?.[originalKey] || originalKey;
            return [key, parseFieldValue(`${parentKey}.${key}`, key, value, rules)];
        })
        .filter(([key, value]) => filterFieldByRules(`${parentKey}.${key}`, key, value, rules))
        .sort((a, b) => {
            if (a[0] < b[0]) { return -1; }
            if (a[0] > b[0]) { return 1; }
            return 0;
        });
};

// function that checks if a field has changed ( also includes the rules to prepare object for comparision)
export const recursiveIsChangedWithRules = (a, b, rules, parentKey = 'root') => {
    // strictly equal
    if (a === b) {
        return false;
    }

    // Handle arrays
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
            return true;
        }
        // same reference
        if (a === b) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (recursiveIsChangedWithRules(a[i], b[i], rules, `${parentKey}[]`)) {
                return true;
            }
        }
        return false;
    }

    // Handle objects
    if (typeof a === 'object' && a !== null) {
        // Prepare entries only if needed
        const aEntries = prepareObjectEntries(a, rules, parentKey);
        const bEntries = prepareObjectEntries(b || {}, rules, parentKey);
        if (aEntries.length !== bEntries.length) {
            return true;
        }
        for (let i = 0; i < aEntries.length; i++) {
            const [key, value] = aEntries[i];
            if (recursiveIsChangedWithRules(value, bEntries[i]?.[1], rules, `${parentKey}.${key}`)) {
                return true;
            }
        }
        return false;
    }
    // Fallback for primitives
    return a !== b;
};

/**
 * @param {object} map1 - The original map configuration object.
 * @param {object} map2 - The updated map configuration object.
 * @returns {boolean} True if the considered fields are equal, false otherwise.
 */
export const compareMapChanges = (map1 = {}, map2 = {}) => {
    const pickedFields = [
        'root.map.layers',
        'root.map.backgrounds',
        'root.map.text_search_config',
        'root.map.bookmark_search_config',
        'root.map.text_serch_config',
        'root.map.zoom',
        'root.widgetsConfig',
        'root.swipe'
    ];
    const aliases = {
        text_serch_config: 'text_search_config'
    };
    const excludes = {
        'root.map.layers[]': ['apiKey', 'time', 'args', 'fixed']
    };
    const parsers = {
        // in some cases widgets have an empty configuration
        // we could exclude them if there are not widgets listed
        'root.widgetsConfig': (value) => {
            if (!value?.widgets?.length) {
                return null;
            }
            return value;
        },
        // the ellipsoid layer is included by default from the background selector
        // we could exclude it because it's not currently configurable
        'root.map.layers': (value) => {
            return (value || []).filter(layer => !(layer.type === 'terrain' && layer.provider === 'ellipsoid'));
        }
    };
    const isSame = !recursiveIsChangedWithRules(map1, map2, { pickedFields, aliases, excludes, parsers }, 'root');
    return isSame;
};
/**
 * creates utilities for registering, fetching, executing hooks
 * used to override default ones in order to have a local hooks object
 * one for each map widget
 */
export const createRegisterHooks = (id) => {
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
        },
        id
    };
};

/**
 * Detects if state has enabled Identify plugin for mapPopUps
 * @param {object} state
 * @returns {boolean}
 */
export const detectIdentifyInMapPopUp = (state)=>{
    if (state.mapPopups?.popups) {
        let hasIdentify = state.mapPopups.popups.filter(plugin =>plugin?.component?.toLowerCase() === 'identify');
        return hasIdentify && hasIdentify.length > 0 ? true : false;
    }
    return false;
};

/**
 * Derive resolution object with scale and zoom info
 * based on visibility limit's type
 * @param value {number} computed with dots per map unit to get resolution
 * @param type {string} of visibility limit ex. scale
 * @param projection {string} map projection
 * @param resolutions {array} map resolutions
 * @return {object} resolution object
 */
export const getResolutionObject = (value, type, {projection, resolutions} = {}) => {
    const dpu = dpi2dpu(DEFAULT_SCREEN_DPI, projection);
    if (type === 'scale') {
        const resolution = value / dpu;
        return {
            resolution: resolution,
            scale: value,
            zoom: getZoomFromResolution(resolution, resolutions)
        };
    }
    return {
        resolution: value,
        scale: value * dpu,
        zoom: getZoomFromResolution(value, resolutions)
    };
};
window.__ = getResolutionObject;

export function calculateExtent(center = {x: 0, y: 0, crs: "EPSG:3857"}, resolution, size = {width: 100, height: 100}, projection = "EPSG:3857") {
    const {x, y} = reproject(center, center.crs ?? projection, projection);
    const dx = resolution * size.width / 2;
    const dy = resolution * size.height / 2;
    return [x - dx, y - dy, x + dx, y + dy];

}


export const reprojectZoom = (zoom, mapProjection, printProjection) => {
    const multiplier = METERS_PER_UNIT[getUnits(mapProjection)] / METERS_PER_UNIT[getUnits(printProjection)];
    const mapResolution = getResolutions(mapProjection)[Math.round(zoom)] * multiplier;
    const printResolutions = getResolutions(printProjection);

    const printResolution = printResolutions.reduce((nearest, current) => {
        return Math.abs(current - mapResolution) < Math.abs(nearest - mapResolution) ? current : nearest;
    }, printResolutions[0]);
    return printResolutions.indexOf(printResolution);
};


export default {
    createRegisterHooks,
    EXTENT_TO_ZOOM_HOOK,
    RESOLUTIONS_HOOK,
    RESOLUTION_HOOK,
    COMPUTE_BBOX_HOOK,
    GET_PIXEL_FROM_COORDINATES_HOOK,
    GET_COORDINATES_FROM_PIXEL_HOOK,
    DEFAULT_SCREEN_DPI,
    ZOOM_TO_EXTENT_HOOK,
    CLICK_ON_MAP_HOOK,
    EMPTY_MAP,
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
    compareMapChanges,
    clearHooks,
    getResolutionObject,
    calculateExtent,
    reprojectZoom
};
