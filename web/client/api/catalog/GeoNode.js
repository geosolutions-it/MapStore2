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
import {
    preprocess as commonPreprocess,
    validate as commonValidate,
    testService as commonTestService
} from './common';

export const GEONODE_KEYWORDS_FILTER = 'filter{keywords.slug.in}';
export const GEONODE_CATEGORY_FILTER = 'filter{category.identifier.in}';
export { GEONODE_RESOURCE_TYPE_FILTER } from '../GeoNode';

export const preprocess = commonPreprocess;
export const validate = commonValidate;
export const testService = commonTestService({ parseUrl: serviceUrl => serviceUrl });

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
        },
        filterFormFields: [
            { id: 'category', type: 'select', order: 5, facet: 'category', label: 'Category', key: 'filter{category.identifier.in}' },
            { id: 'keyword', type: 'select', order: 6, facet: 'keyword', label: 'Keyword', key: 'filter{keywords.slug.in}' },
            { id: 'region', type: 'select', order: 7, facet: 'place', label: 'Region', key: 'filter{regions.code.in}' },
            { type: 'date-range', filterKey: 'date', labelId: 'resourcesCatalog.creationFilter' },
            { labelId: 'Extent Filter', type: 'extent' }
        ]
    };
};

