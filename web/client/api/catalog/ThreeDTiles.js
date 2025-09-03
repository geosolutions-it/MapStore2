/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { isValidURL } from '../../utils/URLUtils';
import { preprocess as commonPreprocess } from './common';
import { getCapabilities } from '../ThreeDTiles';

function validateUrl(serviceUrl) {
    if (isValidURL(serviceUrl)) {
        const parts = serviceUrl.split(/\./g);
        // remove query params
        const ext = (parts[parts.length - 1] || '').split(/\?/g)[0];
        // from spec: Tileset files use the .json extension and the application/json MIME type.
        return ext === 'json'
            ? true
            : false;
    }
    return false;
}

const recordToLayer = (record) => {
    if (!record) {
        return null;
    }
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

function getTitleFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}

const getRecords = (url, startPosition, maxRecords, text, info) => {
    return getCapabilities(url, info)
        .then(({ tileset, ...properties }) => {
            const records = [{
                // current specification does not define the title location
                // but there is works related to the metadata in the next version of 3d tiles
                // for the moment we set the name assigned to catalog service
                // or we can extract the title from the url
                title: info?.options?.service?.title || getTitleFromUrl(url),
                url: url,
                type: '3dtiles',
                tileset,
                ...properties
            }];
            return {
                numberOfRecordsMatched: records.length,
                numberOfRecordsReturned: records.length,
                records
            };
        });
};

export const preprocess = commonPreprocess;
export const testService = (service) => Observable.of(service);
export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);
export const getCatalogRecords = (response) => {
    return response?.records
        ? response.records.map(record => {
            const { version, bbox, format, properties } = record;
            // remove query from identifier
            const identifier = (record.url || '').split('?')[0];
            return {
                serviceType: '3dtiles',
                isValid: true,
                description: `v. ${version}`,
                title: record.title,
                identifier,
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
