/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    getDateTimeFormat,
    getUTCTimePart,
    getUTCDatePart,
    roundResolution,
    domainsToDimensionsObject,
    filterDateArray,
    getNearestDate,
    getDatesInRange,
    getLowestAndHighestDates,
    getStartEndDomainValues,
    roundRangeResolution,
    getLocalTimePart,
    parseDateTimeTemplate,
    getDateFromTemplate
} from '../TimeUtils';

import { describeDomains } from '../../api/MultiDim';
import moment from 'moment';

const DATES_INTERVAL_ARRAY = ['2021-11-02T23:00:00.000Z/2021-12-29T23:00:00.000Z', '2021-11-08T23:00:00.000Z/2021-12-21T23:00:00.000Z'];
const DATES_ARRAY = ['2021-10-01T22:00:00.000Z', '2021-10-21T22:00:00.000Z', '2021-10-29T22:00:00.000Z', '2021-11-21T23:00:00.000Z', '2021-11-21T23:00:00.000Z', '2021-11-29T23:00:00.000Z', '2021-11-29T23:00:00.000Z', '2021-12-21T23:00:00.000Z', '2021-12-29T23:00:00.000Z', '2021-12-29T23:00:00.000Z'];
const REF_RANGE_START_DATE = '2021-10-16T04:58:00.267Z';
const REF_RANGE_END_DATE = '2021-12-28T23:57:21.571Z';
const DATES_IN_RANGE_ARRAY = ['2021-10-21T22:00:00.000Z', '2021-10-29T22:00:00.000Z', '2021-11-21T23:00:00.000Z', '2021-11-21T23:00:00.000Z', '2021-11-29T23:00:00.000Z', '2021-11-29T23:00:00.000Z', '2021-12-21T23:00:00.000Z'];

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
    it('filterDateArray snap to start', () => {
        expect(filterDateArray(DATES_INTERVAL_ARRAY, 'start')[0]).toBe('2021-11-02T23:00:00.000Z');
        expect(filterDateArray(DATES_INTERVAL_ARRAY, 'start')[1]).toBe('2021-11-08T23:00:00.000Z');
    });
    it('filterDateArray snap to end', () => {
        expect(filterDateArray(DATES_INTERVAL_ARRAY, 'end')[0]).toBe('2021-12-29T23:00:00.000Z');
        expect(filterDateArray(DATES_INTERVAL_ARRAY, 'end')[1]).toBe('2021-12-21T23:00:00.000Z');
    });
    it('getNearestDate snap to start', () => {
        expect(getNearestDate(DATES_INTERVAL_ARRAY, '2021-11-02T23:00:00.000Z', 'start')).toBe('2021-11-02T23:00:00.000Z');
    });
    it('getNearestDate snap to end', () => {
        expect(getNearestDate(DATES_INTERVAL_ARRAY, '2021-12-28T23:00:00.000Z', 'end')).toBe('2021-12-29T23:00:00.000Z');
    });
    it('getDates in range', () => {
        expect(getDatesInRange(DATES_ARRAY, REF_RANGE_START_DATE, REF_RANGE_END_DATE)).toEqual(DATES_IN_RANGE_ARRAY);
    });
    it('getLowestAndHighestDates', () => {
        expect(getLowestAndHighestDates([...DATES_ARRAY, DATES_INTERVAL_ARRAY])[0]).toBe('2021-10-01T22:00:00.000Z');
        expect(getLowestAndHighestDates([...DATES_ARRAY, DATES_INTERVAL_ARRAY])[1]).toBe('2021-12-29T23:00:00.000Z');
    });
    it('getStartEndDomainValues', () => {
        expect(getStartEndDomainValues('2021-10-01T22:00:00.000Z')).toEqual(
            ['2021-10-01T22:00:00.000Z', undefined]
        );
        expect(getStartEndDomainValues(DATES_ARRAY)).toEqual(
            ['2021-10-01T22:00:00.000Z', '2021-12-29T23:00:00.000Z']
        );
        expect(getStartEndDomainValues(DATES_INTERVAL_ARRAY)).toEqual(
            ['2021-11-02T23:00:00.000Z', '2021-12-29T23:00:00.000Z']
        );
        expect(getStartEndDomainValues([...DATES_ARRAY, ...DATES_INTERVAL_ARRAY])).toEqual(
            ['2021-10-01T22:00:00.000Z', '2021-12-29T23:00:00.000Z']
        );
        const samples = [
            // multiple values
            {input: '2001-01-01T22:00:00.000Z,2021-12-29T23:00:00.000Z', expected: ['2001-01-01T22:00:00.000Z', '2021-12-29T23:00:00.000Z']},
            {input: '2001-02-01T22:00:00.000Z,2021-12-29T23:00:00.000Z,2021-12-29T23:00:00.000Z', expected: ['2001-02-01T22:00:00.000Z', '2021-12-29T23:00:00.000Z']},
            {input: '2001-03-01T22:00:00.000Z,2021-12-29T23:00:00.000Z,2021-12-29T23:00:00.000Z,2021-10-01T22:00:00.000Z', expected: ['2001-03-01T22:00:00.000Z', '2021-12-29T23:00:00.000Z']},
            // interval
            {input: '2001-10-01T22:00:00.000Z/2025-12-29T23:00:00.000Z', expected: ['2001-10-01T22:00:00.000Z', '2025-12-29T23:00:00.000Z']},
            // multiple intervals
            {input: '2001-10-01T22:00:00.000Z/2025-12-29T23:00:00.000Z,1999-12-29T23:00:00.000Z/2022-12-29T23:00:00.000Z', expected: ['1999-12-29T23:00:00.000Z', '2025-12-29T23:00:00.000Z']},
            // domain interval
            {input: '2001-01-01T22:00:00.000Z--2021-12-29T23:00:00.000Z', expected: ['2001-01-01T22:00:00.000Z', '2021-12-29T23:00:00.000Z']}
        ];


        samples.map(({input, expected}) => {
            expect(getStartEndDomainValues(input)).toEqual(expected);
        });
    });
    it('roundRangeResolution', () => {
        // check if same start and end date are passed
        expect(roundRangeResolution({ start: '2021-10-01T22:00:00.000Z', end: '2021-10-01T22:00:00.000Z'}, 20)).toEqual({
            range: {
                start: '2021-10-01T22:00:00.000Z',
                end: '2021-10-01T22:00:00.000Z'
            },
            resolution: 'P0D'
        }); // extreme case, to check if it works
        expect(roundRangeResolution({ start: '2021-10-01T22:00:00.000Z', end: '2022-10-01T22:00:00.000Z'}, 12)).toEqual({
            range: {
                start: '2021-10-01T22:00:00.000Z',
                end: '2022-10-01T22:00:00.000Z'
            },
            resolution: 'PT730H'
        });
        expect(roundRangeResolution({ start: '2021-10-01T22:00:00.000Z', end: '2021-10-01T23:00:00.000Z'}, 6)).toEqual({
            range: {
                start: '2021-10-01T22:00:00.000Z',
                end: '2021-10-01T23:00:00.000Z'
            },
            resolution: 'PT10M'
        });
    });
    it('test getLocalTimePart', () => {
        expect(getLocalTimePart(new Date("2018-01-09T01:00:00"))).toBe("01:00:00");
        expect(getLocalTimePart(new Date("2018-01-09T12:00:00"))).toBe("12:00:00");
    });
    it('test parseDateTimeTemplate', () => {
        let parsedDateTime = parseDateTimeTemplate("{now}+P1Y1M5D");
        expect(parsedDateTime.placeholderKey).toBe('now');
        expect(parsedDateTime.sign).toBe('+');
        expect(parsedDateTime.durationExp).toBe('P1Y1M5D');
        parsedDateTime = parseDateTimeTemplate("{thisWeekStart}");
        expect(parsedDateTime.placeholderKey).toBe('thisWeekStart');
        expect(parsedDateTime.sign).toBeFalsy();
        expect(parsedDateTime.durationExp).toBeFalsy();
    });
    it('test getDateFromTemplate', () => {
        const getDate = (_moment, sign, duration) => {
            let date = _moment;
            if (sign && duration) {
                date = _moment[sign](moment.duration(duration).asSeconds(), "seconds");
            }
            return date;
        };
        const isSame = (dates) => {
            const [date1, date2] = dates.map(date => date.format('YYYY-MM-DD HH:mm:ss'));
            return expect(date1).toEqual(date2);
        };

        let duration = "P1Y1M5D";
        const value = `{now}+${duration}`;
        let dateFromTemplate = getDateFromTemplate(value);
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment(), 'add', duration)]);
        dateFromTemplate = getDateFromTemplate("{thisWeekStart}");
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment().startOf('isoWeek'))]);

        dateFromTemplate = getDateFromTemplate("{thisWeekEnd}");
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment().endOf('isoWeek'))]);

        dateFromTemplate = getDateFromTemplate("{thisMonthStart}");
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment().startOf('month'))]);

        dateFromTemplate = getDateFromTemplate("{thisMonthEnd}");
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment().endOf('month'))]);

        dateFromTemplate = getDateFromTemplate("{thisYearStart}");
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment().startOf('year'))]);

        dateFromTemplate = getDateFromTemplate("{thisYearEnd}");
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment().endOf('year'))]);

        duration = "{today}";
        dateFromTemplate = getDateFromTemplate(duration);
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment().startOf('day'))]);

        dateFromTemplate = getDateFromTemplate("{today}", "end");
        expect(dateFromTemplate).toBeTruthy();
        isSame([moment(dateFromTemplate), getDate(moment().endOf('day'))]);
    });
});
