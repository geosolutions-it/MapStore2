const {isString, isDate} = require('lodash');
const moment = require('moment');

const toTime = date => {
    if (!date) {
        return undefined;
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

const getNearestDate = (dates = [], target) => dates[getNearestDateIndex(dates, target)];
module.exports = {
    timeIntervalNumber,
    timeIntervalToSequence,
    analyzeIntervalInRange,
    getNearestDate,
    getNearestDateIndex

};
