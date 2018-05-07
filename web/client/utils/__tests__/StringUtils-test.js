/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {containsHTML} = require('../StringUtils');

describe('StringUtils test', () => {
    it('test contains html', () => {
        const withHtml = "<div> some val </div>";
        const withoutHtml = "some val";

        expect(containsHTML(withHtml)).toBe(true);
        expect(containsHTML(withoutHtml)).toBe(false);
    });

});
