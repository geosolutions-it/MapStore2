/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const { createSink } = require('recompose');
/**
 * Dummy implementation of mapType for tests
 */
module.exports = () => {
    return {
        Map: createSink(() => {}),
        Layer: createSink(() => {}),
        Feature: createSink(() => {})
    };
};
