const {isString, isDate, get, castArray} = require('lodash');
const moment = require('moment');
const LocaleUtils = require('./LocaleUtils');

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


const timeIntervalToSequence = ({start, end, duration}) => {
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

const timeIntervalToIntervalSequence = ({start, end, duration}) =>
    timeIntervalToSequence({start, end, duration}).map(d => ({
        start: new Date(d),
        end: new Date(new Date(d).getTime() + moment.duration(duration).asMilliseconds())
    }));
// TEST WITH 2017-03-11T17:43:50.000Z/2017-07-28T17:25:52.000Z/PT1S
const analyzeIntervalInRange = (
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
const roundResolution = (iso) => iso.match(ROUND_RESOLUTION_REGEX)[0];

/**
 * Returns an object that contains resolution.
 * The resolution returned is a rounded iso duration string of the period that can be contained `max` times in the range provided.
 *
 * @param {object} param0 range object
 * @param {number} max max items in range
 */
const roundRangeResolution = ({start, end} = {}, max) => {
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

const getNearestDate = (dates = [], target) => dates[getNearestDateIndex(dates, target)];

const isTimeDomainInterval = values => values && values.indexOf && values.indexOf("--") > 0;

/**
 * Gets 2 dates (Date object or ISO8601) and returns then in the form `{start: d1, end: d2}
 * Sorting them accordingly.
 * @param {string|Date} startTime the first value
 * @param {string|Date} endTime the second date
 */
const getStartEnd = (startTime, endTime) => {
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
const getTimezoneOffsetMillis = (date) => {
    return (date).getTimezoneOffset() * 60000;
};

/**
 * @param {Date|string} date to parse
 * @return {string} time part of the TimeStamp
*/
const getUTCTimePart = (date) => {
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
const getUTCDatePart = (date) => {
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
const getDateTimeFormat = (locale, type) => {
    const dateFormat = LocaleUtils.getDateFormat(locale);
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
const domainsToDimensionsObject = ({ Domains = {} } = {}, url) => {
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

module.exports = {
    getDateTimeFormat,
    getTimezoneOffsetMillis,
    domainsToDimensionsObject,
    getUTCTimePart,
    getUTCDatePart,
    timeIntervalNumber,
    timeIntervalToSequence,
    timeIntervalToIntervalSequence,
    analyzeIntervalInRange,
    getNearestDate,
    getNearestDateIndex,
    roundResolution,
    roundRangeResolution,
    isTimeDomainInterval,
    getStartEnd
};
