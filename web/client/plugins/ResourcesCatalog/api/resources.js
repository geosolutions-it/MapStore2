/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { searchListByAttributes, getResource } from '../../../observables/geostore';
import { castArray } from 'lodash';
import isString from 'lodash/isString';

const splitFilterValue = (value) => {
    const parts = value.split(':');
    return {
        value: parts[0],
        label: parts.length <= 2
            ? parts[1]
            : parts.filter((p, idx) => idx > 0).join(':')
    };
};

const getFilter = ({
    q,
    // user,
    query
}) => {
    const f = castArray(query.f || []);
    const ctx = castArray(query['filter{ctx}'] || []);
    const categories = ['MAP', 'DASHBOARD', 'GEOSTORY', 'CONTEXT'];
    const categoriesFilters = categories.filter(category => f.includes(category.toLocaleLowerCase()));
    return {
        AND: {
            FIELD: [
                ...(q ? [{
                    field: ['NAME'],
                    operator: ['ILIKE'],
                    value: ['%' + q + '%']
                }] : [])
            ],
            ATTRIBUTE: [
                ...(f.includes('featured') ? [{
                    name: ['featured'],
                    operator: ['EQUAL_TO'],
                    type: ['STRING'],
                    value: [true]
                }] : [])
            ],
            OR: [
                {
                    CATEGORY: categories
                        .map(name => {
                            return (!categoriesFilters.length || categoriesFilters.includes(name))
                                ? {
                                    operator: ['EQUAL_TO'],
                                    name: [name]
                                }
                                : null;
                        }).filter(value => value)
                },
                {
                    ATTRIBUTE: [
                        ...(ctx.map((ctxValue) => {
                            const { value } = splitFilterValue(ctxValue);
                            return {
                                name: ['context'],
                                operator: ['EQUAL_TO'],
                                type: ['STRING'],
                                value: [value]
                            };
                        }))
                    ]
                }
            ]
        }
    };
};

export const requestResources = ({
    params
} = {}, { user } = {}) => {

    const {
        page = 1,
        pageSize = 12,
        sort,
        customFilters,
        q,
        ...query
    } = params || {};
    return searchListByAttributes(getFilter({
        q,
        user,
        query
    }),
    {
        params: {
            includeAttributes: true,
            start: parseFloat(page - 1) * pageSize,
            limit: pageSize
        }
    })
        .toPromise()
        .then((response) => {
            // missing canCopy, canDelete, canEdit
            // missing filter by user
            const resources = response.results;

            const associatedContextsIds = resources.map(resource => resource?.attributes?.context).filter(contextId => contextId !== undefined);

            return (associatedContextsIds.length
                ? searchListByAttributes({
                    OR: {
                        FIELD: associatedContextsIds.map((contextId) => {
                            return {
                                field: ['ID'],
                                operator: ['EQUAL_TO'],
                                value: [contextId]
                            };
                        })
                    }
                })
                    .toPromise().then((contextsResponse) => contextsResponse.results)
                : Promise.resolve([])
            )
                .then((contexts) => {
                    return {
                        total: response.totalCount,
                        isNextPageAvailable: page < (response?.totalCount / pageSize),
                        resources: resources.map((resource) => {
                            const context = contexts.find(ctx => ctx.id === resource?.attributes?.context);
                            if (context) {
                                return {
                                    ...resource,
                                    '@extras': {
                                        context
                                    }
                                };
                            }
                            return resource;
                        })
                    };
                });
        });
};

const parseDetailsSettings = (detailsSettings) => {
    if (isString(detailsSettings)) {
        try {
            return JSON.parse(detailsSettings);
        } catch (e) {
            return {};
        }
    }
    return detailsSettings || {};
};

export const requestResource = ({ resource, user }) => {
    return getResource(resource.id, { includeAttributes: true, withData: false, withPermissions: !!user })
        .toPromise()
        .then(({ permissions, attributes, data, ...res }) => {
            const detailsSettings = parseDetailsSettings(resource?.attributes?.detailsSettings);
            return {
                ...resource,
                ...res,
                permissions: permissions || [],
                attributes: {
                    ...attributes,
                    detailsSettings
                }
            };
        });
};

export const facets = [
    {
        id: 'context',
        type: 'select',
        labelId: 'resourcesCatalog.filterMapsByContext',
        key: 'filter{ctx}',
        getLabelValue: (item) => {
            const { label } = splitFilterValue(item.value);
            return label;
        },
        getFilterByField: (field, value) => {
            return { label: value, value };
        },
        loadItems: ({ params, config }) => {
            const { page, pageSize, q } = params;
            return searchListByAttributes(
                {
                    AND: {
                        FIELD: [
                            ...(q ? [{
                                field: ['NAME'],
                                operator: ['ILIKE'],
                                value: ['%' + q + '%']
                            }] : [])
                        ],
                        CATEGORY: {
                            operator: ['EQUAL_TO'],
                            name: ['CONTEXT']
                        }
                    }
                },
                {
                    ...config,
                    params: {
                        start: parseFloat(page) * pageSize,
                        limit: pageSize
                    }
                })
                .toPromise()
                .then((response) => {
                    return {
                        items: response.results.map((item) => {
                            const value = `${item.id}:${item.name}`;
                            return {
                                ...item,
                                filterValue: value,
                                value,
                                label: `${item.name}`
                            };
                        }),
                        isNextPageAvailable: (page + 1) < (response?.totalCount / pageSize)
                    };
                });
        }
    }
];


export const facetsRequest = ({
    fields
}) => {
    return Promise.resolve({
        fields: fields.map((field) => {
            if (field.facet) {
                const facet = facets.find(f => f.id === field.facet);
                return {
                    ...facet,
                    ...field
                };
            }
            return field;
        })
    });
};
