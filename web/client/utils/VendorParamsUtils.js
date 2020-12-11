/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {isFilterValid, toCQLFilter} from './FilterUtils';

/**
     * Check layer options to manipulate and manage vendor params in case of GeoServer usage.
     * If you have a filterObj in options, this should be converted into a CQL_FILTER and joined with the existing cql filter, if any.
     * (filterObj is the temp filter applied to the layer when you apply, for instance, sync with feature grid)
     * layerFilter
     * @memberof Utils.VendorParamsUtils
     * @param {object} options layer options
     * @returns params for the layer's request, properly manipulated
     */
export const optionsToVendorParams = (options = {}, extraCQLFilter = null) => {
    const {layerFilter, filterObj: featureGridFilter} = options;
    let cqlFilters = [
        isFilterValid(layerFilter) && !layerFilter.disabled && toCQLFilter(layerFilter),
        isFilterValid(featureGridFilter) && toCQLFilter(featureGridFilter),
        options && options.params && options.params.CQL_FILTER,
        extraCQLFilter];
    let CQL_FILTER;

    cqlFilters = cqlFilters.filter( f => !!f);
    if (cqlFilters.length > 1) {
        CQL_FILTER = cqlFilters.map(f => (`(${f})`)).join(" AND ");
    } else {
        CQL_FILTER = cqlFilters.pop();
    }
    return CQL_FILTER ? {
        ...options.params,
        CQL_FILTER
    } : options.params;
};
