/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { createSink } from 'recompose';
import '../cesium/plugins/index';
import Map from '../cesium/Map';
import Layer from '../cesium/Layer';

export default () => {
    return {
        Map,
        Layer,
        Feature: createSink(() => {})
    };
};
