/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import NumberFormat from '../../../../I18N/Number';
import {getFormatter} from '../index';

describe('Tests for the formatter functions', () => {
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
    it('test getFormatter for strings', () => {
        const value = 'Test https://google.com with google link';
        const formatter = getFormatter({localType: "string"});
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({value: 'Test no links'})[0]).toBe('Test no links');
        expect(formatter({value})[0]).toBe('Test ');
        expect(formatter({value})[1].props.href).toBe('https://google.com');
        expect(formatter({value})[2]).toBe(' with google link');
        expect(formatter({value: null})).toBe(null);
        expect(formatter({value: undefined})).toBe(null);
    });
    it('test getFormatter for number', () => {
        const formatter = getFormatter({localType: "number"});
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({value: 44.3333434353535}).type).toBe(NumberFormat);
        expect(formatter({value: 44.3333434353535}).props.value).toBe(44.3333434353535);
        expect(formatter({value: null})).toBe(null);
        expect(formatter({value: undefined})).toBe(null);
        expect(formatter({value: 0}).props.value).toBe(0);
    });
    it('test getFormatter for int', () => {
        const formatter = getFormatter({localType: "int"});
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({value: 2455567}).type).toBe(NumberFormat);
        expect(formatter({value: 2455567}).props.value).toBe(2455567);
        expect(formatter({value: null})).toBe(null);
        expect(formatter({value: undefined})).toBe(null);
        expect(formatter({value: 0}).props.value).toBe(0);
    });
    it('test getFormatter for geometry', () => {
        const formatter = getFormatter({localType: "Geometry"});
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({value: {properties: {}, geometry: {type: "Point", coordinates: [1, 2]}}})).toBe(null);
        expect(formatter({value: null})).toBe(null);
        expect(formatter({value: undefined})).toBe(null);
    });
});
