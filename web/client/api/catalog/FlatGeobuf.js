/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { isValidURL } from '../../utils/URLUtils';

import { preprocess as commonPreprocess } from './common';

import {
    FGB,
    FGB_LAYER_TYPE,
    getCapabilities
} from '../FlatGeobuf';

// copy from ThreeDTiles.js
const getRecords = (url) => {
    return getCapabilities(url)
        .then(({ ...properties }) => {
            const records = [{
                ...properties,
                visibility: true,
                type: FGB_LAYER_TYPE,
                url
            }];
            return {
                numberOfRecordsMatched: records.length,
                numberOfRecordsReturned: records.length,
                records
            };
        });
};

function validateUrl(serviceUrl) {
    if (isValidURL(serviceUrl)) {
        const parts = serviceUrl.split(/\./g);
        // remove query params
        const ext = (parts[parts.length - 1] || '').split(/\?/g)[0];
        return ext === FGB;
    }
    return false;
}


/**
 * Converts a FGB record into a layerNode
 * maybe export as util method
 */
const recordToLayer = (record) => {
    if (!record) {
        return null;
    }
    const { format, properties } = record;
    return {
        type: FGB_LAYER_TYPE,
        url: record.url,
        title: record.title,
        visibility: true,
        ...(format && { format }),
        ...(properties && { properties })
    };
};

export const preprocess = commonPreprocess;
export const validate = (service) => {
    if (service.title && validateUrl(service.url)) {
        return Observable.of(service);
    }
    throw new Error("catalog.config.notValidURLTemplate");
};
export const testService = (service) => Observable.of(service);

export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);

export const getCatalogRecords = (response) => {
    return response?.records
        ? response.records.map(record => {
            const { format } = record;
            const identifier = (record.url || '').split('?')[0];
            return {
                serviceType: FGB_LAYER_TYPE,
                isValid: true,
                title: record.title,
                identifier,
                url: record.url,
                // ...(bbox && { bbox }), //DONT PASS bbox otherwise viewport will set a fixed bbox to the layer
                ...(format && { format }),
                references: []
            };
        })
        : null;
};

export const getLayerFromRecord = (record, options, asPromise) => {
    if (asPromise) {
        return Promise.resolve(recordToLayer(record, options));
    }
    return recordToLayer(record, options);
};
