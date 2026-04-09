/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import queryString from "query-string";
import isEmpty from "lodash/isEmpty";
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import castArray from 'lodash/castArray';
import omit from 'lodash/omit';
import axios from '../libs/ajax';
import { addFilters, getFilterByField } from "../utils/ResourcesFiltersUtils";
import get from 'lodash/get';
import { handleExpression } from "../utils/PluginsUtils";
import { getConfigProp } from '../utils/ConfigUtils';


export const RESOURCES = 'resources';
export const DATASETS = 'datasets';
export const DOCUMENTS = 'documents';
export const FACETS = 'facets';

const API_PRESET = {
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

let endpoints = {
    // default values
    'resources': '/api/v2/resources',
    'documents': '/api/v2/documents',
    'datasets': '/api/v2/datasets',
    'maps': '/api/v2/maps',
    'geoapps': '/api/v2/geoapps',
    'users': '/api/v2/users',
    'resource_types': '/api/v2/resources/resource_types',
    'categories': '/api/v2/categories',
    'owners': '/api/v2/owners',
    'keywords': '/api/v2/keywords',
    'regions': '/api/v2/regions',
    'groups': '/api/v2/groups',
    'executionrequest': '/api/v2/executionrequest',
    'facets': '/api/v2/facets',
    'uploads': '/api/v2/uploads',
    'metadata': '/api/v2/metadata',
    'assets': '/api/v2/assets',
    'rules': '/api/v2/reqrules'
};

function mergeCustomQuery(params, customQuery) {
    if (customQuery) {
        return mergeWith(
            { ...params },
            { ...customQuery },
            (objValue, srcValue) => {
                if (isArray(objValue) && isArray(srcValue)) {
                    return [...objValue, ...srcValue];
                }
                if (isString(objValue) && isArray(srcValue)) {
                    return [objValue, ...srcValue];
                }
                if (isArray(objValue) && isString(srcValue)) {
                    return [...objValue, srcValue];
                }
                if (isString(objValue) && isString(srcValue)) {
                    return [ objValue, srcValue ];
                }
                return undefined; // eslint-disable-line consistent-return
            }
        );
    }
    return params;
}

export const getQueryParams = (params, customFilters) => {
    const customQuery = customFilters
        .filter(({ id }) => castArray(params?.f ?? []).indexOf(id) !== -1)
        .reduce((acc, filter) => mergeCustomQuery(acc, filter.query || {}), {}) || {};
    return {
        ...mergeCustomQuery(omit(params, "f"), customQuery)
    };
};

export const parseIcon = (item) => {
    let value;
    if (typeof item === 'object') {
        value = item.icon ?? item?.fa_class;
    } else {
        value = item;
    }
    return value?.replace("fa-", "");
};

export const mapObjectFunc = func => {
    const iter = value => value && typeof value === 'object'
        ? Array.isArray(value)
            ? value.map(iter)
            : Object.fromEntries(Object.entries(value).map(([key, val]) => [key, iter(val, func)]))
        : func(value);
    return iter;
};

/**
 * return all the custom filters available in the GeoNode configuration from localConfig
 * @param {object} monitoredState monitored state
 */
export const getCustomMenuFilters = (monitoredState) => {
    const geoNodeCustomFilters = getConfigProp('geoNodeCustomFilters');
    const getMonitorState = (path) => {
        return get(monitoredState, path);
    };
    const parsedGeoNodeCustomFilters = mapObjectFunc(v => handleExpression(getMonitorState, {}, v))(geoNodeCustomFilters || {});
    const menuFilters = Object.keys(parsedGeoNodeCustomFilters).reduce((acc, id) => {
        return [...acc, { id, query: parsedGeoNodeCustomFilters[id] }];
    }, []);
    return menuFilters;
};


export const getEndpointUrl = (baseUrl, endpoint, pk) => {
    const url = endpoints[endpoint] || endpoint;
    if (baseUrl && baseUrl !== FACETS && baseUrl !== RESOURCES) {
        // baseUrl is the full server URL
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return `${cleanBase}${url}${pk ? `/${pk}` : ''}`;
    }
    // baseUrl is FACETS or RESOURCES constant, use the endpoint directly
    return url;
};

/**
 * Params serializer to include/exclude square brackets
 * for params with array value
 * @param {Object} params
 * @returns {Object} updated params
 */
export const paramsSerializer = () => {
    return {
        paramsSerializer: {
            serialize: params => {
                const {include, exclude, sort, ...rest} = params ?? {}; // Update bracket params (if any)
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

export const getResourceByPk = (baseUrl, pk) => {
    return axios.get(getEndpointUrl(baseUrl, RESOURCES, pk), {
        params: {
            api_preset: API_PRESET.VIEWER_COMMON
        }
    })
        .then(({ data }) => data.resource);
};


export const getDatasetByPk = (baseUrl, pk) => {
    return axios.get(getEndpointUrl(baseUrl, DATASETS, pk), {
        params: {
            api_preset: [API_PRESET.VIEWER_COMMON, API_PRESET.DATASET]
        },
        ...paramsSerializer()
    })
        .then(({ data }) => data.dataset);
};

export const getDocumentByPk = (baseUrl, pk) => {
    return axios.get(getEndpointUrl(baseUrl, DOCUMENTS, pk), {
        params: {
            api_preset: [API_PRESET.VIEWER_COMMON, API_PRESET.DOCUMENT]
        },
        ...paramsSerializer()
    })
        .then(({ data }) => data.document);
};

// we may need to change this to resources endpoint
// we may need to add addtional request for single dataset on layer add.
export const getResources = ({
    q,
    pageSize = 10,
    page = 1,
    sort,
    f,
    customFilters = [],
    config,
    baseUrl,
    ...params
}) => {
    const _params = {
        ...getQueryParams({...params, f}, customFilters),
        ...(q && {
            search: q,
            search_fields: ['title', 'abstract']
        }),
        ...(sort && { sort: isArray(sort) ? sort : [ sort ]}),
        page,
        page_size: pageSize,
        'filter{metadata_only}': false, // exclude resources such as services
        api_preset: API_PRESET.CATALOGS, // Note : the problem with this is tags are not available also the alternate key
        'filter{resource_type.in}': ['dataset']
    };
    return axios.get(getEndpointUrl(baseUrl, RESOURCES), {
        params: _params,
        ...config,
        ...paramsSerializer()
    }).then(({ data }) => {
        const resources = (data.resources || []).map((resource) => resource);
        const recordsReturned = Math.min(pageSize, resources.length);
        const nextRecord = data?.links?.next
            ? (data.page * data.page_size) + 1
            : 0;
        return {
            numberOfRecordsMatched: data.total ?? resources.length,
            numberOfRecordsReturned: recordsReturned,
            nextRecord,
            records: resources
        };
    });
};


export const getRecords = (url, startPosition, maxRecords, text, options) => {
    return getResources({
        q: text,
        pageSize: maxRecords,
        page: Math.floor((startPosition - 1) / maxRecords) + 1,
        baseUrl: url,
        ...options?.options?.filters,
        sort: options?.options?.sort
    });
};

// facets
const parseTopicsItems = (items = [], { facet, style }) => {
    return items.map((item) => {
        const value = String(item.key);
        return {
            type: "filter",
            // TODO remove when api send isLocalized for all facets response
            ...(item.is_localized ? { labelId: item.label } : { label: item.label }),
            count: item.count ?? 0,
            filterKey: facet.filter,
            filterValue: value,
            value,
            style,
            facetName: facet.name,
            icon: parseIcon(item.fa_class),
            image: item.image
        };
    });
};

const applyFacetToFields = (fields, facets = [], { customFilters, baseUrl = '' }) => {
    return fields.map((field) => {
        if (field.facet) {
            const filteredFacetsByType = facets
                .filter(f => f.type === field.facet)
                .filter(f => field.include
                    ? field.include?.includes(f.name)
                    : field.exclude
                        ? !field.exclude?.includes(f.name)
                        : true);
            if (!filteredFacetsByType.length) {
                return null;
            }

            return filteredFacetsByType.map((facet) => {
                const facetConfig = facet.config || {};
                const style = facetConfig.style || field.style;
                const type = facetConfig.type || field.type;
                const order = facetConfig.order || field.order;
                const isLocalized = !!facet.is_localized;
                const label = facet.label;
                return {
                    id: facet.name,
                    name: facet.name,
                    type,
                    style,
                    order,
                    facet: field.facet,
                    ...(isLocalized ? { labelId: label } : { label }),
                    key: facet.filter,
                    loadItems: ({ params, config }) => {
                        const { q, ...updatedParams } = getQueryParams(params, customFilters);
                        return axios.get(getEndpointUrl(baseUrl, `/api/v2/facets/${facet.name}`), {
                            ...config,
                            params: {
                                ...(q && { topic_contains: q }),
                                ...updatedParams
                            },
                            ...paramsSerializer()
                        })
                            .then(({ data }) => {
                                const topics = data?.topics ?? {};
                                const pageSize = topics?.page_size;
                                const page = Number(topics.page);
                                const total = topics?.total;
                                const isNextPageAvailable = (Math.ceil(Number(total) / Number(pageSize)) - (page + 1)) !== 0;
                                const items = parseTopicsItems(topics.items, { facet, style });

                                const filterField = { key: facet.filter, style, name: facet.name };
                                // if the items are empty and items are selected
                                // we should still see them with count equal 0
                                // to allow user to deselect the filter
                                // TODO: review if possible to move this control in accordion
                                const facetQuery = updatedParams[facet.filter];
                                if (!isEmpty(facetQuery) && items.length === 0) {

                                    const appliedFilters = castArray(facetQuery)
                                        .map((val) => getFilterByField(filterField, val))
                                        .map(appliedFilter => ({ ...appliedFilter, count: 0 }));
                                    // store all filters information
                                    addFilters(filterField, appliedFilters);

                                    return {
                                        isNextPageAvailable,
                                        items: appliedFilters
                                    };
                                }

                                // store all filters information
                                addFilters(filterField, items);

                                return {
                                    isNextPageAvailable,
                                    items
                                };
                            });
                    }
                };
            });
        }
        if (field.items) {
            return {
                ...field,
                items: applyFacetToFields(field.items, facets, { customFilters, baseUrl })
            };
        }
        return field;
    }).flat().filter(val => val).sort((a, b) => a.order - b.order);
};

let facetsCache;

const findFacetField = (facet, fields) => {
    return fields.filter((field) => field.facet && field.id === facet.name
        ? true
        : field.items
            ? findFacetField(facet, field.items)
            : false).flat()[0];
};

const updateFacets = (fields, facets = [], query = {}, baseUrl = '') => {
    const queryFacets = facets.filter(facet => query[facet.filter]);
    if (queryFacets.length) {
        return axios.all(queryFacets.map((queryFacet) => {
            const field = findFacetField(queryFacet, fields);
            if (!field) {
                return Promise.resolve({});
            }
            const keys = castArray(query[queryFacet.filter]);
            const style = queryFacet?.config?.style || field.style;
            return keys.map((key) => {
                const { q, ...params } = query;
                return axios.get(getEndpointUrl(baseUrl, `/api/v2/facets/${queryFacet.name}`), {
                    params: {
                        ...params,
                        ...(q && { topic_contains: q }),
                        include_topics: true,
                        key
                    },
                    ...paramsSerializer()
                })
                    .then(({ data } = {}) => {
                        const filterField = { key: queryFacet.filter, style, name: queryFacet.name };
                        const topics = data?.topics ?? {};
                        const items = parseTopicsItems(topics.items, { facet: queryFacet, style });
                        // store all filters information
                        addFilters(filterField, items);
                        return {};
                    })
                    .catch(() => ({}));
            });
        }).flat());
    }
    return Promise.resolve({});
};

export const getFacetItems = ({
    fields,
    query,
    monitoredState,
    baseUrl = ''
}) => {
    const customFilters = getCustomMenuFilters(monitoredState);
    const updatedParams = getQueryParams(query, customFilters);
    return (
        !facetsCache
            ? axios.get(getEndpointUrl(baseUrl, 'facets'), { params: { include_config: true }})
                .then(({ data } = {}) => {
                    facetsCache = data?.facets;
                    return { fields: applyFacetToFields(fields, facetsCache, { customFilters, baseUrl }) };
                })
                .catch(() => ({ fields: applyFacetToFields(fields, [], { customFilters, baseUrl }) }))
            : Promise.resolve({ fields: applyFacetToFields(fields, facetsCache, { customFilters, baseUrl }) })
    ).then((payload) => {
        // update information of the current selected facet filters
        return updateFacets(payload.fields, facetsCache, updatedParams, baseUrl).then(() => payload);
    });
};


export const textSearch = ( url, startPosition, maxRecords, text,  options) =>{
    return getRecords( url, startPosition, maxRecords, text,  options);
};

const Api = {
    getRecords,
    textSearch
};

export default Api;
