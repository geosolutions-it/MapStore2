/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {createSink} = require('recompose');

export default () => {
    require('../cesium/plugins/index');
    return {
        Map: require('../cesium/Map').default,
        Layer: require('../cesium/Layer').default,
        Feature: createSink(() => {})
    };
};
