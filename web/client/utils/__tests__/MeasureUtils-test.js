/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');
const {
    getFormattedBearingValue,
    getFormattedLength,
    getFormattedArea,
    degToDms,
    mToft,
    mTokm,
    mTomi,
    mTonm,
    sqmTosqmi,
    sqmTosqkm,
    sqmTosqnm,
    sqmTosqft
} = require('../MeasureUtils');


describe('MeasureUtils', () => {
    beforeEach( () => {

    });
    afterEach(() => {

    });
    it('test conversion meters to feet', () => {
        const val = mToft(1);
        expect(val).toBe(3.28084);
    });
    it('test conversion meters to kilometers', () => {
        const val = mTokm(1);
        expect(val).toBe(0.001);
    });
    it('test conversion meters to miles', () => {
        const val = mTomi(1);
        expect(val).toBe(0.000621371);
    });
    it('test conversion meters to nauticalmiles', () => {
        const val = mTonm(1);
        expect(val).toBe(0.000539956803);
    });
    it('test conversion squaremeters to squarefeet', () => {
        const val = sqmTosqft(1);
        expect(val).toBe(10.7639);
    });
    it('test conversion squaremeters to squarekilometers', () => {
        const val = sqmTosqkm(1);
        expect(val).toBe(0.000001);
    });
    it('test conversion squaremeters to squaremiles', () => {
        const val = sqmTosqmi(1);
        expect(val).toBe(0.000000386102159);
    });
    it('test conversion squaremeters to squarenauticalmiles', () => {
        const val = sqmTosqnm(1);
        expect(val).toBe(0.00000029155);
    });
    it('test getFormattedLength', () => {
        let val = getFormattedLength("m", 1);
        expect(val).toBe(1);
        val = getFormattedLength(undefined, 1);
        expect(val).toBe(1);
        val = getFormattedLength("ft", 1);
        expect(val).toBe(3.28084);
        val = getFormattedLength("km", 1);
        expect(val).toBe(0.001);
        val = getFormattedLength("mi", 1);
        expect(val).toBe(0.000621371);
        val = getFormattedLength("nm", 1);
        expect(val).toBe(0.000539956803);
    });
    it('test getFormattedArea', () => {
        let val = getFormattedArea("sqm", 1);
        expect(val).toBe(1);
        val = getFormattedArea(undefined, 1);
        expect(val).toBe(1);
        val = getFormattedArea("sqft", 1);
        expect(val).toBe(10.7639);
        val = getFormattedArea("sqkm", 1);
        expect(val).toBe(0.000001);
        val = getFormattedArea("sqmi", 1);
        expect(val).toBe(0.000000386102159);
        val = getFormattedArea("sqnm", 1);
        expect(val).toBe(0.00000029155);
    });
    it('test degToDms', () => {
        let val = degToDms(1.111);
        expect(val).toBe("1° 6' 39'' ");
    });
    it('test getFormattedBearingValue', () => {
        let val = getFormattedBearingValue(1.111);
        expect(val).toBe("N 1° 6' 39'' E");
        val = getFormattedBearingValue(91.111);
        expect(val).toBe("S 88° 53' 20'' E");
        val = getFormattedBearingValue(181.111);
        expect(val).toBe("S 1° 6' 39'' W");
        val = getFormattedBearingValue(281.111);
        expect(val).toBe("N 78° 53' 20'' W");
    });

});
