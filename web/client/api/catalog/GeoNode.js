/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { v4 as uuid } from 'uuid';
import isEmpty from 'lodash/isEmpty';
import turfCenter from '@turf/center';
import { textSearch as geonodeTextSearch, getDatasetByPk, getResourceByPk, getDocumentByPk } from '../GeoNode';
import { getLayerTitleTranslations } from '../../utils/LayersUtils';
import { getMessageById } from '../../utils/LocaleUtils';
import {
    resourceToLayerConfig,
    isDefaultDatasetSubtype,
    getTagConfig,
    ResourceTypes,
    GEONODE_DOCUMENTS_ROW_VIEWER
} from '../../utils/GeoNodeUtils';
import { getPolygonFromExtent } from '../../utils/CoordinatesUtils';
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
                icon: record.resource_type === ResourceTypes.DOCUMENT ? { glyph: 'document' } : undefined,
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

const calculateBbox = (coordinates) => {
    const validCoords = (coordinates || []).filter(coord => coord && coord.length === 2);
    if (validCoords.length === 0) {
        return null;
    }
    const lons = validCoords.map(coord => coord[0]);
    const lats = validCoords.map(coord => coord[1]);
    return {
        bounds: {
            minx: Math.min(...lons),
            miny: Math.min(...lats),
            maxx: Math.max(...lons),
            maxy: Math.max(...lats)
        },
        crs: 'EPSG:4326'
    };
};

const documentMarkerSymbolizer = (glyph) => [{
    kind: 'Icon',
    size: 46,
    image: { args: [{ color: 'blue', glyph, shape: 'circle' }], name: 'msMarkerIcon' },
    anchor: 'bottom',
    rotate: 0,
    opacity: 1,
    symbolizerId: '01',
    msBringToFront: false,
    msHeightReference: 'none'
}];

const DOCUMENTS_STYLE = {
    format: 'geostyler',
    metadata: { editorType: 'visual' },
    body: {
        rules: [
            { name: 'Videos', ruleId: '01', mandatory: false, filter: ['&&', ['==', 'subtype', 'video']], symbolizers: documentMarkerSymbolizer('video-camera') },
            { name: 'Images', ruleId: '02', mandatory: false, filter: ['&&', ['==', 'subtype', 'image']], symbolizers: documentMarkerSymbolizer('camera') },
            { name: 'Files', ruleId: '03', mandatory: false, filter: ['&&', ['!=', 'subtype', 'image'], ['!=', 'subtype', 'video']], symbolizers: documentMarkerSymbolizer('file') }
        ]
    }
};

/**
 * Build a single MapStore vector layer that collects the given GeoNode documents
 * as point features (located at the center of each document extent). Documents
 * without an extent are skipped.
 */
export const documentsToLayerConfig = (documents = [], options = {}) => {
    const baseURL = options?.service?.url;
    const locales = options?.locales;
    // resilient per document: a failed fetch is skipped, not fatal to the whole layer
    return Promise.all(documents.map(doc => getDocumentByPk(baseURL, doc.pk).catch(() => null)))
        .then((fullDocs) => {
            const features = fullDocs
                .map((doc) => {
                    const extent = doc?.extent?.coords;
                    const polygon = !isEmpty(extent) ? getPolygonFromExtent(extent) : null;
                    const center = polygon ? turfCenter(polygon) : null;
                    if (!center) {
                        return null;
                    }
                    return {
                        type: 'Feature',
                        properties: doc,
                        geometry: {
                            type: 'Point',
                            coordinates: center.geometry.coordinates
                        },
                        id: doc.pk
                    };
                })
                .filter(Boolean);
            const bbox = calculateBbox(features.map(feature => feature.geometry.coordinates));
            return {
                id: uuid(),
                type: 'vector',
                visibility: true,
                name: 'Documents',
                title: getMessageById(locales, 'catalog.resourceTypes.document'),
                ...(bbox && { bbox }),
                features,
                style: DOCUMENTS_STYLE,
                rowViewer: GEONODE_DOCUMENTS_ROW_VIEWER
            };
        });
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
    const documents = records.filter(record => record.resource_type === ResourceTypes.DOCUMENT);
    const others = records.filter(record => record.resource_type !== ResourceTypes.DOCUMENT);
    const otherLayersPromise = Promise.all(
        // resilient per record: a failed conversion is skipped, not fatal to the batch
        others.map(record => getLayerFromRecord(record, options, true).then(applySecurity).catch(() => null))
    );
    const documentsLayerPromise = documents.length
        ? documentsToLayerConfig(documents, { ...options, locales }).catch(() => null)
        : Promise.resolve(null);
    return Promise.all([otherLayersPromise, documentsLayerPromise])
        .then(([otherLayers, documentsLayer]) => ({
            layers: [...otherLayers, documentsLayer].filter(Boolean),
            groups: []
        }));
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

