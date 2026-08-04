/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { v4 as uuid } from 'uuid';
import { isEmpty } from 'lodash';
import queryString from 'query-string';
import url from 'url';
import turfCenter from '@turf/center';

import { isImageServerUrl } from './ArcGISUtils';
import { getConfigProp } from './ConfigUtils';
import { getSupportedLocales, shortLocale, getMessageById } from './LocaleUtils';
import { ServerTypes } from './LayersUtils';
import { getPolygonFromExtent } from './CoordinatesUtils';

export const SOURCE_TYPES = {
    LOCAL: 'LOCAL',
    REMOTE: 'REMOTE'
};

export const FEATURE_INFO_FORMAT = 'TEMPLATE';

export const GXP_PTYPES = {
    'AUTO': 'gxp_wmscsource',
    'OWS': 'gxp_wmscsource',
    'WMS': 'gxp_wmscsource',
    'WFS': 'gxp_wmscsource',
    'WCS': 'gxp_wmscsource',
    'REST_MAP': 'gxp_arcrestsource',
    'REST_IMG': 'gxp_arcrestsource',
    'HGL': 'gxp_hglsource',
    'GN_WMS': 'gxp_geonodecataloguesource'
};

export const ResourceTypes = {
    DATASET: 'dataset',
    MAP: 'map',
    DOCUMENT: 'document',
    GEOSTORY: 'geostory',
    DASHBOARD: 'dashboard',
    VIEWER: 'mapviewer'
};

export const GEONODE_KEYWORDS_FILTER = 'filter{keywords.slug.in}';
export const GEONODE_CATEGORY_FILTER = 'filter{category.identifier.in}';
export const GEONODE_DOCUMENTS_ROW_VIEWER = 'GEONODE_DOCUMENTS_ROW_VIEWER';

const DEFAULT_PRESET_KEYS = {
    CATALOGS: 'catalog_list',
    DATASETS: 'dataset_list',
    DOCUMENTS: 'document_list',
    MAPS: 'map_list',
    VIEWER_COMMON: 'viewer_common',
    DATASET: 'dataset_viewer',
    DOCUMENT: 'document_viewer',
    MAP: 'map_viewer',
    MAP_DETAILS: 'map_details'
};

const DEFAULT_REST_API_PRESETS = {
    [DEFAULT_PRESET_KEYS.CATALOGS]: {
        "exclude": ["*"],
        "include": [
            "advertised", "category", "detail_url", "is_approved", "is_copyable", "is_published",
            "keywords", "owner", "perms", "pk", "raw_abstract", "resource_type", "subtype",
            "title", "executions", "thumbnail_url", "created", "favorite"
        ]
    },
    [DEFAULT_PRESET_KEYS.DATASETS]: {
        "exclude": ["*"],
        "include": [
            "advertised", "detail_url", "owner", "perms", "pk", "raw_abstract",
            "resource_type", "subtype", "title", "data", "executions", "thumbnail_url",
            "alternate", "links", "featureinfo_custom_template", "has_time",
            "default_style", "ptype", "extent", "is_approved", "is_published"
        ]
    },
    [DEFAULT_PRESET_KEYS.MAPS]: {
        "exclude": ["*"],
        "include": [
            "advertised", "detail_url", "data", "is_approved", "is_copyable",
            "is_published", "owner", "perms", "pk", "raw_abstract", "resource_type",
            "subtype", "title", "executions", "thumbnail_url"
        ]
    },
    [DEFAULT_PRESET_KEYS.DOCUMENTS]: {
        "exclude": ["*"],
        "include": [
            "pk", "raw_abstract", "resource_type", "subtype", "title", "data",
            "executions", "thumbnail_url", "alternate", "attribution", "href", "extension"
        ]
    },
    [DEFAULT_PRESET_KEYS.VIEWER_COMMON]: {
        "exclude": ["*"],
        "include": [
            "abstract", "advertised", "alternate", "attribution", "category", "created",
            "date", "date_type", "detail_url", "download_urls", "embed_url", "executions",
            "extent", "favorite", "group", "is_approved", "is_copyable", "is_published",
            "keywords", "language", "last_updated", "linked_resources", "links", "owner",
            "perms", "pk", "poc", "raw_abstract", "regions", "resource_type", "sourcetype",
            "subtype", "supplemental_information", "temporal_extent_end", "temporal_extent_start",
            "thumbnail_url", "title", "uuid", "metadata_uploaded_preserve", "featured"
        ]
    },
    [DEFAULT_PRESET_KEYS.MAP_DETAILS]: {
        "include": ["maplayers"]
    },
    [DEFAULT_PRESET_KEYS.MAP]: {
        "include": ["data", "maplayers"]
    },
    [DEFAULT_PRESET_KEYS.DOCUMENT]: {
        "include": ["href", "extension", "ll_bbox_polygon"]
    },
    [DEFAULT_PRESET_KEYS.DATASET]: {
        "include": [
            "featureinfo_custom_template", "dataset_ows_url", "default_style", "ptype",
            "store", "has_time", "attribute_set", "data"
        ]
    }
};

let apiPresets = {};

/**
 * Override API presets from a downstream project.
 * @param {object} presets - key/value pairs, e.g. { CATALOGS: 'catalog_lists' }
 */
export const setApiPreset = (presets) => {
    apiPresets = { ...apiPresets, ...presets };
};

/**
 * Get the current override value for a preset key, or undefined if not overridden.
 * @param {string} key - preset key (e.g. 'CATALOGS', 'VIEWER_COMMON')
 * @returns {string|undefined}
 */
export const getApiPreset = (key) => {
    return apiPresets[key];
};

/**
 * Resolve the query params to send for a given preset key.
 * Uses api_preset override if set, else falls back to DEFAULT_REST_API_PRESETS.
 * @param {string} key - preset key (e.g. 'CATALOGS', 'VIEWER_COMMON')
 * @returns {object} query params to spread into the request
 */
export const resolveApiPresetParams = (key) => {
    const override = getApiPreset(key);
    if (override) {
        return { api_preset: override };
    }
    const defaultName = DEFAULT_PRESET_KEYS[key];
    const fallback = defaultName && DEFAULT_REST_API_PRESETS[defaultName];
    if (!fallback) {
        return {};
    }
    const params = {};
    if (fallback.include) {
        params.include = fallback.include;
    }
    if (fallback.exclude) {
        params.exclude = fallback.exclude;
    }
    return params;
};

/**
 * Params serializer to format include/exclude/sort as bracket arrays.
 * @returns {object} axios config with paramsSerializer
 */
export const paramsSerializer = () => {
    return {
        paramsSerializer: {
            serialize: params => {
                const {include, exclude, sort, ...rest} = params ?? {};
                let queryParams = '';
                if (!isEmpty(include) || !isEmpty(exclude) || !isEmpty(sort)) {
                    queryParams = queryString.stringify({include, exclude, sort}, { arrayFormat: 'bracket'});
                }
                if (!isEmpty(rest)) {
                    queryParams = (isEmpty(queryParams) ? '' : `${queryParams}&`) + queryString.stringify(rest);
                }
                return queryParams;
            }
        }
    };
};

/**
 * Merge resolved preset params for one or more preset keys.
 * When all presets resolve to api_preset strings, combines them into an array.
 * When any preset resolves to include/exclude, merges the arrays.
 * @param {...string} keys - preset keys (e.g. 'VIEWER_COMMON', 'DATASET')
 * @returns {object} merged query params
 */
export const mergePresetParams = (...keys) => {
    const allParams = keys.map(key => resolveApiPresetParams(key));
    const hasApiPreset = allParams.every(p => p.api_preset);
    if (hasApiPreset) {
        return { api_preset: allParams.reduce((acc, p) => acc.concat(p.api_preset), []) };
    }
    const include = allParams.reduce((acc, p) => acc.concat(p.include || []), []);
    const exclude = allParams.reduce((acc, p) => acc.concat(p.exclude || []), []);
    const merged = {};
    if (include.length) merged.include = include;
    if (exclude.length) merged.exclude = exclude;
    return merged;
};

/**
 * Returns the filter key and tag property used for filter values by tagFilterType.
 */
export const getTagConfig = (tagFilterType) => {
    if (tagFilterType === 'keyword') {
        return { filterKey: GEONODE_KEYWORDS_FILTER, filterProp: 'slug' };
    }
    if (tagFilterType === 'category') {
        return { filterKey: GEONODE_CATEGORY_FILTER, filterProp: 'identifier' };
    }
    return { filterKey: GEONODE_KEYWORDS_FILTER, filterProp: 'slug' };
};

export const isDefaultDatasetSubtype = (subtype) => !subtype || ['vector', 'raster', 'remote', 'vector_time'].includes(subtype);

const datasetAttributeSetToFields = ({ attribute_set: attributeSet = [] }) => {
    return attributeSet
        .filter(({ attribute_type: type }) => !type.includes('gml:'))
        .map(({
            attribute,
            attribute_label: alias,
            attribute_type: type
        }) => {
            return {
                name: attribute,
                alias: alias,
                type: type
            };
        });
};

export const getDimensions = ({links, has_time: hasTime} = {}) => {
    const { url: wmsUrl } = links?.find(({ link_type: linkType }) => linkType === 'OGC:WMS') || {};
    const { url: wmtsUrl } = links?.find(({ link_type: linkType }) => linkType === 'OGC:WMTS') || {};
    const dimensions = [
        ...(hasTime ? [{
            name: 'time',
            source: {
                type: 'multidim-extension',
                url: wmtsUrl || (wmsUrl || '').split('/geoserver/')[0] + '/geoserver/gwc/service/wmts'
            }
        }] : [])
    ];
    return dimensions;
};

function getExtentFromResource({ extent }) {
    if (isEmpty(extent?.coords)) {
        return null;
    }
    const [minx, miny, maxx, maxy] = extent.coords;

    const WGS84_MAX_EXTENT = [-180, -90, 180, 90];
    if (minx < WGS84_MAX_EXTENT[0] || miny < WGS84_MAX_EXTENT[1] || maxx > WGS84_MAX_EXTENT[2] || maxy > WGS84_MAX_EXTENT[3]) {
        return {
            crs: 'EPSG:4326',
            bounds: {
                minx: WGS84_MAX_EXTENT[0],
                miny: WGS84_MAX_EXTENT[1],
                maxx: WGS84_MAX_EXTENT[2],
                maxy: WGS84_MAX_EXTENT[3]
            }
        };
    }
    const bbox = {
        crs: 'EPSG:4326',
        bounds: { minx, miny, maxx, maxy }
    };
    return bbox;
}

const getLocalizedValue = (resource, key, locale = '') => {
    if (resource[`${key}_${locale}`]) {
        return resource[`${key}_${locale}`];
    }
    const lang = shortLocale(locale);
    if (lang && resource[`${key}_${lang}`]) {
        return resource[`${key}_${lang}`];
    }
    return null;
};

const getLocalizedValues = (resource, key, defaultValue) => {
    const supportedLocales = getSupportedLocales() || {};
    const translations = Object.values(supportedLocales)
        .map(({ code }) => {
            const value = getLocalizedValue(resource, key, code);
            return value ? [code, value] : null;
        })
        .filter(value => value !== null);
    if (translations.length) {
        return { ...Object.fromEntries(translations), 'default': defaultValue };
    }
    return defaultValue;
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

const getDocumentsStyle = (locales) => ({
    format: 'geostyler',
    metadata: { editorType: 'visual' },
    body: {
        rules: [
            {   name: getMessageById(locales, 'catalog.subtypes.video'),
                ruleId: '01',
                mandatory: false,
                filter: ['&&', ['==', 'subtype', 'video']],
                symbolizers: documentMarkerSymbolizer('video-camera')
            },
            {   name: getMessageById(locales, 'catalog.subtypes.image'),
                ruleId: '02',
                mandatory: false,
                filter: ['&&', ['==', 'subtype', 'image']],
                symbolizers: documentMarkerSymbolizer('camera')
            },
            {   name: getMessageById(locales, 'catalog.subtypes.file'),
                ruleId: '03',
                mandatory: false,
                filter: ['&&', ['!=', 'subtype', 'image'], ['!=', 'subtype', 'video']],
                symbolizers: documentMarkerSymbolizer('file')
            }
        ]
    }
});

/**
* convert resource layer configuration to a mapstore layer object
* @param {object} resource geonode layer resource
* @return {object}
*/
export const resourceToLayerConfig = (resource, options) => {

    const {
        alternate,
        links = [],
        featureinfo_custom_template: template,
        title: defaultTitle,
        perms,
        pk,
        default_style: defaultStyle,
        ptype,
        subtype,
        sourcetype,
        data
    } = resource;

    const layerSettings = data?.layerSettings ?? data;

    const title = getLocalizedValues(resource, 'title', defaultTitle);

    const bbox = getExtentFromResource(resource);
    const defaultStyleParams = defaultStyle && {
        defaultStyle: {
            title: defaultStyle.sld_title,
            name: defaultStyle.workspace ? `${defaultStyle.workspace}:${defaultStyle.name}` : defaultStyle.name
        }
    };

    const extendedParams = {
        pk,
        alternate
    };

    if (subtype === '3dtiles') {
        const { url: tilesetUrl } = links.find(({ extension }) => (extension === '3dtiles')) || {};
        const { enableImageryOverlay } = options || {};
        return {
            id: uuid(),
            type: '3dtiles',
            title,
            url: tilesetUrl,
            ...(bbox && { bbox }),
            visibility: true,
            ...(enableImageryOverlay && { enableImageryOverlay }),
            ...layerSettings,
            extendedParams
        };
    }
    if (subtype === 'cog') {
        const { url: cogUrl } = links.find(({ extension }) => (extension === 'cog')) || {};
        return {
            perms,
            id: uuid(),
            type: 'cog',
            title,
            url: cogUrl,
            sources: [{
                url: cogUrl,
                nodata: 0
            }],
            ...(bbox && { bbox }),
            visibility: true,
            ...layerSettings,
            extendedParams
        };
    }
    if (subtype === 'flatgeobuf') {
        const { url: fgbUrl } = links.find(({ extension }) => (extension === 'flatgeobuf')) || {};
        return {
            perms,
            id: uuid(),
            type: 'flatgeobuf',
            title,
            url: fgbUrl,
            ...(bbox && { bbox }),
            visibility: true,
            ...layerSettings,
            extendedParams
        };
    }

    switch (ptype) {
    case GXP_PTYPES.REST_MAP:
    case GXP_PTYPES.REST_IMG: {
        const { url: arcgisUrl } = links.find(({ mime, link_type: linkType }) => (mime === 'text/html' && linkType === 'image')) || {};
        return {
            perms,
            id: uuid(),
            pk,
            type: 'arcgis',
            ...(isImageServerUrl(arcgisUrl)
                ? { queryable: false }
                : { name: alternate.replace('remoteWorkspace:', '') }),
            url: arcgisUrl,
            ...(bbox && { bbox }),
            title,
            visibility: true,
            ...layerSettings,
            extendedParams
        };
    }
    default:
        const { url: wfsUrl } = links.find(({ link_type: linkType }) => linkType === 'OGC:WFS') || {};
        const { url: wmsUrl } = links.find(({ link_type: linkType }) => linkType === 'OGC:WMS') || {};

        const dimensions = getDimensions(resource);

        const params = wmsUrl && url.parse(wmsUrl, true).query;
        const {
            defaultLayerFormat = 'image/png',
            defaultTileSize = 512
        } = getConfigProp('geoNodeSettings') || {};
        const fields = datasetAttributeSetToFields(resource);
        return {
            perms,
            id: uuid(),
            pk,
            type: 'wms',
            name: alternate,
            url: wmsUrl || '',
            format: defaultLayerFormat,
            ...(wfsUrl && {
                search: {
                    type: 'wfs',
                    url: wfsUrl
                }
            }),
            ...(bbox ? { bbox } : { bboxError: true }),
            ...(template && {
                featureInfo: {
                    format: FEATURE_INFO_FORMAT,
                    template
                }
            }),
            style: defaultStyleParams?.defaultStyle?.name || '',
            title,
            tileSize: defaultTileSize,
            visibility: true,
            ...(params && { params }),
            ...(dimensions.length > 0 && ({ dimensions })),
            ...(fields && { fields }),
            ...(sourcetype === SOURCE_TYPES.REMOTE && !wmsUrl.includes('/geoserver/') && {
                serverType: ServerTypes.NO_VENDOR
            }),
            ...layerSettings,
            extendedParams
        };
    }
};


/**
 * Build a single MapStore vector layer that collects the given GeoNode documents
 * as point features (located at the center of each document extent). Documents
 * without an extent are skipped.
 * @param {array} documents - array of GeoNode document resources
 * @param {object} options - options object, may include locales
 * @returns {object} a MapStore vector layer config
 */
export const documentsToLayerConfig = (documents = [], locales) => {
    const features = documents
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
        title: `${getMessageById(locales, 'catalog.resourceTypes.document')} (${features.length})`,
        ...(bbox && { bbox }),
        features,
        style: getDocumentsStyle(locales),
        rowViewer: GEONODE_DOCUMENTS_ROW_VIEWER
    };
};

/**
* Convert a GeoNode map resource into structure `{ layers, groups }` ready for the catalog container:
* all the map layers exclude backgrounds, nested under a new parent group titled how the map name.
* @param {object} - GeoNode map resource
* @returns {object} - `{ layers, groups }` where `layers` is an array of layer objects and `groups` is an array of group objects
*/
export const resourceMapToLayerGroup = (mapResource) => {
    const mapConfig = mapResource?.data?.map || {};
    const parentId = `Default.${uuid()}`;
    const parentGroup = {
        title: mapResource?.title,
        parent: 'Default',
        options: { id: parentId },
        asFirst: true
    };
    const oldToNewPath = { Default: parentId };
    const groups = (mapConfig.groups || [])
        .filter((group) => group?.id && group.id !== 'Default')
        .sort((a, b) => a.id.split('.').length - b.id.split('.').length)
        .map((group) => {
            const segments = group.id.split('.');
            const oldParentPath = segments.slice(0, -1).join('.');
            const newParentPath = oldToNewPath[oldParentPath] || parentId;
            const newSegment = uuid();
            const newPath = `${newParentPath}.${newSegment}`;
            oldToNewPath[group.id] = newPath;
            const { id, title, ...groupOptions } = group;
            return {
                title,
                parent: newParentPath,
                options: { ...groupOptions, id: newPath, name: newSegment },
                asFirst: false
            };
        });
    const layers = (mapConfig.layers || [])
        .filter((layer) => layer?.group !== 'background')
        .map((layer) => ({
            ...layer,
            id: uuid(),
            group: oldToNewPath[layer?.group] || parentId
        }));
    return { layers, groups: [parentGroup, ...groups] };
};
