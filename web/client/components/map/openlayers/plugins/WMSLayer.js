/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Layers = require('../../../../utils/openlayers/Layers');
const ol = require('openlayers');
const {isNil} = require('lodash');
const objectAssign = require('object-assign');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const ProxyUtils = require('../../../../utils/ProxyUtils');
const {isArray} = require('lodash');
const FilterUtils = require('../../../../utils/FilterUtils');
const SecurityUtils = require('../../../../utils/SecurityUtils');
const mapUtils = require('../../../../utils/MapUtils');

/**
    @param {object} options of the layer
    @return the Openlayers options from the layers ones and/or default.
    tiled params must be tru if not defined
*/
function wmsToOpenlayersOptions(options) {
    const CQL_FILTER = FilterUtils.isFilterValid(options.filterObj) && FilterUtils.toCQLFilter(options.filterObj);
    // NOTE: can we use opacity to manage visibility?
    return objectAssign({}, options.baseParams, {
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        TILED: !isNil(options.tiled) ? options.tiled : true,
        VERSION: options.version || "1.3.0",
        CQL_FILTER
    }, objectAssign(
        {},
        (options._v_ ? {_v_: options._v_} : {}),
        (options.params || {})
    ));
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
                    ratio: options.ratio
                })
            });
        }
        const mapSrs = map && map.getView() && map.getView().getProjection() && map.getView().getProjection().getCode() || 'EPSG:3857';
        const extent = ol.proj.get(CoordinatesUtils.normalizeSRS(options.srs || mapSrs, options.allowedSRS)).getExtent();
        return new ol.layer.Tile({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            source: new ol.source.TileWMS(objectAssign({
                urls: urls,
                params: queryParameters,
                tileGrid: new ol.tilegrid.TileGrid({
                    extent: extent,
                    resolutions: mapUtils.getResolutions(),
                    tileSize: options.tileSize ? options.tileSize : 256,
                    origin: options.origin ? options.origin : [extent[0], extent[1]]
                })
            }, options.forceProxy ? {tileLoadFunction: proxyTileLoadFunction} : {}))
        });
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
            } else if (!oldOptions.params && newOptions.params) {
                changed = true;
            }
            let oldParams = wmsToOpenlayersOptions(oldOptions);
            let newParams = wmsToOpenlayersOptions(newOptions);
            changed = changed || ["LAYERS", "STYLES", "FORMAT", "TRANSPARENT", "TILED", "VERSION", "_v_", "CQL_FILTER"].reduce((found, param) => {
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
                layer.getSource().updateParams(objectAssign(newParams, newOptions.params));
            }
            if (oldOptions.singleTile !== newOptions.singleTile || oldOptions.securityToken !== newOptions.securityToken) {
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
                            params: queryParameters
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
