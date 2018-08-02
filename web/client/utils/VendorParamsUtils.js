/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const FilterUtils = require('./FilterUtils');


module.exports = {
    optionsToVendorParams: (options) => {
        const cqlFilterFromObject = FilterUtils.isFilterValid(options.filterObj) && FilterUtils.toCQLFilter(options.filterObj);
        const { CQL_FILTER: cqlFilterFromParams, ...params } = options && options.params || {};
        let CQL_FILTER;
        if (cqlFilterFromObject && cqlFilterFromParams) {
            CQL_FILTER = `(${cqlFilterFromObject}) AND (${cqlFilterFromParams})`;
        } else {
            CQL_FILTER = cqlFilterFromObject || cqlFilterFromParams;
        }
        return {
            CQL_FILTER,
            ...params
        };
    }
};
