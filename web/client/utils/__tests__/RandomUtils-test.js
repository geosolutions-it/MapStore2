/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import {
    randomFloat,
    randomInt
} from '../RandomUtils';

const MAX_UINT32 = 2 ** 32 - 1;

// replaces the browser generator with one returning the given pairs of 32 bit values, in order
const mockRandomValues = (pairs) => {
    const queue = [...pairs];
    return expect.spyOn(window.crypto, 'getRandomValues').andCall((array) => {
        array.set(queue.shift());
        return array;
    });
};

describe('Test RandomUtils', () => {
    afterEach(() => {
        expect.restoreSpies();
    });
    it('randomInt', () => {
        const result = randomInt();
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqualTo(0);
        expect(result).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });
    it('randomInt with max and min', () => {
        for (let i = 0; i < 100; i++) {
            const result = randomInt(8, 5);
            expect(Number.isInteger(result)).toBe(true);
            expect(result).toBeGreaterThanOrEqualTo(5);
            expect(result).toBeLessThan(8);
        }
    });
    it('randomInt maps the random value on the range', () => {
        const spy = mockRandomValues([[0, 7]]);
        expect(randomInt(10, 5)).toBe(7);
        expect(spy.calls.length).toBe(1);
    });
    it('randomInt uses the high bits of the random value', () => {
        // a first value of 2^11 contributes 2^32, and 2^32 % 10 is 6
        const spy = mockRandomValues([[2 ** 11, 0]]);
        expect(randomInt(10)).toBe(6);
        expect(spy.calls.length).toBe(1);
    });
    it('randomInt discards the values above the last full multiple of the range', () => {
        // 2^53 % 3 is 2, so the two highest values 2^53 - 2 and 2^53 - 1 are discarded
        const spy = mockRandomValues([[MAX_UINT32, MAX_UINT32], [MAX_UINT32, MAX_UINT32 - 1], [0, 4]]);
        expect(randomInt(3)).toBe(1);
        expect(spy.calls.length).toBe(3);
    });
    it('randomInt covers the default range', () => {
        // 2^53 % (2^53 - 1) is 1, so only the highest value 2^53 - 1 is discarded
        const spy = mockRandomValues([[MAX_UINT32, MAX_UINT32], [MAX_UINT32, MAX_UINT32 - 1]]);
        expect(randomInt()).toBe(Number.MAX_SAFE_INTEGER - 1);
        expect(spy.calls.length).toBe(2);
    });
    it('randomInt returns min when the range is empty', () => {
        const spy = mockRandomValues([]);
        expect(randomInt(0)).toBe(0);
        expect(randomInt(5, 5)).toBe(5);
        expect(randomInt(3, 5)).toBe(5);
        expect(spy.calls.length).toBe(0);
    });
    it('randomFloat', () => {
        const result = randomFloat();
        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThanOrEqualTo(0);
        expect(result).toBeLessThan(1);
    });
});
