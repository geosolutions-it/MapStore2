/**
 * Copyright 20167, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    STYLER_RESET,
    SET_STYLER_LAYER,
    setStylerLayer,
    reset
} = require('../styler');

describe('Test correctness of the rasterstyle actions', () => {

    it('setStylerLayer', () => {
        const layer = {name: "TEST"};
        const retVal = setStylerLayer(layer);
        expect(retVal).toExist();
        expect(retVal.type).toBe(SET_STYLER_LAYER);
        expect(retVal.layer).toBe(layer);
    });
    it('setRasterLayer', () => {
        const layer = {name: "TEST"};
        const retVal = reset(layer);
        expect(retVal).toExist();
        expect(retVal.type).toBe(STYLER_RESET);
        expect(retVal.layer).toBe(layer);
    });
});
