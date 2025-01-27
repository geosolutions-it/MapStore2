/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { isNil, get } from 'lodash';
import React from 'react';
import reactStringReplace from "react-string-replace";
import moment from "moment";

import NumberFormat from '../../../I18N/Number';
import { handleLongTextEnhancer } from '../../../misc/enhancers/handleLongTextEnhancer';

import { dateFormats as defaultDateFormats } from "../../../../utils/FeatureGridUtils";

export const BooleanFormatter =  ({value} = {}) => !isNil(value) ? <span>{value.toString()}</span> : null;
export const StringFormatter = ({value} = {}) => !isNil(value) ? reactStringReplace(value, /(https?:\/\/\S+)/g, (match, i) => (
    <a key={match + i} href={match} target={"_blank"}>{match}</a>
)) : null;
export const NumberFormatter = ({value} = {}) => !isNil(value) ? <NumberFormat value={value} numberParams={{maximumFractionDigits: 17}}/> : null;
const DEFAULT_DATE_PART = "1970-01-01";
const DATE_INPUT_FORMAT = "YYYY-MM-DD[Z]";
export const DateTimeFormatter = ({value, format, type, useUTCOffset = true}) => {
    return !isNil(value)
        ? moment.utc(value).isValid() // geoserver sometimes returns UTC for time.
            ? useUTCOffset ? moment.utc(value).format(format) : moment(value).format(format)
            : type === 'time'
                ? moment(`${DEFAULT_DATE_PART}T${value}`).utc().format(format) // time format append default date part
                : type === "date" && value?.toLowerCase()?.endsWith("z")        // in case: date format and value ends with z
                    ? moment(value, DATE_INPUT_FORMAT).format(format)
                    : moment(value).format(format)
        : null;
};
// add long text handling to formatters of string, date and number
const EnhancedStringFormatter = handleLongTextEnhancer(StringFormatter);
const EnhancedNumberFormatter = handleLongTextEnhancer(NumberFormatter);
const enhancedDateTimeFormatter = handleLongTextEnhancer(DateTimeFormatter);

export const getDateTimeFormat = (dateFormats, localType) => get(dateFormats, localType) ?? defaultDateFormats[localType];

const createEnhancedDateTimeFormatterComponent = (type) => (props) => {
    const { dateFormats, useUTCOffset } = props?.row || {};
    const format = getDateTimeFormat(dateFormats, type);
    return enhancedDateTimeFormatter({
        ...props,
        useUTCOffset,
        format,
        type
    });
};

const EnhancedDateFormatter = createEnhancedDateTimeFormatterComponent('date');
const EnhancedTimeFormatter = createEnhancedDateTimeFormatterComponent('time');
const EnhancedDateTimeFormatter = createEnhancedDateTimeFormatterComponent('date-time');

export const register = {};

/**
 * Registers a formatter component with the given name.
 * @param {string} name the name of the formatter
 * @param {React.Component} formatter the formatter component
 */
export const registerFormatter = (name, formatter) => {
    register[name] = formatter;
};
export const unregisterFormatter = (name) => {
    delete register[name];
};
export const getFormatterByName = (name) => {
    return register[name];
};

/**
 * Returns a formatter component for the given field.
 * It returns the formatter component registered with the name `field.featureGridFormatter` or `field.formatter` if exists.
 * Otherwise it returns a formatter component based on the field type, using the `desc` object to get the `localType`.
 * **note**:
 * @param {object} desc describeFeatureType entry of the field (used for `localType`)
 * @param {object} field field object (used `featureGridFormatter` property). `featureGridFormatter` can be an object with the following properties:
 * - `name`: the name of the formatter component, registered with `registerFormatter` function.
 * - `directRender`: if set to true, the formatter component will be rendered directly.
 *    This helps some inner components like `OverlayTrigger` to work properly, but in this case it will not receive the `config` property, that can be used to configure the formatter with additional parameters.
 * @param {object} options options object. It can contain the following properties:
 * - `dateFormats`: object with date formats for date, time and date-time.
 * @returns {function} formatter component. the component receives the following props:
 * - `value`: the value to format
 * - `row`: the row object, with the entire feature.
 * - `config` (only if `directRender` is not `true`): the `featureGridFormatter` object in the field object.
 *
 */
export const getFormatter = (desc, {featureGridFormatter} = {}) => {
    const usedFormatter = featureGridFormatter;
    if (usedFormatter && getFormatterByName(usedFormatter?.name)) {
        const Formatter = getFormatterByName(usedFormatter.name);
        if (usedFormatter.directRender) {
            return Formatter;
        }
        return (props) => {
            return <Formatter {...props}  config={usedFormatter} />;
        };
    }
    // we should avoid to create component in formatters
    // eg:
    //   case 'date-time':
    //      const format = get(dateFormats, desc.localType) ?? defaultDateFormats[desc.localType];
    //      return ({value} = {}) => enhancedDateTimeFormatter({value, format, type: desc.localType});
    //
    // because this is causing a continuous mount/unmount
    // that makes impossible to double click to edit cells
    // instead we should pass just the component and include needed properties
    // inside the `row` prop
    switch (desc.localType) {
    case 'boolean':
        return BooleanFormatter;
    case 'int':
    case 'number':
        return EnhancedNumberFormatter;
    case 'string':
        return EnhancedStringFormatter;
    case 'Geometry':
        return () => null;
    case 'time':
        return EnhancedTimeFormatter;
    case 'date':
        return EnhancedDateFormatter;
    case 'date-time':
        return EnhancedDateTimeFormatter;
    default:
        return null;
    }
};


