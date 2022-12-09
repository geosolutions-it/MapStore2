import { isString, isDate, get, castArray } from 'lodash';
import moment from 'moment';
import {getDateFormat} from './LocaleUtils';

const ROUND_RESOLUTION_REGEX = /PT?[\d\.]+[YMWDHMS]/;

const toTime = date => {
    if (!date) {
        return null;
    } else if (isString(date)) {
        return new Date(date).getTime();
    } else if (isDate(date)) {
        date.getTime();
    }
    return date;
};

/**
 * Filters the result of the describeDomain response which may get to the client as [start/end, start/end] i.e.
 * when time occurrences are expressed as intervals, the filter keeps only the reference point in the interval
 * (start or end) set by the customer
 * @param {string[]} dateArray array containing the domains expressed in [start/end, start/end] dates for a given interval
 * @param {string} snapType if snap to layer data is active - snaps to start or end point of the interval
 * @returns {string[]} array containing the domains expressed as [start, end] filtered by snapping instant points
 */
export const filterDateArray = (dateArray, snapType) => {
    if (snapType) {
        return dateArray.map(rawDate => {
            const [start, end] = rawDate.split("/");
            const snapMapping = {
                "start": start,
                "end": end
            };
            return snapMapping[snapType];
        });
    }
    return dateArray;
};

const getNearestDateIndex = (dates, rawTarget) => {
    const target = toTime(rawTarget);

    let nearest = Infinity;
    let winner = -1;

    dates.forEach( (rawDate, index) => {
        const date = toTime(rawDate);
        let distance = Math.abs(date - target);
        if (distance < nearest) {
            nearest = distance;
            winner = index;
        }
    });

    return winner;
};

/**
 * Determines the number of items in the interval
 * @param {string} start start date
 * @param {string} end end date
 * @param {string} duration duration
 */
const timeIntervalNumber = ({start, end, duration}) => {
    const milliseconds = moment.duration(duration).asMilliseconds();
    return ((new Date(end)).getTime() - (new Date(start)).getTime()) / milliseconds;
};


export const timeIntervalToSequence = ({start, end, duration}) => {
    const milliseconds = moment.duration(duration).asMilliseconds();
    let arr = [];
    let dt = new Date(start);
    let endDate = new Date(end);
    while (dt <= endDate) {
        arr.push(new Date(dt).toISOString());
        dt.setTime(dt.getTime() + milliseconds);
    }
    return arr;
};

export const timeIntervalToIntervalSequence = ({start, end, duration}) =>
    timeIntervalToSequence({start, end, duration}).map(d => ({
        start: new Date(d),
        end: new Date(new Date(d).getTime() + moment.duration(duration).asMilliseconds())
    }));
// TEST WITH 2017-03-11T17:43:50.000Z/2017-07-28T17:25:52.000Z/PT1S
export const analyzeIntervalInRange = (
    {start, end, duration} = {},
    range = {}
) => {
    const { start: rStart, end: rEnd } = range;
    if (!rStart || !rEnd) {
        return {
            count: timeIntervalNumber({start, end, duration}),
            start,
            end
        };
    }
    const d = moment.duration(duration).asMilliseconds();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const rs = new Date(rStart).getTime();
    const re = new Date(rEnd).getTime();
    const x1 = Math.ceil((rs - s) / d); // index of the first item in range
    const x2 = Math.floor((re - s) / d);  // index of the first item in range
    const MX = Math.floor((e - s) / d); // max index

    if (x1 >= 0 && x2 <= MX) {
        // there is some data in the range
        const count = x2 - x1;
        return {
            start: new Date(s + Math.max(0, x1) * d),
            end: new Date(s + Math.min(MX, x2) * d),
            count
        };
    }
    return {
        count: timeIntervalNumber({ start, end, duration }),
        start,
        end
    };

};

/**
 * Rounds a duration ISO string to the bigger unit.
 * @example
 * P23DT23H => P23D
 * PT20H10M2S => PT20H
 * P1W2DT10H2M2.45S => P1W
 *
 * @param {string} iso the duration iso string
 */
export const roundResolution = (iso) => iso.match(ROUND_RESOLUTION_REGEX)[0];

/**
 * Returns an object that contains resolution.
 * The resolution returned is a rounded iso duration string of the period that can be contained `max` times in the range provided.
 *
 * @param {object} param0 range object
 * @param {number} max max items in range
 */
export const roundRangeResolution = ({start, end} = {}, max) => {
    const sms = new Date(start);
    const ems = new Date(end);
    const dms = Math.floor(ems.getTime() - sms.getTime()) / max;
    const dISO = moment.duration(dms).toISOString();
    const resolution = roundResolution(dISO);
    return {
        range: { // TODO: snap range to start / end of periods (i.e 1H period should start from 13:00, not from 13:12:54)
            start,
            end
        },
        resolution // TODO: snap to human friendly values (...0.1, 0.2, 0.5, 1, 2, 5, 10 ...)
    };
};

export const getNearestDate = (dates = [], target, snapType) => {
    const filteredDates = filterDateArray(dates, snapType);
    return filteredDates[getNearestDateIndex(filteredDates, target)];
};

export const isTimeDomainInterval = values => values && values.indexOf && values.indexOf("--") > 0;

/**
 * Gets 2 dates (Date object or ISO8601) and returns then in the form `{start: d1, end: d2}
 * Sorting them accordingly.
 * @param {string|Date} startTime the first value
 * @param {string|Date} endTime the second date
 */
export const getStartEnd = (startTime, endTime) => {
    const diff = moment(startTime).diff(endTime);
    return {
        start: diff >= 0 ? endTime : startTime,
        end: diff >= 0 ? startTime : endTime
    };
};

/**
 * get time zone offset for a given date (september and march have different tzoffset)
 * @param {object} date
 * @return {number} the offset in milliseconds
*/
export const getTimezoneOffsetMillis = (date) => {
    return (date).getTimezoneOffset() * 60000;
};

/**
 * @param {Date|string} date to parse
 * @return {string} time part of the TimeStamp
*/
export const getUTCTimePart = (date) => {
    let dateToParse = date;
    if (!isDate(date) & isString(date)) {
        dateToParse = new Date(date);
    }
    let hours = dateToParse.getUTCHours();
    hours = hours < 10 ? "0" + hours : hours;
    let minutes = dateToParse.getUTCMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let seconds = dateToParse.getUTCSeconds();
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return `${hours}:${minutes}:${seconds}`;
};

/**
 * @param {Date|string} date to parse
 * @return {string} date part of the TimeStamp
*/
export  const getUTCDatePart = (date) => {
    let dateToParse = date;
    if (!isDate(date) & isString(date)) {
        dateToParse = new Date(date);
    }
    let month = dateToParse.getUTCMonth() + 1;
    let day = dateToParse.getUTCDate();
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    return `${dateToParse.getUTCFullYear()}-${month}-${day}`;
};

/**
 * generate the format for parsing a Date
 * @param {string} locale to get date format
 * @param {string} type of the dateTime attribute ("date", "time", "date-time")
 * @return {string} format to be returned
*/
export const getDateTimeFormat = (locale, type) => {
    const dateFormat = getDateFormat(locale);
    const timeFormat = "HH:mm:SS";
    switch (type) {
    case "time":
        return timeFormat;
    case "date":
        return dateFormat;
    default:
        return dateFormat + " " + timeFormat;
    }
};

/**
 * Converts the Multidim Extensions GetDomain Response into an array of
 * dimensions object to add to the layer/dimension internal representation.
 * The resulting objects has a shape like this:
 * ```javascript
 * domains = [{
 *     name: "time",
 *     domain: {},
 *     source: {
 *         type: "multidim-extension",
 *         version: ""
 *
 *     }
 *
 * }]
 * ```
 * @param {object} domains the domains object (JSON version of the XML)
 * @param {string} url of the service
 */
export const domainsToDimensionsObject = ({ Domains = {} } = {}, url) => {
    let dimensions = castArray(Domains.DimensionDomain || []).concat();
    let version = Domains['@version'] || Domains.version;
    const bbox = get(Domains, 'SpaceDomain.BoundingBox');
    if (bbox) {
        dimensions.push({
            Identifier: "space",
            Domain: bbox
        });
    }
    return dimensions.map(({ Identifier: name, Domain: domain }) => ({
        source: {
            type: "multidim-extension",
            version,
            url
        },
        name,
        domain
    }));
};

/**
 * Given an start and end date "03-01-2000" "20-12-2020"
 * and a date intervals array ["02-01-2000", "04-02-2000", "24-12-2020"]
 * filters dates array for dates falling within the start/end date range ["04-01-2000"]
 * this function is used when dealing with intervals that sometimes start or end
 * outside the specifed animation dates range
 * @param {string[]} datesArray the date intervals array
 * @param {string} startRawDate the reference start date used for filtering
 * @param {string} endRawDate the reference end date used for filtering
 */
export const getDatesInRange = (datesArray, startRawDate, endRawDate) => {
    const startRefDate = toTime(startRawDate);
    const endRefDate = toTime(endRawDate);
    const filteredDatesArray = datesArray.reduce((acc, cur) => {
        const refDate = toTime(cur);
        if (toTime(startRefDate) < refDate && toTime(endRefDate) > refDate) {
            return [...acc, cur];
        }
        return [...acc];
    }, []);
    return filteredDatesArray;
};

/**
 * Given an array of dates or dates intervals in strings
 * example ["2016-02-23T06:00:00.000Z", "2016-02-23T06:00:00.000Z/2017-02-23T06:00:00.000Z"]
 * sorts date in ascending order and return the two extremes [high, low] of the dates
 * @param {string[]} datesArray the date intervals array
 * @param {string} startRawDate the reference start date used for filtering
 * @param {string} endRawDate the reference end date used for filtering
 */
export const getLowestAndHighestDates = (datesArray) =>  {
    const sortedDatesArray = datesArray.reduce((acc, cur) => {
        if (cur.indexOf('/') !== -1) {
            const [startIntervalDate, endIntervalDate] = cur.split('/');
            return [...acc, startIntervalDate, endIntervalDate];
        }
        return [...acc, cur];
    }, []).sort();
    return [sortedDatesArray[0], sortedDatesArray[sortedDatesArray.length - 1]];
};

/**
 * Given a datetime applies a buffer (either adding or removing time) and
 * returns the buffered datetime as string (ISO 8061 format)
 * @param {string} timeString the reference datetime to apply the buffer
 * @param {number} timeBuffer the buffer amount time (expressed in seconds)
 * @param {string} bufferType the type of buffer (add or removed secs from ref time)
 * @returns {string} the buffered reference time with the amount of seconds specified
 */
export const getBufferedTime = (timeString, timeBuffer, bufferType) => {
    const refDate = moment(timeString);
    const bufferedDate = bufferType === 'add' ? refDate.add(timeBuffer, 'seconds') : refDate.subtract(timeBuffer, 'seconds');
    return bufferedDate.toISOString();
};
