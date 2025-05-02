/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get } from 'ol/proj';
import TileGrid from 'ol/tilegrid/TileGrid';

import CoordinatesUtils from '../CoordinatesUtils';
import { getProjection } from '../ProjectionUtils';
import {needProxy, getProxyUrl} from '../ProxyUtils';
import {optionsToVendorParams} from '../VendorParamsUtils';
import { addAuthenticationToSLD } from '../SecurityUtils';
import { creditsToAttribution, getWMSVendorParams } from '../LayersUtils';
import { getResolutionsForProjection } from '../MapUtils';
import { generateEnvString } from '../LayerLocalizationUtils';
import { getTileGridFromLayerOptions } from '../WMSUtils';


function hasHttpProtocol(givenUrl = '') {
    if (window?.location?.protocol === 'https:') {
        if (givenUrl.indexOf('http') === 0) {
            const givenUrlObject = new URL(givenUrl);
            return givenUrlObject.protocol === 'http:';
        }
        if (givenUrl.indexOf('/') === 0) {
            return false;
        }
        return true;
    }
    return false;
}

/**
 * Check source and apply proxy
 * when `forceProxy` is set on layer options
 * @param {boolean} forceProxy
 * @param {string} src
 * @returns {string}
 */
export const proxySource = (forceProxy, src) => {
    const _forceProxy = forceProxy || hasHttpProtocol(src);
    let newSrc = src;
    if (_forceProxy && needProxy(src)) {
        let proxyUrl = getProxyUrl();
        newSrc = proxyUrl + encodeURIComponent(src);
    }
    return newSrc;
};

export function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

export const toOLAttributions = credits => credits && creditsToAttribution(credits) || undefined;
/**
    @param {object} options of the layer
    @return the Openlayers options from the layers ones and/or default.
    tiled params must be tru if not defined
*/
export function wmsToOpenlayersOptions(options) {
    const params = optionsToVendorParams(options);
    // NOTE: can we use opacity to manage visibility?
    const result = Object.assign({}, options.baseParams, {
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        ...getWMSVendorParams(options),
        VERSION: options.version || "1.3.0"
    }, Object.assign(
        {},
        (options._v_ ? {_v_: options._v_} : {}),
        (params || {}),
        (options.localizedLayerStyles &&
            options.env && options.env.length &&
            options.group !== 'background' ? {ENV: generateEnvString(options.env) } : {})
    ));
    return addAuthenticationToSLD(result, options);
}

export const generateTileGrid = (options, map) => {
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
