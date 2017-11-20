/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {mapInfoRequestsSelector} = require('../mapinfo');

describe('Test map selectors', () => {

    it('test mapInfoRequestsSelector no state', () => {
        const props = mapInfoRequestsSelector({});
        expect(props).toEqual([]);
    });

    it('test mapInfoRequestsSelector', () => {
        const props = mapInfoRequestsSelector({
            mapInfo: {
                requests: ['request']
            }
        });
        expect(props).toEqual(['request']);
    });

});
