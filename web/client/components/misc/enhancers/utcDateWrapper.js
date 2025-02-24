/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withHandlers, withPropsOnChange } from 'recompose';
import {isString, isDate} from 'lodash';
import moment from 'moment';

import {
    getTimezoneOffsetMillis,
    getUTCTimePart,
    getUTCDatePart
} from '../../../utils/TimeUtils';

const DEFAULT_DATE_PART = "1970-01-01";
const DEFAULT_TIME_PART = "00:00:00";
/**
 * Converts local date as it was UTC.
 * Useful wrapper for calendar tools that internally use date object localized,
 * but you want to use the date as it was UTC.
 * @param {object} options to pass to the enhancer
 * @param {string} options.dateTypeProp type choosed from ("date", "time", "date-time")
 * @param {string} options.dateProp date to use, it must be a UTC date, it can assume partial values like (02:00:00Z or 2019-02-03Z)
 * @param {string} options.setDateProp function to use to update the date
 * @param {string} options.datePropFormat format of the dateProp. 'full-iso' ( e.g. 2019-02-03T02:00:00Z), 'short' (e.g. 2019-02-03Z or 02:00:00Z). default is short
 * useUTCOffset is used to translate the data as it is defined in UTC.
 * for example when using the useUTCOffset=true 20 March 2019 will correspond to 2019-03-20T00:00:00.000Z
 * instead without it will be used as 2019-03-19T23:00:00.000Z (in cql filter), but in the UI it will be used the
 * actual timezone
*/

export default ({
    dateTypeProp = "type",
    dateProp = 'date',
    setDateProp = 'onSetDate'
} = {}) => compose(
    withPropsOnChange([dateProp], ({ [dateProp]: date, [dateTypeProp]: type, useUTCOffset = true }) => {
        let dateToParse = date;
        let datePart = DEFAULT_DATE_PART;
        let timePart = DEFAULT_TIME_PART;
        if (!isDate(date) && isString(date)) {
            if (type === "time") {
                // if time attribute, the prop 'date' has already the Z to the end, 00:00:00Z
                const tt = date.split("T")?.[1] || date;
                dateToParse = new Date(`${datePart}T${tt}`);
            }

            if (type === "date") {
                let dd = date.split("T")?.[0] || date;
                // if date attribute, the prop 'date' has already the Z to the end, 1970-01-01Z
                if (date.indexOf("Z") !== -1) {
                    dd = date.substr(0, date.length - 1);
                }
                dateToParse = new Date(`${dd}T${timePart}Z`);
            }
            if (type === "date-time") {
                dateToParse = new Date(date);
            }
        }
        let resultDate = dateToParse;
        if (isDate(dateToParse)) {
            switch (type) {
            case "time": {
                timePart = getUTCTimePart(dateToParse);
                break;
            }
            case "date": {
                datePart = getUTCDatePart(dateToParse);
                break;
            }
            case "date-time":
            default: { // both
                timePart = getUTCTimePart(dateToParse);
                datePart = getUTCDatePart(dateToParse);
            }
            }
            resultDate = new Date(`${datePart}T${timePart}Z`);
            resultDate.setUTCMilliseconds(dateToParse.getUTCMilliseconds());
            const timeZoneOffset = useUTCOffset ? getTimezoneOffsetMillis(resultDate) : 0;
            resultDate = new Date(resultDate.getTime() + timeZoneOffset);
        }
        return {
            [dateProp]: resultDate,
            /* used to initialize the time part to 00:00 for date-time
             * it is not needed in the other cases since we manage them in hte handler below
            */
            defaultCurrentDate: type === "date-time" ? moment().startOf("day").toDate() : undefined
        };
    }),
    withHandlers({
        [setDateProp]: ({[setDateProp]: changeVal,  datePropFormat = "short", [dateTypeProp]: type, useUTCOffset = true} = {}) => (date, stringDate, order) => {
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
                const timeZoneOffset = useUTCOffset ? getTimezoneOffsetMillis(date) : 0;
                const resultDate = new Date(newDate.getTime() - timeZoneOffset);

                switch (datePropFormat) {
                case "full-iso": {
                    changeVal(resultDate.toISOString(), stringDate, order);
                    break;
                }
                case "short": {
                    switch (type) {
                    case "time": {
                        changeVal(`${getUTCTimePart(resultDate)}Z`, stringDate, order);
                        break;
                    }
                    case "date": {
                        changeVal(`${getUTCDatePart(resultDate)}Z`, stringDate, order);
                        break;
                    }
                    case "date-time": {
                        changeVal(resultDate.toISOString(), stringDate, order);
                        break;
                    }
                    default: {
                        changeVal(resultDate, stringDate, order);
                        break;
                    }
                    }
                    break;
                }
                default: {
                    break;
                }
                }
            }
        }})
);
