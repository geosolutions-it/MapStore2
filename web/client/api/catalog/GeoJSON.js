/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { cloneDeep, pick } from 'lodash';
import { hint } from '@mapbox/geojsonhint/lib/object';
import {
    preprocess as commonPreprocess,
    ServiceValidationError
} from './common';
import axios from '../../libs/ajax';

import { geoJSONToLayer } from '../../utils/LayersUtils';
import { isValidURL } from '../../utils/URLUtils';

const isValidGeoJSON = (data) => {
    try {
        return !!data && typeof data === 'object'
            // geojsonhint also reports advisory messages for valid GeometryCollections.
            && hint(data).every(({ level, message }) => level === 'message' || message.startsWith('GeometryCollection '));
    } catch (e) {
        return false;
    }
};

export const preprocess = commonPreprocess;
export const validate = (service) => service.title?.trim() && isValidURL(service.url)
    ? Observable.of(service)
    : Observable.throw(new ServiceValidationError('Validation Error', 'catalog.notification.warningAddCatalogService'));
export const testService = (service) => Observable.of(service);
export const textSearch = (url, startPosition, maxRecords, text, { options } = {}) => {
    return axios.get(url).then(({data}) => {
        if (!isValidGeoJSON(data)) {
            throw Object.assign(new Error('Invalid GeoJSON'), { error: 'catalog.notification.invalidGeoJSON' });
        }
        const title = options?.service?.title || text || data.title || data.name || url;
        const records = [{
            ...data,
            title,
            url,
            name: title
        }];
        return {
            numberOfRecordsMatched: records.length,
            numberOfRecordsReturned: records.length,
            records: records
        };
    });
};

export const getCatalogRecords = (result, options) => {
    if (result && result.records) {
        return result.records.map(record => ({
            ...record,
            serviceType: 'geojson',
            isValid: true,
            identifier: (record.url || '').split('?')[0],
            layerOptions: {
                ...options?.layerOptions,
                ...record.layerOptions
            }
        }));
    }
    return null;
};

export const getLayerFromRecord = (record, options, asPromise) => {
    let layer = null;
    if (record) {
        // Normalize single features and geometries so feature properties are preserved.
        const geoJSON = record.type === 'FeatureCollection' ? record : {
            type: 'FeatureCollection',
            features: [record.type === 'Feature' ? record : {
                type: 'Feature',
                properties: {},
                geometry: pick(record, ['type', 'coordinates', 'geometries', 'bbox'])
            }]
        };
        layer = {
            ...geoJSONToLayer(cloneDeep(geoJSON)),
            title: record.title,
            name: record.name || record.title,
            ...options?.layerBaseConfig,
            ...options?.service?.layerOptions,
            ...record.layerOptions
        };
    }
    return asPromise ? Promise.resolve(layer) : layer;
};
