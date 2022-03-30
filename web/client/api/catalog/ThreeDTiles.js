/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { isValidURLTemplate } from '../../utils/URLUtils';
import { preprocess as commonPreprocess } from './common';
import { getRecords } from '../ThreeDTiles';

function validateUrl(serviceUrl) {
    if (isValidURLTemplate(serviceUrl)) {
        const parts = serviceUrl.split(/\./g);
        // from spec: Tileset files use the .json extension and the application/json MIME type.
        return parts[parts.length - 1] === 'json'
            ? true
            : false;
    }
    return false;
}

const recordToLayer = (record) => {
    const { bbox, format, properties } = record;
    return {
        type: '3dtiles',
        url: record.url,
        title: record.title,
        visibility: true,
        ...(bbox && { bbox }),
        ...(format && { format }),
        ...(properties && { properties })
    };
};

export const preprocess = commonPreprocess;
export const testService = (service) => Observable.of(service);
export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);
export const getCatalogRecords = (response) => {
    return response?.records
        ? response.records.map(record => {
            const { version, bbox, format, properties } = record;
            return {
                serviceType: '3dtiles',
                isValid: true,
                description: `v. ${version}`,
                title: record.title,
                identifier: record.url,
                url: record.url,
                thumbnail: null,
                ...(bbox && { bbox }),
                ...(format && { format }),
                ...(properties && { properties }),
                references: []
            };
        })
        : null;
};
export const getLayerFromRecord = (record, options, asPromise) => {
    const layer = recordToLayer(record, options);
    return asPromise ? Promise.resolve(layer) : layer;
};
export const validate = (service) => {
    if (service.title && validateUrl(service.url)) {
        return Observable.of(service);
    }
    const error = new Error("catalog.config.notValidURLTemplate");
    // insert valid URL;
    throw error;
};
