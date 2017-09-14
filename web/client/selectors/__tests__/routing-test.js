/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    pathnameSelector
} = require("../routing");
const pathname = "/viewer/openlayers/123";
const state = {
    routing: {
        location: {
            pathname
        }
    }
};

describe('Test routing selectors', () => {
    it('test pathnameSelector', () => {
        const retVal = pathnameSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(pathname);
    });
});
