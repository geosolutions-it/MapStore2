/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

require('rxjs');
// const { getSearchUrl } = require('../../../../utils/LayersUtils');
const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.propertyName === o2.propertyName
    && o1.viewParams === o2.viewParams;
const sameSortOptions = (o1 = {}, o2 = {}) =>
    o1.sortBy === o2.sortBy
    && o1.sortOrder === o2.sortOrder;

/**
 * Function that converts stream of a WFSTable props to trigger data fetch events
 * @param {Observable} Stream of props.
 * @return {Observable} Stream of props to trigger the data fetch
 */
module.exports = ($props) =>
    $props.filter(({ layer = {} }) => layer.name )
        .distinctUntilChanged(
            ({ layer = {}, options = {}, filter, sortOptions }, newProps) =>
            /* getSearchUrl(layer) === getSearchUrl(layer) && */
                (newProps.layer && layer.name === newProps.layer.name && layer.loadingError === newProps.layer.loadingError)
            && sameOptions(options, newProps.options)
            && sameFilter(filter, newProps.filter)
            && sameSortOptions(sortOptions, newProps.sortOptions))
        // when one of the items above changed invalidates cache for before the next request
        .map((props) => ({
            ...props,
            features: [],
            pages: [],
            pagination: {}
        }));
