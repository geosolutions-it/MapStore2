/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';
import { isValidURL } from '../../utils/URLUtils';
import { preprocess as commonPreprocess } from './common';
import { getCapabilities } from '../ArcGIS';
import { isFeatureServerUrl } from '../../utils/ArcGISUtils';

function validateUrl(serviceUrl) {
    if (isValidURL(serviceUrl)) {
        return serviceUrl.includes('rest/services');
    }
    return false;
}

const recordToLayer = (record, { layerBaseConfig }) => {
    if (!record) {
        return null;
    }
    const isFeatureServer = isFeatureServerUrl(record.url);
    return {
        type: isFeatureServer ? 'arcgis-feature' : 'arcgis',
        url: record.url,
        title: record.title,
        format: record.format,
        queryable: record.queryable,
        visibility: true,
        ...(record.name !== undefined && {
            name: `${record.name}`
        }),
        ...(record.bbox && {
            bbox: record.bbox
        }),
        ...(isFeatureServer
            ? {
                ...(record.geometryType && { geometryType: record.geometryType }),
                ...(record.maxRecordCount && { maxRecordCount: record.maxRecordCount }),
                ...(record.fields && { fields: record.fields }),
                strategy: 'tile'
            }
            : {
                options: {
                    layers: record.layers
                }
            }
        ),
        ...layerBaseConfig
    };
};

const getRecords = (url, startPosition, maxRecords, text, info) => {
    return getCapabilities(url, startPosition, maxRecords, text, info);
};

export const preprocess = commonPreprocess;
export const testService = (service) => Observable.of(service);
export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);
export const getCatalogRecords = (response) => {
    return response?.records
        ? response.records.map(record => {
            const identifier = `${record.id !== undefined ? `Layer:${record.id}` : 'Group'}:${record.name}`;
            return {
                serviceType: 'arcgis',
                isValid: true,
                description: record.description,
                title: record.name,
                identifier,
                url: record.url,
                thumbnail: record.thumbnail ?? null,
                references: [],
                name: record.id,
                format: record.format,
                layers: record.layers,
                queryable: record.queryable,
                bbox: record.bbox,
                ...(record.geometryType && { geometryType: record.geometryType }),
                ...(record.maxRecordCount && { maxRecordCount: record.maxRecordCount })
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
