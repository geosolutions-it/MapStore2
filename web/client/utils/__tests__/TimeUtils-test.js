/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const { roundResolution } = require('../TimeUtils');


describe('TimeUtils', () => {
    it('roundResolution', () => {
        const TEST_DURATION = [
            ["P23DT23H", "P23D"],
            ["P1W2DT10H2M2.45S", "P1W"],
            ["PT20H10M2S", "PT20H"],
            ["P24D", "P24D"],
            ["PT14M", "PT14M"],
            ["PT14M10.2S", "PT14M"],
            ["P1M", "P1M"],
            ["PT1M", "PT1M"],
            ["P23.5DT23H", "P23.5D"],
            ["PT0.0000005S", "PT0.0000005S"]
        ];
        TEST_DURATION.map(([testString, expected]) => {
            expect(roundResolution(testString)).toBe(expected);
        });
    });
});
