/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Function that debaounce filters change
 * @param {Observable} Stream of props.
 * @return {Observable} Stream of props to trigger the data fetch
 */
module.exports = (props$) => props$
    .distinctUntilChanged(({setFilters}, newProps) => setFilters === newProps.setFilters)
    .switchMap(({setFilters, addFilter$}) => addFilter$
        .debounceTime(500)
        .do((f) => setFilters(f))
    );
