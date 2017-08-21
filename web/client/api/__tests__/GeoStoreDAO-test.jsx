/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const API = require('../GeoStoreDAO');

describe('Test correctness of the GeoStore APIs', () => {

    it('check the utility functions', () => {
        const result = API.addBaseUrl(null);
        expect(result).toIncludeKey("baseURL");
        expect(result.baseURL).toNotBe(null);
        const result2 = API.addBaseUrl({otherOption: 3});
        expect(result2).toIncludeKey("baseURL")
        .toIncludeKey('otherOption');
        expect(result2.baseURL).toNotBe(null);
    });

    it('check the content encoding', () => {
        const result = API.encodeContent(JSON.stringify({
            title: "With quotes'"
        }));
        expect(API.encodeContent(result).indexOf('\\')).toBe(-1);
    });
});
