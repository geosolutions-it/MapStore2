/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {getFormatter} = require('../index');
var expect = require('expect');

describe('Tests for the formatter functions', () => {
    it('test getFormatter for strings', () => {
        const formatter = getFormatter({localType: "string"});
        expect(formatter).toBe(null);
    });
    it('test getFormatter for booleans', () => {
        const formatter = getFormatter({localType: "boolean"});
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({value: true}).type).toBe("span");
        expect(formatter({value: true}).props.children).toBe("true");
        expect(formatter({value: false}).props.children).toBe("false");
        expect(formatter({value: null})).toBe(null);
        expect(formatter({value: undefined})).toBe(null);
    });
});
