/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    currentMapDetailsSelector,
    currentMapDetailsUriSelector,
    currentMapIdSelector,
    currentMapNameSelector,
    currentMapDecriptionSelector
} = require('../currentmap');

const uri = "some/uri/6/";
const currentMapState = {
    currentMap: {
        name: "name",
        description: "desc",
        details: encodeURIComponent(uri),
        id: "8",
        detailsText: "<p>adsojvasova<p/>"}};
describe('Test current map selectors', () => {
    it('test currentMapDetailsSelector', () => {
        const props = currentMapDetailsSelector(currentMapState);
        expect(props).toBe("<p>adsojvasova<p/>");
    });
    it('test currentMapDetailsUriSelector', () => {
        const props = currentMapDetailsUriSelector(currentMapState);
        expect(decodeURIComponent(props)).toBe(uri);
    });
    it('test currentMapIdSelector', () => {
        const props = currentMapIdSelector(currentMapState);
        expect(props).toBe("8");
    });
    it('test currentMapNameSelector', () => {
        const props = currentMapNameSelector(currentMapState);
        expect(props).toBe("name");
    });
    it('test currentMapDecriptionSelector', () => {
        const props = currentMapDecriptionSelector(currentMapState);
        expect(props).toBe("desc");
    });
});
