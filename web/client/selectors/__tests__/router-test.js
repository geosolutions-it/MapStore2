/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    pathnameSelector,
    searchSelector
} = require("../router");
const pathname = "/viewer/openlayers/123";
const search = "?showHome=true";
const state = {
    router: {
        location: {
            pathname,
            search
        }
    }
};

describe('Test router selectors', () => {
    it('test pathnameSelector', () => {
        const retVal = pathnameSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(pathname);
    });

    it('test searchSelector', () => {
        const retVal = searchSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(search);
    });
});
