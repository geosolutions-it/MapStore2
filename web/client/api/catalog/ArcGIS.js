/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../../libs/ajax';
import { Observable } from 'rxjs';
import { isValidURLTemplate } from '../../utils/URLUtils';
import { preprocess as commonPreprocess } from './common';
import { getCapabilities } from '../ArcGIS';

function validateUrl(serviceUrl) {
    /* if (isValidURLTemplate(serviceUrl)) {
        return true;
    }*/
    return true;
}

const recordToLayer = (record) => {
    if (!record) {
        return null;
    }
    return {
        type: 'arcgis',
        url: record.url,
        name: record.name,
        title: record.title,
        visibility: true
    };
};

const getRecords = (url, startPosition, maxRecords, text, info) => {
    return getCapabilities(url);
};

export const preprocess = commonPreprocess;
export const testService = (service) => Observable.of(service);
export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);
export const getCatalogRecords = (response) => {
    return response?.records
        ? response.records.map(record => {
            console.log(record)
            // const { version, bbox, format, properties } = record;
            const identifier = `${record.id}:${record.name}`;
            return {
                serviceType: 'arcgis',
                isValid: true,
                description: record.description,
                title: record.name,
                identifier,
                url: record.url,
                thumbnail: null,
                // ...(bbox && { bbox }),
                // ...(format && { format }),
                // ...(properties && { properties }),
                references: [],
                name: record.id
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
