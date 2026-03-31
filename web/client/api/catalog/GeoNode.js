/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { textSearch as geonodeTextSearch } from '../GeoNode';
// import { getLayerFromRecord as wmsGetLayerFromRecord } from './WMS';
import { getLayerTitleTranslations } from '../../utils/LayersUtils';
import { resourceToLayerConfig } from '../../utils/GeoNodeUtils';

export const textSearch = geonodeTextSearch;
export const getCatalogRecords = (records) => {
    if (records && records.records) {
        return records.records.map((record) => {
            return {
                serviceType: "geonode",
                title: getLayerTitleTranslations(record) || record.title,
                description: record.description,
                identifier: record.alternate,
                thumbnail_url: record.thumbnail_url,
                tags: record.keywords,
                creator: record.owner?.username,
                ...record
            };
        });
    }
    return null;
};

export const getLayerFromRecord = (record, options, asPromise) => {
    const layer = resourceToLayerConfig(record, options);
    return asPromise ? Promise.resolve(layer) : layer;
};

export const getCapabilities = () => {
    return {
        filterSupport: true,
        orderBySupport: true
    };
};

