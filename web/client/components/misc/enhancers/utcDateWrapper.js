/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withHandlers, withPropsOnChange } = require('recompose');
const {isString, isDate} = require('lodash');

const {
    getTimezoneOffset,
    getUTCTimeParts,
    getUTCDateParts
} = require('../../../utils/TimeUtils');

/**
 * Converts local date as it was UTC.
 * Useful wrapper for calendar tools that internally use date object localized,
 * but you want to use the date as it was UTC.
 * @param {object} options to pass to the enhancer
 * @param {string} options.dateType type choosed from ("date", "time", "date-time")
 * @param {string} options.dateField date to use
 * @param {string} options.setDateField function to use to update the date
 * useUTCOffset is used to translate the data as it is defined in UTC.
 * for example when using the useUTCOffset=true 20 March 2019 will correspond to 2019-03-20T00:00:00.000Z
 * instead without it will be used as 2019-03-19T23:00:00.000Z (in cql filter), but in the UI it will be used the
 * actual timezone
 */
module.exports = ({dateType = "type", dateField = 'date', setDateField = 'onSetDate'} = {}) => compose(
    withPropsOnChange([dateField], ({ [dateField]: date, [dateType]: type, useUTCOffset = true }) /*props*/ => {
        let dateToParse = date;
        if (!isDate(date) & isString(date)) {
            dateToParse = new Date(date);
        }
        let resultDate = dateToParse;
        let datePart = "1970-01-01";
        let timePart = "00:00:00";
        if (dateToParse) {
            switch (type) {
                case "time": {
                    timePart = getUTCTimeParts(dateToParse);
                    break;
                }
                case "date": {
                    datePart = getUTCDateParts(dateToParse);
                    break;
                }
                default: { // both
                    timePart = getUTCTimeParts(dateToParse);
                    datePart = getUTCDateParts(dateToParse);
                }
            }
            resultDate = new Date(`${datePart}T${timePart}Z`);
            resultDate.setUTCMilliseconds(dateToParse.getUTCMilliseconds());
            const tzoffset = useUTCOffset ? getTimezoneOffset(resultDate) : 0;
            resultDate = new Date(resultDate.getTime() + tzoffset);
        }
        return {
            [dateField]: resultDate
        };
    }),
    withHandlers({
        [setDateField]: ({[setDateField]: changeVal, useUTCOffset = true} = {}) /*props*/ => (date, stringDate) /*event*/ => {
            if (!date) {
                changeVal(null);
            } else {
                const newDate = new Date(Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                    date.getUTCHours(),
                    date.getUTCMinutes(),
                    date.getUTCSeconds(),
                    date.getUTCMilliseconds()
                ));
                const tzoffset = useUTCOffset ? getTimezoneOffset(date) : 0;
                const resultDate = new Date(newDate.getTime() - tzoffset);
                changeVal((date && date.getTime) ? resultDate : undefined, stringDate);
            }
        }
    })
);
