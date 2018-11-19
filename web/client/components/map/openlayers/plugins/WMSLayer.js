/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../../../components/I18N/Message');
const Layers = require('../../../../utils/openlayers/Layers');
const ol = require('openlayers');
const {isNil} = require('lodash');
const objectAssign = require('object-assign');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const ProxyUtils = require('../../../../utils/ProxyUtils');
const {isArray} = require('lodash');
const {optionsToVendorParams} = require('../../../../utils/VendorParamsUtils');
const SecurityUtils = require('../../../../utils/SecurityUtils');
const mapUtils = require('../../../../utils/MapUtils');
const ElevationUtils = require('../../../../utils/ElevationUtils');
/**
    @param {object} options of the layer
    @return the Openlayers options from the layers ones and/or default.
    tiled params must be tru if not defined
*/
function wmsToOpenlayersOptions(options) {
    const params = optionsToVendorParams(options);
    // NOTE: can we use opacity to manage visibility?
    const result = objectAssign({}, options.baseParams, {
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        TILED: !isNil(options.tiled) ? options.tiled : true,
        VERSION: options.version || "1.3.0"
    }, objectAssign(
        {},
        (options._v_ ? {_v_: options._v_} : {}),
        (params || {})
    ));
    return SecurityUtils.addAuthenticationToSLD(result, options);
}

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

// Works with geosolutions proxy
function proxyTileLoadFunction(imageTile, src) {
    var newSrc = src;
    if (ProxyUtils.needProxy(src)) {
        let proxyUrl = ProxyUtils.getProxyUrl();
        newSrc = proxyUrl + encodeURIComponent(src);
    }
    imageTile.getImage().src = newSrc;
}

function tileCoordsToKey(coords) {
    return coords.join(':');
}

function elevationLoadFunction(forceProxy, imageTile, src) {
    let newSrc = src;
    if (forceProxy && ProxyUtils.needProxy(src)) {
        let proxyUrl = ProxyUtils.getProxyUrl();
        newSrc = proxyUrl + encodeURIComponent(src);
    }
    const coords = imageTile.getTileCoord();
    imageTile.getImage().src = "";
    ElevationUtils.loadTile(newSrc, coords, tileCoordsToKey(coords));
}

function addTileLoadFunction(sourceOptions, options) {
    if (options.useForElevation) {
        return objectAssign({}, sourceOptions, { tileLoadFunction: elevationLoadFunction.bind(null, [options.forceProxy]) });
        // return objectAssign({}, sourceOptions, { tileLoadFunction: (imageTile, src) => { imageTile.getImage().src = src; } });
    }
    if (options.forceProxy) {
        return objectAssign({}, sourceOptions, {tileLoadFunction: proxyTileLoadFunction});
    }
    return sourceOptions;
}

function getTileFromCoords(layer, pos) {
    const map = layer.get('map');
    const tileGrid = layer.getSource().getTileGrid();
    return tileGrid.getTileCoordForCoordAndZ(pos, map.getView().getZoom());
}


function getTileRelativePixel(layer, pos, tilePoint) {
    const tileGrid = layer.getSource().getTileGrid();
    const extent = tileGrid.getTileCoordExtent(tilePoint);
    const ratio = tileGrid.getTileSize() / (extent[2] - extent[0]);
    const x = Math.floor((pos[0] - extent[0]) * ratio);
    const y = Math.floor((extent[3] - pos[1]) * ratio);
    return { x, y };
}

function getElevation(pos) {
    try {
        const tilePoint = getTileFromCoords(this, pos);
        const tileSize = this.getSource().getTileGrid().getTileSize();
        const elevation = ElevationUtils.getElevation(tileCoordsToKey(tilePoint), getTileRelativePixel(this, pos, tilePoint), tileSize, this.get('nodata'));
        if (elevation.available) {
            return elevation.value;
        }
        return <Message msgId={elevation.message} />;
    } catch (e) {
        return <Message msgId="elevationLoadingError" />;
    }
}

Layers.registerType('wms', {
    create: (options, map) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = wmsToOpenlayersOptions(options) || {};
        urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, options.securityToken));
        if (options.singleTile) {
            return new ol.layer.Image({
                opacity: options.opacity !== undefined ? options.opacity : 1,
                visible: options.visibility !== false,
                zIndex: options.zIndex,
                source: new ol.source.ImageWMS({
                    url: urls[0],
                    params: queryParameters,
                    ratio: options.ratio || 1
                })
            });
        }
        const mapSrs = map && map.getView() && map.getView().getProjection() && map.getView().getProjection().getCode() || 'EPSG:3857';
        const extent = ol.proj.get(CoordinatesUtils.normalizeSRS(options.srs || mapSrs, options.allowedSRS)).getExtent();
        const sourceOptions = addTileLoadFunction({
            urls: urls,
            params: queryParameters,
            tileGrid: new ol.tilegrid.TileGrid({
                extent: extent,
                resolutions: mapUtils.getResolutions(),
                tileSize: options.tileSize ? options.tileSize : 256,
                origin: options.origin ? options.origin : [extent[0], extent[1]]
            })
        }, options);
        const layer = new ol.layer.Tile({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            source: new ol.source.TileWMS(sourceOptions)
        });
        layer.set('map', map);
        if (options.useForElevation) {
            layer.set('nodata', options.nodata);
            layer.set('getElevation', getElevation.bind(layer));
        }
        return layer;
    },
    update: (layer, newOptions, oldOptions, map) => {
        if (oldOptions && layer && layer.getSource() && layer.getSource().updateParams) {
            let changed = false;
            if (oldOptions.params && newOptions.params) {
                changed = Object.keys(oldOptions.params).reduce((found, param) => {
                    if (newOptions.params[param] !== oldOptions.params[param]) {
                        return true;
                    }
                    return found;
                }, false);
            } else if ((!oldOptions.params && newOptions.params) || (oldOptions.params && !newOptions.params)) {
                changed = true;
            }
            let oldParams = wmsToOpenlayersOptions(oldOptions);
            let newParams = wmsToOpenlayersOptions(newOptions);
            changed = changed || ["LAYERS", "STYLES", "FORMAT", "TRANSPARENT", "TILED", "VERSION", "_v_", "CQL_FILTER", "SLD", "VIEWPARAMS"].reduce((found, param) => {
                if (oldParams[param] !== newParams[param]) {
                    return true;
                }
                return found;
            }, false);
            if (oldOptions.srs !== newOptions.srs) {
                const extent = ol.proj.get(CoordinatesUtils.normalizeSRS(newOptions.srs, newOptions.allowedSRS)).getExtent();
                layer.getSource().tileGrid = new ol.tilegrid.TileGrid({
                    extent: extent,
                    resolutions: mapUtils.getResolutions(),
                    tileSize: newOptions.tileSize ? newOptions.tileSize : 256,
                    origin: newOptions.origin ? newOptions.origin : [extent[0], extent[1]]
                });
            }
            if (changed) {
                const params = objectAssign(newParams, SecurityUtils.addAuthenticationToSLD(optionsToVendorParams(newOptions) || {}, newOptions));
                layer.getSource().updateParams(objectAssign(params, Object.keys(oldParams || {}).reduce((previous, key) => {
                    return params[key] ? previous : objectAssign(previous, {
                        [key]: undefined
                    });
                }, {})));
                if (layer.getSource().refresh) {
                    layer.getSource().refresh();
                }
            }
            if (oldOptions.singleTile !== newOptions.singleTile || oldOptions.securityToken !== newOptions.securityToken || oldOptions.ratio !== newOptions.ratio) {
                const urls = getWMSURLs(isArray(newOptions.url) ? newOptions.url : [newOptions.url]);
                const queryParameters = wmsToOpenlayersOptions(newOptions) || {};
                urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, newOptions.securityToken));
                let newLayer;
                if (newOptions.singleTile) {
                    // return the Image Layer with the related source
                    newLayer = new ol.layer.Image({
                        opacity: newOptions.opacity !== undefined ? newOptions.opacity : 1,
                        visible: newOptions.visibility !== false,
                        zIndex: newOptions.zIndex,
                        source: new ol.source.ImageWMS({
                            url: urls[0],
                            params: queryParameters,
                            ratio: newOptions.ratio || 1
                        })
                    });
                } else {
                    // return the Tile Layer with the related source
                    const mapSrs = map && map.getView() && map.getView().getProjection() && map.getView().getProjection().getCode() || 'EPSG:3857';
                    const extent = ol.proj.get(CoordinatesUtils.normalizeSRS(newOptions.srs || mapSrs, newOptions.allowedSRS)).getExtent();
                    newLayer = new ol.layer.Tile({
                        opacity: newOptions.opacity !== undefined ? newOptions.opacity : 1,
                        visible: newOptions.visibility !== false,
                        zIndex: newOptions.zIndex,
                        source: new ol.source.TileWMS(objectAssign({
                            urls: urls,
                            params: queryParameters,
                            tileGrid: new ol.tilegrid.TileGrid({
                                extent: extent,
                                resolutions: mapUtils.getResolutions(),
                                tileSize: newOptions.tileSize ? newOptions.tileSize : 256,
                                origin: newOptions.origin ? newOptions.origin : [extent[0], extent[1]]
                            })
                        }, newOptions.forceProxy ? {tileLoadFunction: proxyTileLoadFunction} : {}))
                    });
                }
                return newLayer;
            }
            return null;
        }
    }
});
