/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { textSearch as geonodeTextSearch, getDatasetByPk, getResourceByPk, getDocumentByPk, getMapByPk } from '../GeoNode';
import { getLayerTitleTranslations } from '../../utils/LayersUtils';
import {
    resourceToLayerConfig,
    isDefaultDatasetSubtype,
    getTagConfig,
    documentsToLayerConfig,
    resourceMapToLayerGroup,
    ResourceTypes
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

const getTagLabel = (tag, tagFilterType) => {
    if (!tag || typeof tag !== 'object') {
        return tag;
    }
    if (tagFilterType === 'category') {
        return tag.label || tag.gn_description || tag.identifier;
    }
    if (tagFilterType === 'keyword') {
        return tag.label || tag.name || tag.slug;
    }
    return tag.label || tag.name || tag.gn_description || tag.identifier || tag.slug;
};

const normalizeTag = (tag, tagFilterType) => {
    if (!tag || typeof tag !== 'object') {
        return tag;
    }
    const label = getTagLabel(tag, tagFilterType);
    return label ? { ...tag, label } : tag;
};

export const getCatalogRecords = (records, options) => {
    if (records && records.records) {
        const tagFilterType = resolveTagFilterType(options?.service);
        return records.records.map((record) => {
            const tags = (tagFilterType === 'keyword'
                ? (record.keywords || [])
                : (record.category ? [record.category] : []))
                .map((tag) => normalizeTag(tag, tagFilterType));
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
                icon: record.resource_type === ResourceTypes.DOCUMENT
                    ? { glyph: 'document' }
                    : record.resource_type === ResourceTypes.MAP
                        ? { glyph: '1-map' }
                        : undefined,
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

/**
 * Process the whole selected record set into map content (N records -> M layers).
 * GeoNode documents collapse into a single vector layer; every other record type
 * is converted through getLayerFromRecord. Always resolves with `{ layers, groups }`.
 */
export const processRecords = (records = [], options = {}, locales) => {
    const protectedId = options?.service?.protectedId;
    const applySecurity = (layer) => layer && protectedId
        ? { ...layer, security: { type: 'basic', sourceId: protectedId } }
        : layer;

    const others = records.filter(record => ![ResourceTypes.DOCUMENT, ResourceTypes.MAP].includes(record.resource_type));
    const documents = records.filter(record => record.resource_type === ResourceTypes.DOCUMENT);
    const maps = records.filter(record => record.resource_type === ResourceTypes.MAP);

    const otherLayersPromise = Promise.all(
        // resilient per record: a failed conversion is skipped, not fatal to the batch
        others.map(record => getLayerFromRecord(record, options, true).then(applySecurity).catch(() => null))
    );
    const documentsLayerPromise = documents.length
        ? Promise.all(
            documents.map(doc => getDocumentByPk(options?.service?.url, doc.pk).catch(() => null))
        )
            .then((docs) => documentsToLayerConfig(docs, locales))
            .catch(() => null)
        : Promise.resolve(null);

    const mapContentsPromise = Promise.all(
        maps.map(record => getMapByPk(options?.service?.url, record.pk)
            .then((mapResource) => resourceMapToLayerGroup(mapResource))
            .catch(() => null))
    );
    return Promise.all([
        otherLayersPromise,
        documentsLayerPromise,
        mapContentsPromise
    ])
        .then(([otherLayers, documentsLayer, mapContents]) => {
            const validMapContents = mapContents.filter(Boolean);
            return {
                layers: [
                    ...otherLayers,
                    documentsLayer,
                    ...validMapContents.flatMap(content => content.layers.map(applySecurity))
                ].filter(Boolean),
                groups: validMapContents.flatMap(content => content.groups)
            };
        });
};

export const getCapabilities = ({ service } = {}) => {

    const subtypes = [
        ...(service?.resourceTypes?.includes('dataset') ? [
            'vector',
            'raster',
            'vector_time',
            '3dtiles',
            'tabular'
        ] : []),
        ...(service?.resourceTypes?.includes('document') ? [
            'image',
            'video',
            'audio',
            'text',
            'archive',
            'presentation'
        ] : [])
    ];
    return {
        filterSupport: true,
        orderBySupport: true,
        getTagFilterKey: (_service) => {
            const tagFilterType = resolveTagFilterType(_service);
            return getTagConfig(tagFilterType).filterKey;
        },
        filterFormFields: [
            ...(subtypes?.length ? [{
                id: 'subtype',
                labelId: 'catalog.subtypes.label',
                type: 'select',
                order: 4,
                options: subtypes.map((value) => ({ value, labelId: `catalog.subtypes.${value}` }))
            }] : []),
            { id: 'category', type: 'select', order: 5, facet: 'category', labelId: 'catalog.filterFields.category', key: 'filter{category.identifier.in}' },
            { id: 'keyword', type: 'select', order: 6, facet: 'keyword', labelId: 'catalog.filterFields.keyword', key: 'filter{keywords.slug.in}' },
            { id: 'region', type: 'select', order: 7, facet: 'place', labelId: 'catalog.filterFields.region', key: 'filter{regions.code.in}' },
            { type: 'date-range', filterKey: 'date', labelId: 'resourcesCatalog.creationFilter' },
            { labelId: 'catalog.filterFields.extent', type: 'extent' }
        ]
    };
};

