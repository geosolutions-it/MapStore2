/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { Observable } from 'rxjs';


import { isValidURL } from '../../utils/URLUtils';
import ConfigUtils from '../../utils/ConfigUtils';
import LayerUtils from '../../utils/cog/LayerUtils';
import { COG_LAYER_TYPE } from '../../utils/CatalogUtils';

const searchAndPaginate = (layers, startPosition, maxRecords, text) => {
    const filteredLayers = layers
        .filter(({ title = "" } = {}) => !text
            || title.toLowerCase().indexOf(text.toLowerCase()) !== -1
        );
    const records = filteredLayers
        .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: records.length,
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        records
    };
};

let capabilitiesCache = {};
export const getRecords = (_url, startPosition, maxRecords, text, info = {}) => {
    const service = get(info, 'options.service');
    const controller = get(info, 'options.controller');
    let layers = [];
    if (service.records) {
        // each record/url corresponds to a layer
        layers = service.records?.map((record) => {
            const url = record.url;
            let layer = {
                ...record,
                title: record.title,
                type: record.type ?? COG_LAYER_TYPE,
                sources: record.sources ?? [{url}],
                options: record.options ?? (service.options || {})
            };
            const isSave = get(info, 'options.save', false);
            const cached = capabilitiesCache[url];
            if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
                return {...cached.data};
            }
            // Fetch metadata only on saving the service (skip on search)
            if ((isNil(service.fetchMetadata) || service.fetchMetadata) && isSave) {
                return LayerUtils.getLayerConfig({url, controller, layer})
                    .then(updatedLayer => {
                        capabilitiesCache[url] = {
                            timestamp: new Date().getTime(),
                            data: {...updatedLayer}
                        };
                        return updatedLayer;
                    })
                    .catch(() => ({...layer}));
            }
            return Promise.resolve(layer);
        });
    }
    return Promise.all([...layers]).then((_layers) => {
        if (!_layers.length) {
            const filename = _url.split('/').pop().split('.')[0];
            let layer = {
                ...service,
                title: text || filename,
                identifier: _url,
                type: COG_LAYER_TYPE,
                sources: [{url: _url}],
                options: service.options || {}
            };
            return LayerUtils.getLayerConfig({url: _url, layer, controller})
                .then(lyr => {
                    const records = [lyr];
                    return {
                        numberOfRecordsMatched: 1,
                        numberOfRecordsReturned: 1,
                        records
                    };
                }).catch(() => ({...layer}));
        }
        return searchAndPaginate(_layers, startPosition, maxRecords, text);
    });
};

export const textSearch = (url, startPosition, maxRecords, text, info = {}) => {
    return getRecords(url, startPosition, maxRecords, text, info);
};

const validateCog = (service) => {
    const isValid = service.records?.every(record => isValidURL(record?.url));
    if (service.title && isValid) {
        return Observable.of(service);
    }
    const error = new Error("catalog.config.notValidURLTemplate");
    // insert valid URL;
    throw error;
};
export const validate = service => {
    return validateCog(service);
};
export const testService = service => {
    return Observable.of(service);
};

export const getCatalogRecords = (data) => {
    if (data && data.records) {
        return data.records.map(record => {
            return {
                ...record,
                serviceType: COG_LAYER_TYPE,
                isValid: record.sources?.every(source => isValidURL(source.url)),
                title: record.title || record.provider,
                sources: record.sources,
                options: record.options,
                references: []
            };
        });
    }
    return null;
};

/**
 * Converts a record into a layer
 */
export const cogToLayer = (record) => {
    return {
        ...record,
        type: COG_LAYER_TYPE,
        visibility: true,
        sources: record.sources,
        title: record.title,
        options: record.options,
        name: record.title
    };
};

const recordToLayer = (record, options) => {
    return cogToLayer(record, options);
};

export const getLayerFromRecord = (record, options, asPromise) => {
    if (asPromise) {
        return Promise.resolve(recordToLayer(record, options));
    }
    return recordToLayer(record, options);
};
