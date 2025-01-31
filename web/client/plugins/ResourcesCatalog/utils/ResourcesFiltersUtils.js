/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';
import castArray from 'lodash/castArray';
import omit from 'lodash/omit';

let filters = {};

export const getFilterByField = (field, value) => {
    const filterValue = filters?.[field.key + value];
    if (field.style === 'facet' && filterValue?.facetName) {
        return field.name === filterValue.facetName ? filterValue : null;
    }
    return filterValue;
};

export const getFilters = () => filters;

export const addFilters = (newFilters) => {
    filters = {
        ...filters,
        ...newFilters
    };
};

export const hashLocationToHref = ({
    location,
    pathname,
    query,
    replaceQuery,
    excludeQueryKeys
}) => {
    const { search, ...loc } = location;
    const { query: locationQuery } = url.parse(search || '', true);

    const newQuery = query
        ? replaceQuery
            ? { ...locationQuery, ...query }
            : Object.keys(query).reduce((acc, key) => {
                const value = query[key];
                const currentQueryValues = castArray(acc[key]).filter(val => val);
                const queryValue = currentQueryValues.indexOf(value) === -1
                    ? [...currentQueryValues, value]
                    : currentQueryValues.filter(val => val !== value);
                return { ...acc, [key]: queryValue };
            }, locationQuery)
        : locationQuery;

    return `#${url.format({
        ...loc,
        ...(pathname && { pathname }),
        query: omit(Object.keys(newQuery).reduce((acc, newQueryKey) =>
            !newQuery[newQueryKey] || newQuery[newQueryKey].length === 0
                ? acc
                : { ...acc,  [newQueryKey]: newQuery[newQueryKey]}, {}), excludeQueryKeys)
    })}`;
};

export function clearQueryParams(location) {
    const { query } = url.parse(location.search, true);
    const newParams = Object.keys(query)
        .reduce((acc, key) =>
            key.indexOf('filter') === 0
            || key === 'f'
            || key === 'q'
                ? {
                    ...acc,
                    [key]: []
                }
                : acc, { extent: undefined });
    return newParams;
}

export const splitFilterValue = (value) => {
    const parts = value.split(':');
    return {
        value: parts[0],
        label: parts.length <= 2
            ? parts[1]
            : parts.filter((p, idx) => idx > 0).join(':')
    };
};
