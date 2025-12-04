/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import union from 'lodash/union';
import isArray from 'lodash/isArray';
import axios from '../../../../libs/ajax';
import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import { getProjection } from '../../../../utils/ProjectionUtils';
import { getConfigProp } from '../../../../utils/ConfigUtils';

import {optionsToVendorParams} from '../../../../utils/VendorParamsUtils';
import {addAuthenticationToSLD, addAuthenticationParameter, getAuthenticationHeaders} from '../../../../utils/SecurityUtils';

import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import {get} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';

import { isVectorFormat } from '../../../../utils/VectorTileUtils';
import { isValidResponse } from '../../../../utils/WMSUtils';
import { OL_VECTOR_FORMATS, applyStyle } from '../../../../utils/openlayers/VectorTileUtils';

import { proxySource, getWMSURLs, wmsToOpenlayersOptions, toOLAttributions, generateTileGrid } from '../../../../utils/openlayers/WMSUtils';

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
                if (isValidResponse(response)) {
                    image.getImage().src = URL.createObjectURL(response.data);
                } else {
                    // #10701 this is needed to trigger the imageloaderror event
                    // in ol otherwise this event is not triggered if you assign
                    // the xml content of the exception to the src attribute
                    image.getImage().src = null;
                    console.error("error: " + response.data);
                }
            }).catch(e => {
                image.getImage().src = null;
                console.error(e);
            });
        } else {
            img.src = newSrc;
        }
    }
};

const createLayer = (options, map, mapId) => {
    // the useForElevation in wms types will be deprecated
    // as support for existing configuration
    // we can use this fallback
    if (options.useForElevation) {
        return Layers.createLayer('elevation', {
            ...options,
            provider: 'wms'
        }, map, mapId);
    }
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const queryParameters = wmsToOpenlayersOptions(options) || {};
    urls.forEach(url => addAuthenticationParameter(url, queryParameters, options.securityToken));
    const headers = getAuthenticationHeaders(urls[0], options.securityToken, options.security);
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
    const sourceOptions = {
        attributions: toOLAttributions(options.credits),
        urls: urls,
        crossOrigin: options.crossOrigin,
        params: queryParameters,
        tileGrid: generateTileGrid(options, map),
        tileLoadFunction: loadFunction(options, headers)
    };

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
            applyStyle(options.vectorStyle, layer, map);
        }
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
            applyStyle(newOptions.vectorStyle, layer, map);
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
        if (!isEqual(oldOptions.security, newOptions.security)) {
            const urls = getWMSURLs(isArray(newOptions.url) ? newOptions.url : [newOptions.url]);
            const headers = getAuthenticationHeaders(urls[0], newOptions.securityToken, newOptions.security);
            wmsSource.setTileLoadFunction(loadFunction(newOptions, headers));
            wmsSource.refresh();
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
                const params = Object.assign(newParams, addAuthenticationToSLD(optionsToVendorParams(newOptions) || {}, newOptions));

                wmsSource.updateParams(Object.assign(params, Object.keys(oldParams || {}).reduce((previous, key) => {
                    return !isNil(params[key]) ? previous : Object.assign(previous, {
                        [key]: undefined
                    });
                }, {})));
            }
        }
        return null;
    }
});
