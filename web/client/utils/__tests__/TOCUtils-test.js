/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {createFromSearch} = require('../TOCUtils');
let options = [{label: "lab1", value: "val1"}];

describe('TOCUtils', () => {
    it('test createFromSearch for General Fragment with value not allowed', () => {
        let val = createFromSearch(options, "/as");
        expect(val).toBe(null);
        val = createFromSearch(options, "a//s");
        expect(val).toBe(null);
        val = createFromSearch(options, "s/d&/");
        expect(val).toBe(null);
    });

    it('test createFromSearch for General Fragment with new valid value', () => {
        let val = createFromSearch(options, "lab2");
        expect(val.label).toBe("lab2");
        expect(val.value).toBe("lab2");
        val = createFromSearch(options, "lab2/lab5");
        expect(val.label).toBe("lab2/lab5");
        expect(val.value).toBe("lab2.lab5");
    });
});
