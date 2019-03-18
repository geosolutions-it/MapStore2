/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


var expect = require('expect');
const {
    updateLayerDimensionData, UPDATE_LAYER_DIMENSION_DATA,
    setCurrentTime, SET_CURRENT_TIME
} = require('../dimension');

describe('dimension actions', () => {
    it('updateLayerDimensionData', () => {
        const retVal = updateLayerDimensionData();
        expect(retVal).toExist();
        expect(retVal.type).toBe(UPDATE_LAYER_DIMENSION_DATA);
    });
    it('setCurrentTime', () => {
        const retVal = setCurrentTime();
        expect(retVal).toExist();
        expect(retVal.type).toBe(SET_CURRENT_TIME);
    });
});
