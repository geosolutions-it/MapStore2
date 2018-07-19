/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withPropsOnChange} = require('recompose');
const {get, find} = require('lodash');
/**
 * Merges options and original layer's data to get the final options (with viewParams added)
 */
module.exports = compose(
    withPropsOnChange(
        ['dependencies', 'options'],
        ({ dependencies = {}, options, layer = {}} = {}) => {
            const params =
                layer
                    && layer.id
                    && get(
                        find(dependencies.layers || [], {
                            id: layer.id
                        }),
                        "params",
                        {}
                    );
            const viewParamsKey = find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "viewparams");
            const viewParams = params && viewParamsKey && params[viewParamsKey];
            return {
                options: viewParams ? {
                    ...options,
                    viewParams
                } : options
            };
        }
    )

);
