/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {
    getDateTimeFormat,
    getUTCTimePart,
    getUTCDatePart,
    roundResolution,
    domainsToDimensionsObject
} = require('../TimeUtils');
import { describeDomains } from '../../api/MultiDim';

describe('TimeUtils', () => {
    it('roundResolution', () => {
        const TEST_DURATION = [
            ["P23DT23H", "P23D"],
            ["P1W2DT10H2M2.45S", "P1W"],
            ["PT20H10M2S", "PT20H"],
            ["P24D", "P24D"],
            ["PT14M", "PT14M"],
            ["PT14M10.2S", "PT14M"],
            ["P1M", "P1M"],
            ["PT1M", "PT1M"],
            ["P23.5DT23H", "P23.5D"],
            ["PT0.0000005S", "PT0.0000005S"]
        ];
        TEST_DURATION.map(([testString, expected]) => {
            expect(roundResolution(testString)).toBe(expected);
        });
    });
    it('test getUTCDatePart', () => {
        expect(getUTCDatePart(new Date("2018-01-09T23:00:00Z"))).toBe("2018-01-09");
        expect(getUTCDatePart(new Date("2018-01-09T00:00:00Z"))).toBe("2018-01-09");
        expect(getUTCDatePart(new Date("2020-04-15T06:30:00Z"))).toBe("2020-04-15");
        expect(getUTCDatePart(new Date("2020-10-09T01:00:00Z"))).toBe("2020-10-09");
        expect(getUTCDatePart(new Date("2021-01-09T00:00:00Z"))).toBe("2021-01-09");
    });
    it('test getUTCTimePart', () => {
        expect(getUTCTimePart(new Date("2019-03-15T08:30:00Z"))).toBe("08:30:00");
        expect(getUTCTimePart(new Date("2018-01-09T01:00:00Z"))).toBe("01:00:00");
        expect(getUTCTimePart(new Date("2018-01-09T00:03:00Z"))).toBe("00:03:00");
    });
    it('test getDateTimeFormat', () => {
        // date
        expect(getDateTimeFormat("en-US", "date")).toBe("MM/DD/YYYY");
        expect(getDateTimeFormat("it-IT", "date")).toBe("DD/MM/YYYY");
        // time
        expect(getDateTimeFormat("en-US", "time")).toBe("HH:mm:SS");
        expect(getDateTimeFormat("it-IT", "time")).toBe("HH:mm:SS");
        // date-time
        expect(getDateTimeFormat("en-US", "date-time")).toBe("MM/DD/YYYY HH:mm:SS");
        expect(getDateTimeFormat("it-IT", "date-time")).toBe("DD/MM/YYYY HH:mm:SS");
    });
    it('domainsToDimensionsObject', done => {
        describeDomains('base/web/client/test-resources/wmts/DescribeDomains.xml', "test:layer")
            .subscribe(result => {
                const dimensions = domainsToDimensionsObject(result);
                dimensions.map( ({source}) => expect(source.version).toBeFalsy());
            },
            e => done(e),
            () => done()
            );
    });
    it('domainsToDimensionsObject 1.1', done => {
        describeDomains('base/web/client/test-resources/wmts/DescribeDomains1.1.xml', "test:layer")
            .subscribe(result => {
                const dimensions = domainsToDimensionsObject(result);
                dimensions.map(({ source }) => expect(source.version).toBe("1.1"));
            },
            e => done(e),
            () => done()
            );
    });

});
