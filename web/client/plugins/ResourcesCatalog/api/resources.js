/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { searchListByAttributes, getResource } from '../../../observables/geostore';
import { castArray } from 'lodash';
import GeoStoreDAO from '../../../api/GeoStoreDAO';
import { addFilters, getFilterByField, splitFilterValue } from '../utils/ResourcesFiltersUtils';
import { parseResourceProperties } from '../utils/ResourcesUtils';

const applyDoubleQuote = value => `"${value}"`;

const getFilter = ({
    q,
    user,
    query
}) => {
    const f = castArray(query.f || []);
    const ctx = castArray(query['filter{ctx.in}'] || []);
    const categories = ['MAP', 'DASHBOARD', 'GEOSTORY', 'CONTEXT'];
    const creators = castArray(query['filter{creator.in}'] || []);
    const groups = castArray(query['filter{group.in}'] || []);
    const tags = castArray(query['filter{tag.in}'] || []).map(tag => {
        const { value } = splitFilterValue(tag);
        return value;
    });
    const categoriesFilters = categories.filter(category => f.includes(category.toLocaleLowerCase()));
    const associatedContextFilters = ctx.map((ctxValue) => {
        const { value } = splitFilterValue(ctxValue);
        return {
            name: ['context'],
            operator: ['EQUAL_TO'],
            type: ['STRING'],
            value: [value]
        };
    });
    return {
        AND: {
            FIELD: [
                ...(q ? [{
                    field: ['NAME'],
                    operator: ['ILIKE'],
                    value: ['%' + q + '%']
                }] : []),
                ...(query['filter{creation.gte}'] ? [{
                    field: ['CREATION'],
                    operator: ['GREATER_THAN_OR_EQUAL_TO'],
                    value: [query['filter{creation.gte}']]
                }] : []),
                ...(query['filter{creation.lte}'] ? [{
                    field: ['CREATION'],
                    operator: ['LESS_THAN_OR_EQUAL_TO'],
                    value: [query['filter{creation.lte}']]
                }] : []),
                ...(query['filter{lastUpdate.gte}'] ? [{
                    field: ['LASTUPDATE'],
                    operator: ['GREATER_THAN_OR_EQUAL_TO'],
                    value: [query['filter{lastUpdate.gte}']]
                }] : []),
                ...(query['filter{lastUpdate.lte}'] ? [{
                    field: ['LASTUPDATE'],
                    operator: ['LESS_THAN_OR_EQUAL_TO'],
                    value: [query['filter{lastUpdate.lte}']]
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
            ...(groups.length && {
                GROUP: [
                    {
                        operator: ['IN'],
                        names: groups.map(applyDoubleQuote).join(',')
                    }
                ]
            }),
            ...(tags.length && {
                TAG: [
                    {
                        operator: ['IN'],
                        names: tags.map(applyDoubleQuote).join(',')
                    }
                ]
            }),
            OR: [
                {
                    AND: categories
                        .map(name => {
                            return (
                                !categoriesFilters.length && !associatedContextFilters.length
                                || categoriesFilters.includes(name)
                                || associatedContextFilters.length && name === 'MAP'
                            )
                                ? {
                                    CATEGORY: [
                                        {
                                            operator: ['EQUAL_TO'],
                                            name: [name]
                                        }
                                    ],
                                    ...(name === 'MAP' && associatedContextFilters.length && {
                                        OR: [
                                            {
                                                ATTRIBUTE: associatedContextFilters
                                            }
                                        ]
                                    })
                                }
                                : null;
                        }).filter(value => value)
                },
                ...((user && f.includes('my-resources')) || creators.length ? [{
                    FIELD: [
                        ...(user && f.includes('my-resources') ? [{
                            field: ['CREATOR'],
                            operator: ['EQUAL_TO'],
                            value: [user.name]
                        }] : []),
                        ...(creators.map((value) => {
                            return {
                                field: ['CREATOR'],
                                operator: ['EQUAL_TO'],
                                value: [value]
                            };
                        }))
                    ]
                }] : [])
            ]
        }
    };
};

export const requestResources = ({
    params,
    config
} = {}, { user } = {}) => {

    const {
        page = 1,
        pageSize = 12,
        sort = 'name',
        customFilters,
        q,
        ...query
    } = params || {};
    const sortBy = sort.replace('-', '');
    const sortOrder = sort.includes('-') ? 'desc' : 'asc';
    const f = castArray(query.f || []);
    return searchListByAttributes(getFilter({
        q,
        user,
        query
    }),
    {
        ...config,
        params: {
            includeAttributes: true,
            includeTags: true,
            start: parseFloat(page - 1) * pageSize,
            limit: pageSize,
            sortBy,
            sortOrder,
            ...(f.includes('favorite') ? { favoritesOnly: true } : {})
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
                        resources: resources
                            .map(({ tags, ...resource }) => {
                                return parseResourceProperties({
                                    ...resource,
                                    ...(tags && { tags: castArray(tags) })
                                });
                            })
                            .map((resource) => {
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

export const requestResource = ({ resource, user }) => {
    return getResource(resource.id, { includeAttributes: true, withData: false, withPermissions: !!user })
        .toPromise()
        .then(({ permissions, attributes, data, ...res }) => {
            return parseResourceProperties({
                ...resource,
                ...res,
                permissions: permissions || []
            });
        });
};

export const facets = [
    {
        id: 'context',
        type: 'select',
        labelId: 'resourcesCatalog.filterMapsByContext',
        key: 'filter{ctx.in}',
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
    },
    {
        id: 'group',
        type: 'select',
        labelId: 'resourcesCatalog.groups',
        key: 'filter{group.in}',
        getLabelValue: (item) => {
            return item.value;
        },
        getFilterByField: (field, value) => {
            return { label: value, value };
        },
        loadItems: ({ params, config }) => {
            const { page, pageSize, q } = params;
            return GeoStoreDAO.getGroups(q ? `*${q}*` : '*', {
                ...config,
                params: {
                    start: parseFloat(page) * pageSize,
                    limit: pageSize,
                    all: true
                }
            })
                .then((response) => {
                    const groups = castArray(response?.ExtGroupList?.Group).map((item) => {
                        return {
                            ...item,
                            filterValue: item.groupName,
                            value: item.groupName,
                            label: `${item.groupName}`
                        };
                    });
                    const totalCount = response?.ExtGroupList?.GroupCount;
                    return {
                        items: groups,
                        isNextPageAvailable: (page + 1) < (totalCount / pageSize)
                    };
                });
        }
    },
    {
        id: 'tag',
        type: 'select',
        labelId: 'resourcesCatalog.tags',
        key: 'filter{tag.in}',
        update: ({ facet, query }) => {
            const filters = castArray(query['filter{tag.in}'] || []).filter(filter => !getFilterByField({ key: 'filter{tag.in}' }, filter));
            return filters.length === 0
                ? Promise.resolve(facet)
                : Promise.all(
                    filters.map(filter =>
                        GeoStoreDAO.getTags(filter, {
                            params: {
                                page: 0,
                                entries: 1
                            }
                        }).then((response) => {
                            const tags = castArray(response?.TagList?.Tag || []).map((item) => {
                                const value = `${item.name}`;
                                return {
                                    ...item,
                                    filterValue: value,
                                    value: value,
                                    label: `${item.name}`
                                };
                            });
                            addFilters({ key: 'filter{tag.in}' }, tags);
                        })
                    )
                ).then(() => ({ ...facet, updated: (facet.updated || 0) + 1 }));
        },
        loadItems: ({ params, config }) => {
            const { page, pageSize, q } = params;
            return GeoStoreDAO.getTags(q ? `%${q}%` : undefined, {
                ...config,
                params: {
                    page: page,
                    entries: pageSize
                }
            })
                .then((response) => {
                    const tags = castArray(response?.TagList?.Tag || []).map((item) => {
                        const value = `${item.name}`;
                        return {
                            ...item,
                            filterValue: value,
                            value: value,
                            label: `${item.name}`,
                            color: item.color
                        };
                    });
                    addFilters({ key: 'filter{tag.in}' }, tags);
                    const totalCount = response?.TagList?.Count;
                    return {
                        items: tags,
                        isNextPageAvailable: (page + 1) < (totalCount / pageSize)
                    };
                });
        }
    }
];


export const facetsRequest = ({
    fields,
    query,
    customFilters
}) => {
    const newFields = fields.map((field) => {
        if (field.facet) {
            const facet = facets.find(f => f.id === field.facet);
            return facet ? {
                ...facet,
                ...field
            } : null;
        }
        return field;
    }).filter(value => value !== null);
    const facetsToUpdate = newFields.filter(field => field.facet && field.update);
    return facetsToUpdate.length === 0
        ? Promise.resolve({
            fields: newFields
        })
        : Promise.all(
            facetsToUpdate.map(facet =>
                facet.update({
                    facet,
                    fields,
                    query,
                    customFilters
                })
            )
        ).then((updatedFacets) => {
            return {
                fields: newFields.map((field) => {
                    const updatedFacet = updatedFacets.find((facet) => facet.id === field.id);
                    return updatedFacet ? updatedFacet : field;
                })
            };
        });
};
