/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import axios from '../../libs/ajax';
import { isValidURLTemplate } from '../../utils/URLUtils';
import { convertRadianToDegrees } from '../../utils/CoordinatesUtils';
import { preprocess as commonPreprocess } from './common';

function regionToBoundingBox(region) {
    if (!region) {
        return null;
    }
    // Latitudes and longitudes are in the WGS 84 datum as defined in EPSG 4979 and are in radians
    // region [west, south, east, north, minimum height, maximum height]
    const [west, south, east, north] = region;

    return {
        extent: [
            convertRadianToDegrees(west),
            convertRadianToDegrees(south),
            convertRadianToDegrees(east),
            convertRadianToDegrees(north)
        ],
        crs: 'EPSG:4326'
    };
}

function getTitleFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}

const searchAndPaginate = (tileset, { url, text, info }) => {
    const records = [{
        // current specification does not define the title location
        // but there is works related to the metadata in the next version of 3d tiles
        // for the moment we set the name assigned to catalog service
        // or we can extract the title from the url
        title: info?.options?.service?.title || getTitleFromUrl(url),
        url: url,
        type: '3dtiles',
        tileset
    }].filter(({ title }) => !text || title?.toLowerCase().includes(text?.toLowerCase() || ''));
    return {
        numberOfRecordsMatched: records.length,
        numberOfRecordsReturned: records.length,
        records
    };
};

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
    return {
        type: '3dtiles',
        url: record.url,
        title: record.title,
        visibility: true,
        ...(record.boundingBox && {
            bbox: {
                crs: record.boundingBox.crs,
                bounds: {
                    minx: record.boundingBox.extent[0],
                    miny: record.boundingBox.extent[1],
                    maxx: record.boundingBox.extent[2],
                    maxy: record.boundingBox.extent[3]
                }
            }
        })
    };
};

const getRecords = (url, startPosition, maxRecords, text, info) => {
    return axios.get(url)
        .then(({ data }) => {
            return searchAndPaginate(data, { startPosition, maxRecords, text, info, url });
        });
};

export const preprocess = commonPreprocess;
export const testService = (service) => Observable.of(service);
export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);
export const getCatalogRecords = (response) => {
    return response?.records
        ? response.records.map(record => {
            const version = record?.tileset?.assets?.version !== undefined ? record?.tileset?.assets?.version : '1.0'; // currently only 1.0
            const boundingBox = regionToBoundingBox(record?.tileset?.root?.boundingVolume?.region);
            return {
                serviceType: '3dtiles',
                isValid: true,
                description: `v. ${version}`,
                title: record.title,
                identifier: record.url,
                url: record.url,
                thumbnail: null,
                ...(boundingBox && { boundingBox }),
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
