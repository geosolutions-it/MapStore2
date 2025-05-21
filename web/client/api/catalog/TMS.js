/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get, castArray } from 'lodash';
import * as TMS100 from './TMS_1_0_0';

import * as tileProvider from './tileProvider';
import { validate as defaultValidate, testService as defaultTestService } from './common';
import { cleanAuthParamsFromURL } from '../../utils/SecurityUtils';
import { getTileMap } from '../TMS';
import { extractOGCServicesReferences } from '../../utils/CatalogUtils';

/**
 * Implements Catalog API for the abstraction of a TMS catalog, that can provide layers of type:
 * - tileprovider: custom (type of provider is "custom", or empty) or pre-configured configuration of tileprovider layers (will have provider: "provider.variant").
 * - tms: standard TMS 1.0.0 service, with remote data retrieval.
 * @module api.catalog.TMS
 */

export const getRecords = (url, startPosition, maxRecords, text, info = {}) => {
    const {options} = info;
    const { service = {} } = options || {};
    if ( service.provider === "tms") {
        TMS100.getRecords(url, startPosition, maxRecords, text, info);

    }
    return tileProvider.getRecords(url, startPosition, maxRecords, text, info);
};
export const textSearch = (url, startPosition, maxRecords, text, info = {}) => {
    const { options } = info;
    const { service = {} } = options || {};
    if (service.provider === "tms") {
        return TMS100.getRecords(url, startPosition, maxRecords, text, info);
    }
    return tileProvider.getRecords(url, startPosition, maxRecords, text, info);
};
export const validate = service => {
    if (service.provider === "tms") {
        return defaultValidate(service);
    }
    return tileProvider.validate(service);
};
export const testService = service => {
    if (service.provider === "tms") {
        return defaultTestService({ parseUrl: TMS100.parseUrl })(service);
    }
    return tileProvider.testService(service);
};

export const getCatalogRecords = (data, options) => {
    if (data && data.records) {
        const isTMS100 = options.service && options.service.provider === "tms";
        if (isTMS100) {
            const references = [{
                type: "OGC:TMS",
                version: "1.0.0",
                url: options.url
            }];
            const { tms: ogcReferences } = extractOGCServicesReferences({ references });
            return data.records.map(record => ({
                serviceType: 'tms',
                layerType: 'tms',
                isValid: !!ogcReferences,
                title: record.title,
                tileMapUrl: record.href,
                description: `${record.srs}${record.format ? ", " + record.format : ""}`,
                tmsUrl: options.tmsUrl,
                references,
                ogcReferences
            }));
        }
        // custom or static tile provider
        return data.records.map(record => {
            return {
                serviceType: 'tms',
                layerType: 'tileprovider',
                isValid: !!record.provider,
                title: record.title || record.provider,
                url: record.url,
                attribution: record.attribution,
                options: record.options,
                provider: record.provider, // "ProviderName.VariantName"
                references: []
            };
        });
    }
    return null;
};

/**
 * tmsToLayer convert Catalog record into a TMS layer for MapStore.
 * @param {object} record the catalog record
 * @param object TileMapService a JSON representation of TileMapService resource, see https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification
 * @param service the original catalog service
 */
export const tmsToLayer = ({ tileMapUrl }, { tileMap, service }) => {
    const { TileMap = {} } = tileMap || {};
    const { forceDefaultTileGrid } = service || {};
    const { Title, Abstract, SRS, BoundingBox = {}, Origin, TileFormat = {}, TileSets } = TileMap;
    const { version, tilemapservice } = TileMap.$;
    const { minx, miny, maxx, maxy } = get(BoundingBox, '$', {});
    const {x, y} = get(Origin, "$");
    const { width: tileWidth, height: tileHeight, "mime-type": format, extension} = get(TileFormat, "$", {});
    const tileSize = [parseFloat(tileWidth), parseFloat(tileHeight, 10)];
    const tileSets = castArray(get(TileSets, "TileSet", []).map(({ $ }) => $)).map(({ href, order, "units-per-pixel": resolution}) => ({
        href: cleanAuthParamsFromURL(href),
        order: parseFloat(order),
        resolution: parseFloat(resolution)
    }));
    const profile = get(TileSets, "profile");
    return {
        title: Title,
        visibility: true,
        hideErrors: true, // TMS can rise a lot of errors of tile not found
        name: Title,
        allowedSRS: {[SRS]: true},
        description: Abstract,
        srs: SRS,
        version,
        tileMapService: tilemapservice ? cleanAuthParamsFromURL(tilemapservice) : undefined,
        type: 'tms',
        profile,
        tileMapUrl,
        // option to force to use the TileGrid of the projection, instead of the one provided by the service. Userful for some GeoServer instances that use default GridSet but provide wrong origin and resolution
        forceDefaultTileGrid,
        bbox: BoundingBox && {crs: SRS, bounds: {minx: parseFloat(minx), miny: parseFloat(miny), maxx: parseFloat(maxx), maxy: parseFloat(maxy)}},
        tileSets,
        origin: {x: parseFloat(x), y: parseFloat(y)},
        format,
        tileSize,
        extension
    };
};

/**
 * Converts a record into a layer
 */
export const tileProviderToLayer = (record) => {
    return {
        type: "tileprovider",
        visibility: true,
        url: record.url,
        title: record.title,
        attribution: record.attribution,
        options: record.options,
        provider: record.provider, // "ProviderName.VariantName"
        name: record.provider
    };
};

const recordToLayer = (record, options) => {
    if (record.layerType === 'tms') {
        return tmsToLayer(record, options);
    }
    if (record.layerType === 'tileprovider') {
        return tileProviderToLayer(record, options);
    }
    return null;
};

export const getLayerFromRecord = (record, options, asPromise) => {
    if (asPromise) {
        if (record.layerType === 'tms') {
            return getTileMap(record.tileMapUrl, options)
                .then((tileMap) => {
                    return tmsToLayer(record, {
                        ...options,
                        tileMap
                    });
                });
        }
        return Promise.resolve(tileProviderToLayer(record));
    }
    return recordToLayer(record, options);
};
