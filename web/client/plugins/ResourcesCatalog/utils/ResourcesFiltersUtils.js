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
import tinycolor from 'tinycolor2';

let filters = {};
/**
 * return a identifier for stored filters
 * @param {object} field a filter field
 * @param {string} field.key key identifier of a filter
 * @param {string} value filter value
 * @return {string} stored filter identifier
 */
export const getFilterId = (field, value) => {
    return `${field?.key}:${value}`;
};
/**
 * return a stored filter object
 * @param {object} field a filter field
 * @param {string} field.key key identifier of a filter
 * @param {string} value filter value
 * @return {object} stored filter
 */
export const getFilterByField = (field, value) => {
    const filterValue = filters?.[getFilterId(field, value)];
    if (field.style === 'facet' && filterValue?.facetName) {
        return field.name === filterValue.facetName ? filterValue : null;
    }
    return filterValue;
};
/**
 * return all stored filters
 * @return {object} stored filter
 */
export const getFilters = () => filters;
/**
 * add filters to the global cache object
 * @param {object} field a filter field
 * @param {string} field.key key identifier of a filter
 * @param {object[]} newFilters list of filters
 */
export const addFilters = (field, newFilters) => {
    filters = {
        ...filters,
        ...Object.fromEntries(newFilters.map((filter) => [getFilterId(field, filter.value), filter]))
    };
};
/**
 * return tag r, g, b variables from a color
 * @param {string} color css valid color string
 * @return {object} { --tag-color-r, --tag-color-g, --tag-color-b }
 */
export const getTagColorVariables = (color = '') => {
    if (!color) {
        return {};
    }
    const { r, g, b } = tinycolor(color).toRgb();
    return {
        '--tag-color-r': r,
        '--tag-color-g': g,
        '--tag-color-b': b
    };
};
/**
 * return a new href by adding/removing the query parameters passed as property.
 * If the query is already in the current location it will removed and vice-versa
 * @param {object} options.location router location
 * @param {string} options.pathname an optional pathname
 * @param {object} options.query a query filter object
 * @param {bool} options.replaceQuery if true it the query is always replaced
 * @param {string[]} options.excludeQueryKeys a list of query keys to exclude in the new href
 * @return {string} hash href
 * @example
 * const newHref = hashLocationToHref({ location: { search: '' }, query: { f: 'map' }});
 * // newHref is '#?f=map'
 * @example
 * const newHref = hashLocationToHref({ location: { search: '?f=map' }, query: { f: 'map' }});
 * // newHref is '#'
 */
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
/**
 * given the router location remove all the filter query parameters and it returns parsed params
 * @param {object} location router location
 * @return {object} new parameters
 */
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

/**
 * extract value and label from a filter
 * @param {string} value value of a filter
 * @return {object} { value, label }
 */
export const splitFilterValue = (value = '') => {
    const parts = value.split(':');
    return {
        value: parts[0],
        label: (parts.length <= 2
            ? parts[1]
            : parts.filter((p, idx) => idx > 0).join(':')) || ''
    };
};
