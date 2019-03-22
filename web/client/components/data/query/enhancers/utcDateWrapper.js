/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withHandlers, withPropsOnChange } = require('recompose');


/**
 * Converts local date as it was UTC.
 * Useful wrapper for calendar tools that internally use date object localized,
 * but you want to use the date as it was UTC.
 * TODO: generalize for any timezone, using this formula `(new Date()).getTimezoneOffset() * 60000` + timezone offset
 */
module.exports = ({dateField = 'date', setDateField = 'onSetDate'}) => compose(
    withPropsOnChange([dateField], ({ date }) => ({
        date: date
            ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()) : undefined
    })),
    withHandlers({
        [setDateField]: ({ onSetDate = () => { } }) => date => onSetDate((date && date.getTime)
            ? new Date(Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
                date.getMilliseconds()
            )) : undefined)
    })
);
