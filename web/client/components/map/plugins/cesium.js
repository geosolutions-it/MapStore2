/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {createSink} = require('recompose');
module.exports = () => {
    require('../cesium/plugins/index');
    return {
        Map: require('../cesium/Map'),
        Layer: require('../cesium/Layer'),
        Feature: createSink(() => {})
    };
};
