/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {crsInputValueSelector} = require('../crsselector');
describe('Test layers selectors', () => {
    it('test crsInputValueSelector', () => {
        const props = crsInputValueSelector({crsselector: {value: 'EPSG:4326'}});

        expect(props).toExist();
        expect(props).toBe('EPSG:4326');
    });
});
