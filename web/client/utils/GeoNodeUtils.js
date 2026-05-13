/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isImageServerUrl } from './ArcGISUtils';
import { getConfigProp } from './ConfigUtils';
import { getSupportedLocales, shortLocale } from './LocaleUtils';
import uuid from 'uuid';
import { isEmpty } from 'lodash';
import queryString from 'query-string';
import url from 'url';
import { ServerTypes } from './LayersUtils';

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
            "executions", "thumbnail_url", "alternate", "attribution", "href"
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
    [DEFAULT_PRESET_KEYS.MAP_VIEWER]: {
        "include": ["data", "maplayers"]
    },
    [DEFAULT_PRESET_KEYS.DOCUMENT_VIEWER]: {
        "include": ["href", "extension"]
    },
    [DEFAULT_PRESET_KEYS.DATASET_VIEWER]: {
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
            sources: [{
                url: cogUrl
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


// For map : if we need to also add map then we need this
export const resourceToLayers = (resource) => {
    if (resource?.resource_type === ResourceTypes.DATASET) {
        return [{...resourceToLayerConfig(resource), isDataset: true}];
    }
    if (resource.maplayers && resource?.resource_type === ResourceTypes.MAP) {
        return resource.maplayers
            .map(maplayer => {
                maplayer.dataset ? resourceToLayerConfig(maplayer.dataset) : null;
                if (maplayer.dataset) {
                    const layer = resourceToLayerConfig(maplayer.dataset);
                    return {
                        ...layer,
                        style: maplayer.current_style
                    };
                }
                return null;
            })
            .filter(value => value);
    }
    return [];
};
