/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { textSearch as geonodeTextSearch, getDatasetByPk, getResourceByPk } from '../GeoNode';
import { getLayerTitleTranslations } from '../../utils/LayersUtils';
import {
    resourceToLayerConfig,
    isDefaultDatasetSubtype,
    getTagConfig
} from '../../utils/GeoNodeUtils';
import { getConfigProp } from '../../utils/ConfigUtils';

export const GEONODE_KEYWORDS_FILTER = 'filter{keywords.slug.in}';
export const GEONODE_CATEGORY_FILTER = 'filter{category.identifier.in}';
export const GEONODE_RESOURCE_TYPE_FILTER = 'filter{resource_type.in}';

export const textSearch = geonodeTextSearch;

export const getGeoNodeDefaultTagFilterType = () => {
    const initialState = getConfigProp('initialState') || {};
    return initialState?.defaultState?.catalog?.default?.tagFilterType
        ?? 'category';
};

export const fetchResourceByPk = ({ baseURL, record }) => {
    const fetchByPk = isDefaultDatasetSubtype(record?.subtype) ? getDatasetByPk : getResourceByPk;
    return fetchByPk(baseURL, record.pk);
};

/**
 * Resolve the effective tagFilterType for a GeoNode service.
 * Priority: service setting > initialState.defaultState.catalog.default.tagFilterType > 'category'
*/
export const resolveTagFilterType = (service) => {
    if (service?.tagFilterType) {
        return service.tagFilterType;
    }
    return getGeoNodeDefaultTagFilterType();
};

export const getCatalogRecords = (records, options) => {
    if (records && records.records) {
        const tagFilterType = resolveTagFilterType(options?.service);
        return records.records.map((record) => {
            const tags = tagFilterType === 'keyword'
                ? (record.keywords || [])
                : (record.category ? [record.category] : []);
            return {
                ...record,
                serviceType: "geonode",
                title: getLayerTitleTranslations(record) || record.title,
                description: record.description,
                thumbnail_url: record.thumbnail_url,
                tags,
                tagFilterType,
                creator: record.owner?.username,
                identifier: record?.pk,
                isValid: true
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
        orderBySupport: true,
        getTagFilterKey: (service) => {
            const tagFilterType = resolveTagFilterType(service);
            return getTagConfig(tagFilterType).filterKey;
        }
    };
};

