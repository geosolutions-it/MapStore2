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
import axios from '../../../../libs/ajax';
import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import { getProjection } from '../../../../utils/ProjectionUtils';
import {needProxy, getProxyUrl} from '../../../../utils/ProxyUtils';
import { getConfigProp } from '../../../../utils/ConfigUtils';

import {optionsToVendorParams} from '../../../../utils/VendorParamsUtils';
import {addAuthenticationToSLD, addAuthenticationParameter, getAuthenticationHeaders} from '../../../../utils/SecurityUtils';
import { creditsToAttribution, getWMSVendorParams } from '../../../../utils/LayersUtils';

import { getResolutionsForProjection } from '../../../../utils/MapUtils';
import  {loadTile, getElevation as getElevationFunc} from '../../../../utils/ElevationUtils';

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
import { getTileGridFromLayerOptions } from '../../../../utils/WMSUtils';

/**
 * Check source and apply proxy
 * when `forceProxy` is set on layer options
 * @param {boolean} forceProxy
 * @param {string} src
 * @returns {string}
 */
const proxySource = (forceProxy, src) => {
    let newSrc = src;
    if (forceProxy && needProxy(src)) {
        let proxyUrl = getProxyUrl();
        newSrc = proxyUrl + encodeURIComponent(src);
    }
    return newSrc;
};

const loadFunction = (options, headers) => function(image, src) {
    // fixes #3916, see https://gis.stackexchange.com/questions/175057/openlayers-3-wms-styling-using-sld-body-and-post-request
    let img = image.getImage();
    let newSrc = proxySource(options.forceProxy, src);

    if (typeof window.btoa === 'function' && src.length >= (options.maxLengthUrl || getConfigProp('miscSettings')?.maxURLLength || Infinity)) {
        // GET ALL THE PARAMETERS OUT OF THE SOURCE URL**
        let [url, ...dataEntries] = src.split("&");
        url = proxySource(options.forceProxy, url);

        // SET THE PROPER HEADERS AND FINALLY SEND THE PARAMETERS
        axios.post(url, "&" + dataEntries.join("&"), {
            headers: {
                "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
                ...headers
            },
            responseType: 'arraybuffer'
        }).then(response => {
            if (response.status === 200) {
                const uInt8Array = new Uint8Array(response.data);
                let i = uInt8Array.length;
                const binaryString = new Array(i);
                while (i--) {
                    binaryString[i] = String.fromCharCode(uInt8Array[i]);
                }
                const dataImg = binaryString.join('');
                const type = response.headers['content-type'];
                if (type.indexOf('image') === 0) {
                    img.src = 'data:' + type + ';base64,' + window.btoa(dataImg);
                }
            }
        }).catch(e => {
            console.error(e);
        });
    } else {
        if (headers) {
            axios.get(newSrc, {
                headers,
                responseType: 'blob'
            }).then(response => {
                if (response.status === 200 && response.data) {
                    image.getImage().src = URL.createObjectURL(response.data);
                } else {
                    console.error("Status code: " + response.status);
                }
            }).catch(e => {
                console.error(e);
            });
        } else {
            img.src = newSrc;
        }
    }
};
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
        ...getWMSVendorParams(options),
        VERSION: options.version || "1.3.0"
    }, assign(
        {},
        (options._v_ ? {_v_: options._v_} : {}),
        (params || {}),
        (options.localizedLayerStyles &&
            options.env && options.env.length &&
            options.group !== 'background' ? {ENV: generateEnvString(options.env) } : {})
    ));
    return addAuthenticationToSLD(result, options);
}

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

function tileCoordsToKey(coords) {
    return coords.join(':');
}

function elevationLoadFunction(forceProxy, imageTile, src) {
    let newSrc = proxySource(forceProxy, src);
    const coords = imageTile.getTileCoord();
    imageTile.getImage().src = "";
    loadTile(newSrc, coords, tileCoordsToKey(coords));
}

function addTileLoadFunction(sourceOptions, options) {
    if (options.useForElevation) {
        return assign({}, sourceOptions, { tileLoadFunction: elevationLoadFunction.bind(null, [options.forceProxy]) });
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
        const elevation = getElevationFunc(tileCoordsToKey(tilePoint), getTileRelativePixel(this, pos, tilePoint), tileSize, this.get('nodata'), this.get('littleEndian'));
        if (elevation.available) {
            return elevation.value;
        }
        return <Message msgId={elevation.message} />;
    } catch (e) {
        return <Message msgId="elevationLoadingError" />;
    }
}
const toOLAttributions = credits => credits && creditsToAttribution(credits) || undefined;

const generateTileGrid = (options, map) => {
    const mapSrs = map?.getView()?.getProjection()?.getCode() || 'EPSG:3857';
    const normalizedSrs = CoordinatesUtils.normalizeSRS(options.srs || mapSrs, options.allowedSRS);
    const tileSize = options.tileSize ? options.tileSize : 256;
    const extent = get(normalizedSrs).getExtent() || getProjection(normalizedSrs).extent;
    const { TILED } = getWMSVendorParams(options);
    const customTileGrid = TILED && options.tileGridStrategy === 'custom' && options.tileGrids
        ? getTileGridFromLayerOptions({ tileSize, projection: normalizedSrs, tileGrids: options.tileGrids })
        : null;
    if (customTileGrid
        && (customTileGrid.resolutions || customTileGrid.scales)
        && (customTileGrid.origins || customTileGrid.origin)
        && (customTileGrid.tileSizes || customTileGrid.tileSize)) {
        const {
            resolutions: customTileGridResolutions,
            scales,
            origin,
            origins,
            tileSize: customTileGridTileSize,
            tileSizes
        } = customTileGrid;
        const projection = get(normalizedSrs);
        const metersPerUnit = projection.getMetersPerUnit();
        const scaleToResolution = s => s * 0.28E-3 / metersPerUnit;
        const resolutions = customTileGridResolutions
            ? customTileGridResolutions
            : scales.map(scale => scaleToResolution(scale));
        return new TileGrid({
            extent,
            resolutions,
            tileSizes,
            tileSize: customTileGridTileSize,
            origin,
            origins
        });
    }
    const resolutions = options.resolutions || getResolutionsForProjection(normalizedSrs, {
        tileWidth: tileSize,
        tileHeight: tileSize,
        extent
    });
    const origin = options.origin ? options.origin : [extent[0], extent[1]];
    return new TileGrid({
        extent,
        resolutions,
        tileSize,
        origin
    });
};

const createLayer = (options, map) => {
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const queryParameters = wmsToOpenlayersOptions(options) || {};
    urls.forEach(url => addAuthenticationParameter(url, queryParameters, options.securityToken));
    const headers = getAuthenticationHeaders(urls[0], options.securityToken);
    const vectorFormat = isVectorFormat(options.format);

    if (options.singleTile && !vectorFormat) {
        return new ImageLayer({
            msId: options.id,
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            minResolution: options.minResolution,
            maxResolution: options.maxResolution,
            source: new ImageWMS({
                url: urls[0],
                crossOrigin: options.crossOrigin,
                attributions: toOLAttributions(options.credits),
                params: queryParameters,
                ratio: options.ratio || 1,
                imageLoadFunction: loadFunction(options, headers)
            })
        });
    }
    const sourceOptions = addTileLoadFunction({
        attributions: toOLAttributions(options.credits),
        urls: urls,
        crossOrigin: options.crossOrigin,
        params: queryParameters,
        tileGrid: generateTileGrid(options, map),
        tileLoadFunction: loadFunction(options, headers)
    }, options);
    const wmsSource = new TileWMS({ ...sourceOptions });
    const layerConfig = {
        msId: options.id,
        opacity: options.opacity !== undefined ? options.opacity : 1,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        minResolution: options.minResolution,
        maxResolution: options.maxResolution
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
        layer.set('littleEndian', options.littleendian ?? false);
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
        || oldOptions.forceProxy !== newOptions.forceProxy
        || oldOptions.tileGridStrategy !== newOptions.tileGridStrategy
        || !isEqual(oldOptions.tileGrids, newOptions.tileGrids)
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
            const normalizedSrs = CoordinatesUtils.normalizeSRS(newOptions.srs, newOptions.allowedSRS);
            const extent = get(normalizedSrs).getExtent() || getProjection(normalizedSrs).extent;
            if (newOptions.singleTile && !newIsVector) {
                layer.setExtent(extent);
            } else {
                const tileGrid = generateTileGrid(newOptions, map);
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

        if (oldOptions.minResolution !== newOptions.minResolution) {
            layer.setMinResolution(newOptions.minResolution === undefined ? 0 : newOptions.minResolution);
        }
        if (oldOptions.maxResolution !== newOptions.maxResolution) {
            layer.setMaxResolution(newOptions.maxResolution === undefined ? Infinity : newOptions.maxResolution);
        }
        if (needsRefresh) {
            // forces tile cache drop
            // this prevents old cached tiles at lower zoom levels to be
            // rendered during new params load
            wmsSource?.tileCache?.pruneExceptNewestZ?.();
            if (vectorSource) {
                vectorSource.clear();
                vectorSource.refresh();
            }

            if (changed) {
                const params = assign(newParams, addAuthenticationToSLD(optionsToVendorParams(newOptions) || {}, newOptions));

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
