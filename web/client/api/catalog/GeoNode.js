/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { textSearch as geonodeTextSearch, getDatasetByPk, getResourceByPk } from '../GeoNode';
import { getLayerTitleTranslations } from '../../utils/LayersUtils';
import { resourceToLayerConfig, isDefaultDatasetSubtype } from '../../utils/GeoNodeUtils';

export const textSearch = geonodeTextSearch;

export const fetchResourceByPk = ({ baseURL, record }) => {
    const fetchByPk = isDefaultDatasetSubtype(record?.subtype) ? getDatasetByPk : getResourceByPk;
    return fetchByPk(baseURL, record.pk);
};

export const getCatalogRecords = (records) => {
    if (records && records.records) {
        return records.records.map((record) => {
            return {
                serviceType: "geonode",
                title: getLayerTitleTranslations(record) || record.title,
                description: record.description,
                thumbnail_url: record.thumbnail_url,
                tags: record.keywords,
                creator: record.owner?.username,
                identifier: record?.pk, //  uuid
                isValid: true,
                ...record
            };
        });
    }
    return null;
};

export const getLayerFromRecord = (record, options, asPromise = false) => {
    const layer = resourceToLayerConfig(record, options);
    if (!asPromise) {
        return layer;
    }
    const baseURL = options?.service?.url;
    if (!baseURL || !record?.pk) {
        return Promise.resolve(layer);
    }
    return fetchResourceByPk({ baseURL, record })
        .then((resource) => resourceToLayerConfig({ ...record, ...resource }, options));
};

export const getCapabilities = () => {
    return {
        filterSupport: true,
        orderBySupport: true
    };
};

