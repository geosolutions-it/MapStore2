/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    createShallowSelector,
    createShallowSelectorCreator
} = require('../ReselectUtils');
const { isEqual } = require('lodash');

const TEST_STRING_1 = "TEST_1";
const TEST_STRING_2 = "TEST_2";
const ST_ARR1 = [TEST_STRING_1, TEST_STRING_2];
const ST_ARR2 = [TEST_STRING_1];
const OBJ_1 = {
    a: "a",
    b: "b",
    c: "c"
};
const OBJ_2 = {
    a: "a",
    b: "b"
};

const OBJ_ARR_1 = [OBJ_1, OBJ_2];
const OBJ_ARR_2 = [OBJ_1];

const createMockState = value => ({
    test: value
});

const mockStateSelector = state => state.test;

describe('ReselectUtils', () => {

    it('createShallowSelector with array', () => {

        const selector = createShallowSelector(
            mockStateSelector,
            v => v
        );
        // TEST ARRAYS OF STRING
        expect(selector(createMockState(ST_ARR1))).toBe(ST_ARR1);
        // check cache
        expect(selector(createMockState([...ST_ARR1]))).toBe(ST_ARR1);
        // check update on element remove
        expect(selector(createMockState(ST_ARR2))).toBe(ST_ARR2);
        expect(selector(createMockState(ST_ARR1))).toBe(ST_ARR1);

        // TEST ARRAYS OF OBJECTS
        expect(selector(createMockState(OBJ_ARR_1))).toBe(OBJ_ARR_1);
        // check cache
        expect(selector(createMockState([...OBJ_ARR_1]))).toBe(OBJ_ARR_1);
        // check update on element remove
        expect(selector(createMockState(OBJ_ARR_2))).toBe(OBJ_ARR_2);
        expect(selector(createMockState(OBJ_ARR_1))).toBe(OBJ_ARR_1);
        // check cache on object copy
        expect(selector(createMockState([
            { ...OBJ_1 },
            { ...OBJ_2 }
        ]))).toNotBe(OBJ_ARR_1);
    });
    it('createShallowSelector with object', () => {

        const selector = createShallowSelector(
            mockStateSelector,
            v => v
        );
        expect(selector(createMockState(OBJ_1))).toBe(OBJ_1);
        // check Cache
        expect(selector(createMockState({ ...OBJ_1 }))).toBe(OBJ_1);
        expect(selector(createMockState(OBJ_2))).toBe(OBJ_2);
        // check change on array size changes
        expect(selector(createMockState(OBJ_1))).toBe(OBJ_1);
    });
    it('createShallowSelectorCreator', () => {
        const selector = createShallowSelectorCreator(isEqual)(
            mockStateSelector,
            v => v
        );
        expect(selector(createMockState(OBJ_ARR_1))).toBe(OBJ_ARR_1);

        // cashes with deep equal
        expect(selector(createMockState([
            { ...OBJ_1 },
            { ...OBJ_2 }
        ]))).toBe(OBJ_ARR_1);
    });
    it('createShallowSelectorCreator with custom props', () => {
        const selector = createShallowSelectorCreator(
            (O1, O2) => {
                return O1 && O2 && O1.a === O2.a && O1.b === O2.b;
            }
        )(
            mockStateSelector,
            v => v
        );
        expect(selector(createMockState(OBJ_ARR_2))).toBe(OBJ_ARR_2);

        // cashes ignoring the "c" property
        expect(selector(createMockState([
            OBJ_2
        ]))).toBe(OBJ_ARR_2);
    });
});
