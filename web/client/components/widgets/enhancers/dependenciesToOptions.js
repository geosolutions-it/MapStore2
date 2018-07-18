/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withPropsOnChange} = require('recompose');

/**
 * Merges filter object and dependencies map into an ogc filter
 */
module.exports = compose(
    withPropsOnChange(
        ['dependencies', 'options'],
        ({dependencies = {}, options} = {}) => {
            return {
                options: dependencies.viewParams ? {
                    ...options,
                    viewParams: dependencies.viewParams
                } : options
            };
        }
    )

);
