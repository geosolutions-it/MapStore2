/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const FilterUtils = require('./FilterUtils');


module.exports = {
    /**
     * Check layer options to manipulate and manage vendor params in case of GeoServer usage.
     * If you have a filterObj in options, this should be converted into a CQL_FILTER and joined with the existing cql filter, if any.
     * (filterObj is the temp filter applied to the layer when you apply, for instance, sync with feature grid)
     * @memberof Utils.VendorParamsUtils
     * @param {object} options layer options
     * @returns params for the layer's request, properly manipulated
     */
    optionsToVendorParams: (options = {}) => {
        const cqlFilterFromObject = FilterUtils.isFilterValid(options.filterObj) && FilterUtils.toCQLFilter(options.filterObj);
        const { CQL_FILTER: cqlFilterFromParams, ...params } = options && options.params || {};
        let CQL_FILTER;
        if (cqlFilterFromObject && cqlFilterFromParams) {
            CQL_FILTER = `(${cqlFilterFromObject}) AND (${cqlFilterFromParams})`;
        } else {
            CQL_FILTER = cqlFilterFromObject || cqlFilterFromParams;
        }
        return CQL_FILTER ? {
            CQL_FILTER,
            ...params
        } : options.params;
    }
};
