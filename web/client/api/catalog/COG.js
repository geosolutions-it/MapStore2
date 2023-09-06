/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import get from 'lodash/get';
import { Observable } from 'rxjs';
import { isValidURL } from '../../utils/URLUtils';

export const COG_LAYER_TYPE = 'cog';
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
export const getRecords = (url, startPosition, maxRecords, text, info = {}) => {
    const service = get(info, 'options.service');
    let layers = [];
    if (service.url) {
        const urls = service.url?.split(',')?.map(_url => _url?.trim());
        // each url corresponds to a layer
        layers = urls.map((_url, index) => {
            const title = _url.split('/')?.pop()?.replace('.tif', '') || `COG_${index}`;
            return {
                ...service,
                title,
                type: COG_LAYER_TYPE,
                url: _url,
                options: service.options || {}
            };
        });
    }
    // fake request with generated layers
    return new Promise((resolve) => {
        resolve(searchAndPaginate(layers, startPosition, maxRecords, text));
    });


};

export const textSearch = (url, startPosition, maxRecords, text, info = {}) => {
    return getRecords(url, startPosition, maxRecords, text, info);
};

const validateCog = (service) => {
    const urls = service.url?.split(',');
    const isValid = urls.every(url => isValidURL(url?.trim()));
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
                serviceType: COG_LAYER_TYPE,
                isValid: isValidURL(record.url),
                title: record.title || record.provider,
                url: record.url,
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
        type: COG_LAYER_TYPE,
        visibility: true,
        url: record.url,
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
