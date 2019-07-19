/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Message from '../../../../components/I18N/Message';
import Layers from '../../../../utils/openlayers/Layers';
import isNil from 'lodash/isNil';
import union from 'lodash/union';
import isArray from 'lodash/isArray';
import assign from 'object-assign';

import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import ProxyUtils from '../../../../utils/ProxyUtils';

import {optionsToVendorParams} from '../../../../utils/VendorParamsUtils';
import SecurityUtils from '../../../../utils/SecurityUtils';
import { creditsToAttribution } from '../../../../utils/LayersUtils';

import MapUtils from '../../../../utils/MapUtils';
import ElevationUtils from '../../../../utils/ElevationUtils';

import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import {get} from 'ol/proj';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

/**
    @param {object} options of the layer
    @return the Openlayers options from the layers ones and/or default.
    tiled params must be tru if not defined
*/
function wmsToOpenlayersOptions(options) {
    const params = optionsToVendorParams(options);
    // NOTE: can we use opacity to manage visibility?
    const result = assign({}, options.baseParams, {
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        TILED: !isNil(options.tiled) ? options.tiled : true,
        VERSION: options.version || "1.3.0"
    }, assign(
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
        return assign({}, sourceOptions, { tileLoadFunction: elevationLoadFunction.bind(null, [options.forceProxy]) });
        // return assign({}, sourceOptions, { tileLoadFunction: (imageTile, src) => { imageTile.getImage().src = src; } });
    }
    if (options.forceProxy) {
        return assign({}, sourceOptions, {tileLoadFunction: proxyTileLoadFunction});
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
const toOLAttributions = credits => credits && creditsToAttribution(credits) || undefined;

Layers.registerType('wms', {
    create: (options, map) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = wmsToOpenlayersOptions(options) || {};
        urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, options.securityToken));
        if (options.singleTile) {
            return new ImageLayer({
                opacity: options.opacity !== undefined ? options.opacity : 1,
                visible: options.visibility !== false,
                zIndex: options.zIndex,
                source: new ImageWMS({
                    url: urls[0],
                    attributions: toOLAttributions(options.credits),
                    params: queryParameters,
                    ratio: options.ratio || 1
                })
            });
        }
        const mapSrs = map && map.getView() && map.getView().getProjection() && map.getView().getProjection().getCode() || 'EPSG:3857';
        const extent = get(CoordinatesUtils.normalizeSRS(options.srs || mapSrs, options.allowedSRS)).getExtent();
        const sourceOptions = addTileLoadFunction({
            attributions: toOLAttributions(options.credits),
            urls: urls,
            params: queryParameters,
            tileGrid: new TileGrid({
                extent: extent,
                resolutions: MapUtils.getResolutions(),
                tileSize: options.tileSize ? options.tileSize : 256,
                origin: options.origin ? options.origin : [extent[0], extent[1]]
            })
        }, options);
        const layer = new TileLayer({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            source: new TileWMS(sourceOptions)
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
                changed = union(
                        Object.keys(oldOptions.params),
                        Object.keys(newOptions.params)
                    ).reduce((found, param) => {
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
                const extent = get(CoordinatesUtils.normalizeSRS(newOptions.srs, newOptions.allowedSRS)).getExtent();
                layer.getSource().tileGrid = new TileGrid({
                    extent: extent,
                    resolutions: MapUtils.getResolutions(),
                    tileSize: newOptions.tileSize ? newOptions.tileSize : 256,
                    origin: newOptions.origin ? newOptions.origin : [extent[0], extent[1]]
                });
            }
            if (changed) {
                const params = assign(newParams, SecurityUtils.addAuthenticationToSLD(optionsToVendorParams(newOptions) || {}, newOptions));
                const source = layer.getSource();
                // forces tile cache drop
                // this prevents old cached tiles at lower zoom levels to be
                // rendered during new params load, but causes a blink glitch.
                // TODO: find out a way to refresh only once to clear lower zoom level cache.
                if (layer.getSource().refresh ) {
                    layer.getSource().refresh();
                }
                source.updateParams(assign(params, Object.keys(oldParams || {}).reduce((previous, key) => {
                    return params[key] ? previous : assign(previous, {
                        [key]: undefined
                    });
                }, {})));

            }
            if (oldOptions.credits !== newOptions.credits && newOptions.credits) {
                layer.getSource().setAttributions(toOLAttributions(newOptions.credits));
            }
            if (oldOptions.singleTile !== newOptions.singleTile
                || oldOptions.securityToken !== newOptions.securityToken
                || oldOptions.ratio !== newOptions.ratio
                 // no way to remove attribution when credits are removed, so have re-create the layer is needed. Seems to be solved in OL v5.3.0, due to the ol commit 9b8232f65b391d5d381d7a99a7cd070fc36696e9 (https://github.com/openlayers/openlayers/pull/7329)
                || oldOptions.credits !== newOptions.credits && !newOptions.credits
                ) {
                const urls = getWMSURLs(isArray(newOptions.url) ? newOptions.url : [newOptions.url]);
                const queryParameters = wmsToOpenlayersOptions(newOptions) || {};
                urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, newOptions.securityToken));
                let newLayer;
                if (newOptions.singleTile) {
                    // return the Image Layer with the related source
                    newLayer = new ImageLayer({
                        opacity: newOptions.opacity !== undefined ? newOptions.opacity : 1,
                        visible: newOptions.visibility !== false,
                        zIndex: newOptions.zIndex,
                        source: new ImageWMS({
                            attributions: toOLAttributions(newOptions.credits),
                            url: urls[0],
                            params: queryParameters,
                            ratio: newOptions.ratio || 1
                        })
                    });
                } else {
                    // return the Tile Layer with the related source
                    const mapSrs = map && map.getView() && map.getView().getProjection() && map.getView().getProjection().getCode() || 'EPSG:3857';
                    const extent = get(CoordinatesUtils.normalizeSRS(newOptions.srs || mapSrs, newOptions.allowedSRS)).getExtent();
                    newLayer = new TileLayer({
                        opacity: newOptions.opacity !== undefined ? newOptions.opacity : 1,
                        visible: newOptions.visibility !== false,
                        zIndex: newOptions.zIndex,
                        source: new TileWMS(assign({
                            attributions: toOLAttributions(newOptions.credits),
                            urls: urls,
                            params: queryParameters,
                            tileGrid: new TileGrid({
                                // TODO: custom grid sets extents
                                extent: extent,
                                // TODO: custom grid sets resolutions and tile size (needed to generate resolutions)
                                resolutions: MapUtils.getResolutions(),
                                tileSize: newOptions.tileSize ? newOptions.tileSize : 256,
                                // TODO: GWC grid sets with `alignTopLeft=true` may require `extent[0], extent[3]`
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
