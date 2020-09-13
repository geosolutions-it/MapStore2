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
    degToDms,
    convertUom,
    isValidGeometry
} = require('../MeasureUtils');
const {
    lineFeature,
    lineFeatureInvalid,
    lineFeatureInvalid2,
    polyFeatureClosed,
    polyFeatureNotClosedInvalid,
    polyFeatureNotClosedInvalid2
} = require('../../test-resources/drawsupport/features');


describe('MeasureUtils', () => {
    beforeEach( () => {

    });
    afterEach(() => {

    });
    it('test conversion km to mi', () => {
        const val = convertUom(1, "km", "mi");
        expect(val).toBe(0.62137121212121);
    });
    it('test conversion meters to feet', () => {
        const val = convertUom(1, "m", "ft");
        expect(val).toBe(3.28084);
    });
    it('test conversion meters to kilometers', () => {
        const val = convertUom(1, "m", "km");
        expect(val).toBe(0.001);
    });
    it('test conversion meters to miles', () => {
        const val = convertUom(1, "m", "mi");
        expect(val).toBe(0.000621371);
    });
    it('test conversion meters to nauticalmiles', () => {
        const val = convertUom(1, "m", "nm");
        expect(val).toBe(0.000539956803);
    });
    it('test conversion squaremeters to squarefeet', () => {
        const val = convertUom(1, "sqm", "sqft");
        expect(val).toBe(10.76391);
    });
    it('test conversion squaremeters to squarekilometers', () => {
        const val = convertUom(1, "sqm", "sqkm");
        expect(val).toBe(0.000001);
    });
    it('test conversion squaremeters to squaremiles', () => {
        const val = convertUom(1, "sqm", "sqmi");
        expect(val).toBe(3.8610215854245e-7);
    });
    it('test conversion squaremeters to squarenauticalmiles', () => {
        const val = convertUom(1, "sqm", "sqnm");
        expect(val).toBe(2.91181e-7);
    });
    it('test conversion squarefeets to squarekilometers', () => {
        const val = convertUom(1, "sqft", "sqkm");
        expect(val).toBe(9.2903043596611e-8);
    });
    it('test conversion squarekilometers to squaremiles', () => {
        const val = convertUom(1, "sqkm", "sqmi");
        expect(val).toBe(0.38610215854245);
    });
    it('test conversion squaremiles to squarenauticalmiles', () => {
        const val = convertUom(1, "sqmi", "sqnm");
        expect(val).toBe(0.75415532795574);
    });
    it('test conversion squarenauticalmiles to squaremiles', () => {
        const val = convertUom(1, "sqnm", "sqmi");
        expect(val).toBe(1.325986786715);
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
    it('test true bearing getFormattedBearingValue', () => {
        const trueBearing = {measureTrueBearing: true, fractionDigits: 0};
        let val = getFormattedBearingValue(1.111, trueBearing);
        expect(val).toBe("001° T");
        val = getFormattedBearingValue(91.111, trueBearing);
        expect(val).toBe("091° T");
        val = getFormattedBearingValue(181.111, {...trueBearing, fractionDigits: 2});
        expect(val).toBe("181.11° T");
        val = getFormattedBearingValue(320.58921, {...trueBearing, fractionDigits: 4});
        expect(val).toBe("320.5892° T");
    });
    it('testing isValidGeometry() with all valid coords (line geom)', () => {
        const isValid = isValidGeometry(lineFeature.geometry);
        expect(isValid).toBe(true);
    });
    it('testing isValidGeometry() with some invalid coords (line geom) 2 point valid', () => {
        const isValid = isValidGeometry(lineFeatureInvalid.geometry);
        expect(isValid).toBe(true);
    });
    it('testing isValidGeometry() with some invalid coords (line geom) 1 point valid', () => {
        const isValid = isValidGeometry(lineFeatureInvalid2.geometry);
        expect(isValid).toBe(false);
    });
    it('testing isValidGeometry() with all valid coords (polygon geom)', () => {
        const isValid = isValidGeometry(polyFeatureClosed.geometry);
        expect(isValid).toBe(true);
    });
    it('testing isValidGeometry() with some invalid coords (polygon geom) 3 point valid', () => {
        const isValid = isValidGeometry(polyFeatureNotClosedInvalid.geometry);
        expect(isValid).toBe(true);
    });
    it('testing isValidGeometry() with some invalid coords (polygon geom) only 2 point valid', () => {
        const isValid = isValidGeometry(polyFeatureNotClosedInvalid2.geometry);
        expect(isValid).toBe(false);
    });

});
