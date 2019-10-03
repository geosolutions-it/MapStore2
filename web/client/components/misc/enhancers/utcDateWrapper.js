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

/**
 * Converts local date as it was UTC.
 * Useful wrapper for calendar tools that internally use date object localized,
 * but you want to use the date as it was UTC.
 * @param {object} options to pass to the enhancer
 * @param {string} options.dateTypeProp type choosed from ("date", "time", "date-time")
 * @param {string} options.dateProp date to use, it must be a UTC date, it can assume partial values like (02:00:00Z or 2019-02-03Z)
 * @param {string} options.setDateProp function to use to update the date
 * useUTCOffset is used to translate the data as it is defined in UTC.
 * for example when using the useUTCOffset=true 20 March 2019 will correspond to 2019-03-20T00:00:00.000Z
 * instead without it will be used as 2019-03-19T23:00:00.000Z (in cql filter), but in the UI it will be used the
 * actual timezone
*/

export default ({dateTypeProp = "type", dateProp = 'date', setDateProp = 'onSetDate'} = {}) => compose(
    withPropsOnChange([dateProp], ({ [dateProp]: date, [dateTypeProp]: type, useUTCOffset = true }) /* props */ => {
        let dateToParse = date;
        let datePart = "1970-01-01";
        let timePart = "00:00:00";
        if (!isDate(date) && isString(date)) {
            if (type === "time") {
                // if time attribute, the prop 'date' has already the Z to the end, 00:00:00Z
                dateToParse = new Date(`${datePart}T${date}`);
            }

            if (type === "date") {
                // if date attribute, the prop 'date' has already the Z to the end, 1970-01-01Z
                if (date.indexOf("Z") !== -1) {
                    dateToParse = date.substr(0, date.length - 1);
                }
                dateToParse = new Date(`${dateToParse}T${timePart}Z`);
            }
            if (type === "date-time") {
                dateToParse = new Date(date);
            }
        }
        let resultDate = dateToParse;
        if (dateToParse) {
            switch (type) {
            case "time": {
                timePart = getUTCTimePart(dateToParse);
                break;
            }
            case "date": {
                datePart = getUTCDatePart(dateToParse);
                break;
            }
            default: { // both
                timePart = getUTCTimePart(dateToParse);
                datePart = getUTCDatePart(dateToParse);
            }
            }
            resultDate = new Date(`${datePart}T${timePart}Z`);
            resultDate.setUTCMilliseconds(dateToParse.getUTCMilliseconds());
            const tzoffset = useUTCOffset ? getTimezoneOffsetMillis(resultDate) : 0;
            resultDate = new Date(resultDate.getTime() + tzoffset);
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
        [setDateProp]: ({[setDateProp]: changeVal, [dateTypeProp]: type, useUTCOffset = true} = {}) /* props */ => (date, stringDate) /* event */ => {
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
                const tzoffset = useUTCOffset ? getTimezoneOffsetMillis(date) : 0;
                const resultDate = new Date(newDate.getTime() - tzoffset);
                let retVal = resultDate;
                switch (type) {
                case "time": {
                    retVal = `${getUTCTimePart(retVal)}Z`;
                    break;
                }
                case "date": {
                    retVal = `${getUTCDatePart(retVal)}Z`;
                    break;
                }
                default: { break; }
                }
                changeVal(retVal, stringDate);
            }
        }
    })
);
