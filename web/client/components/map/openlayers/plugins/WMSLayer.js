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
import isEqual from 'lodash/isEqual';
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

import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';

import { isVectorFormat } from '../../../../utils/VectorTileUtils';
import { OL_VECTOR_FORMATS, applyStyle } from '../../../../utils/openlayers/VectorTileUtils';
import { generateEnvString } from '../../../../utils/LayerLocalizationUtils';

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
        TILED: options.singleTile ? false : (!isNil(options.tiled) ? options.tiled : true),
        VERSION: options.version || "1.3.0"
    }, assign(
        {},
        (options._v_ ? {_v_: options._v_} : {}),
        (params || {}),
        (options.localizedLayerStyles &&
            options.env && options.env.length &&
            options.group !== 'background' ? {ENV: generateEnvString(options.env) } : {})
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

const createLayer = (options, map) => {
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const queryParameters = wmsToOpenlayersOptions(options) || {};
    urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, options.securityToken));

    const vectorFormat = isVectorFormat(options.format);

    if (options.singleTile && !vectorFormat) {
        return new ImageLayer({
            msId: options.id,
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            source: new ImageWMS({
                url: urls[0],
                crossOrigin: options.crossOrigin,
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
        crossOrigin: options.crossOrigin,
        params: queryParameters,
        tileGrid: new TileGrid({
            extent: extent,
            resolutions: options.resolutions || MapUtils.getResolutions(),
            tileSize: options.tileSize ? options.tileSize : 256,
            origin: options.origin ? options.origin : [extent[0], extent[1]]
        })
    }, options);
    const wmsSource = new TileWMS({ ...sourceOptions });
    const layerConfig = {
        msId: options.id,
        opacity: options.opacity !== undefined ? options.opacity : 1,
        visible: options.visibility !== false,
        zIndex: options.zIndex
    };
    let layer;
    if (vectorFormat) {
        layer = new VectorTileLayer({
            ...layerConfig,
            source: new VectorTileSource({
                ...sourceOptions,
                format: new OL_VECTOR_FORMATS[options.format]({
                    layerName: '_layer_'
                }),
                tileUrlFunction: (tileCoord, pixelRatio, projection) => wmsSource.tileUrlFunction(tileCoord, pixelRatio, projection)
            })
        });
    } else {
        layer = new TileLayer({
            ...layerConfig,
            source: wmsSource
        });
    }
    layer.set('map', map);
    if (vectorFormat) {
        layer.set('wmsSource', wmsSource);
        if (options.vectorStyle) {
            applyStyle(options.vectorStyle, layer);
        }
    }
    if (options.useForElevation) {
        layer.set('nodata', options.nodata);
        layer.set('getElevation', getElevation.bind(layer));
    }
    return layer;
};

const mustCreateNewLayer = (oldOptions, newOptions) => {
    return (oldOptions.singleTile !== newOptions.singleTile
        || oldOptions.securityToken !== newOptions.securityToken
        || oldOptions.ratio !== newOptions.ratio
        // no way to remove attribution when credits are removed, so have re-create the layer is needed. Seems to be solved in OL v5.3.0, due to the ol commit 9b8232f65b391d5d381d7a99a7cd070fc36696e9 (https://github.com/openlayers/openlayers/pull/7329)
        || oldOptions.credits !== newOptions.credits && !newOptions.credits
        || isVectorFormat(oldOptions.format) !== isVectorFormat(newOptions.format)
        || isVectorFormat(oldOptions.format) && isVectorFormat(newOptions.format) && oldOptions.format !== newOptions.format
        || oldOptions.localizedLayerStyles !== newOptions.localizedLayerStyles
        || oldOptions.tileSize !== newOptions.tileSize
    );
};

Layers.registerType('wms', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        const newIsVector = isVectorFormat(newOptions.format);

        if (mustCreateNewLayer(oldOptions, newOptions)) {
            // TODO: do we need to clean anything before re-creating stuff from scratch?
            return createLayer(newOptions, map);
        }
        let needsRefresh = false;
        if (newIsVector && newOptions.vectorStyle && !isEqual(newOptions.vectorStyle, oldOptions.vectorStyle || {})) {
            applyStyle(newOptions.vectorStyle, layer);
            needsRefresh = true;
        }

        const wmsSource = layer.get('wmsSource') || layer.getSource();
        const vectorSource = newIsVector ? layer.getSource() : null;

        if (oldOptions.srs !== newOptions.srs) {
            const extent = get(CoordinatesUtils.normalizeSRS(newOptions.srs, newOptions.allowedSRS)).getExtent();
            if (newOptions.singleTile && !newIsVector) {
                layer.setExtent(extent);
            } else {
                const tileGrid = new TileGrid({
                    extent: extent,
                    resolutions: newOptions.resolutions || MapUtils.getResolutions(),
                    tileSize: newOptions.tileSize ? newOptions.tileSize : 256,
                    origin: newOptions.origin ? newOptions.origin : [extent[0], extent[1]]
                });
                wmsSource.tileGrid = tileGrid;
                if (vectorSource) {
                    vectorSource.tileGrid = tileGrid;
                }
            }
            needsRefresh = true;
        }

        if (oldOptions.credits !== newOptions.credits && newOptions.credits) {
            wmsSource.setAttributions(toOLAttributions(newOptions.credits));
            needsRefresh = true;
        }

        let changed = false;
        let oldParams;
        let newParams;
        if (oldOptions && wmsSource && wmsSource.updateParams) {
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
            oldParams = wmsToOpenlayersOptions(oldOptions);
            newParams = wmsToOpenlayersOptions(newOptions);
            changed = changed || ["LAYERS", "STYLES", "FORMAT", "TRANSPARENT", "TILED", "VERSION", "_v_", "CQL_FILTER", "SLD", "VIEWPARAMS"].reduce((found, param) => {
                if (oldParams[param] !== newParams[param]) {
                    return true;
                }
                return found;
            }, false);

            needsRefresh = needsRefresh || changed;
        }

        if (needsRefresh) {
            // forces tile cache drop
            // this prevents old cached tiles at lower zoom levels to be
            // rendered during new params load, but causes a blink glitch.
            // TODO: find out a way to refresh only once to clear lower zoom level cache.
            if (wmsSource.refresh) {
                wmsSource.refresh();
            }
            if (vectorSource) {
                vectorSource.clear();
                vectorSource.refresh();
            }
            if (changed) {
                const params = assign(newParams, SecurityUtils.addAuthenticationToSLD(optionsToVendorParams(newOptions) || {}, newOptions));

                wmsSource.updateParams(assign(params, Object.keys(oldParams || {}).reduce((previous, key) => {
                    return !isNil(params[key]) ? previous : assign(previous, {
                        [key]: undefined
                    });
                }, {})));
            }
        }
        return null;
    }
});
