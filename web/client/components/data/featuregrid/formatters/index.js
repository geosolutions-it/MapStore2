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
import { dateFormats as defaultDateFormats } from "../../../../utils/FeatureGridUtils";

export const getFormatter = (desc, dateFormats) => {
    if (desc.localType === 'boolean') {
        return ({value} = {}) => !isNil(value) ? <span>{value.toString()}</span> : null;
    } else if (['int', 'number'].includes(desc.localType)) {
        return ({value} = {}) => !isNil(value) ? <NumberFormat value={value} numberParams={{maximumFractionDigits: 17}}/> : null;
    } else if (desc.localType === 'string') {
        return ({value} = {}) => !isNil(value) ? reactStringReplace(value, /(https?:\/\/\S+)/g, (match, i) => (
            <a key={match + i} href={match} target={"_blank"}>{match}</a>
        )) : null;
    } else if (desc.localType === 'Geometry') {
        return () => null;
    } else if (['date', 'date-time', 'time'].includes(desc.localType)) {
        const format = dateFormats[desc.localType] ?? defaultDateFormats[desc.localType];
        return ({value} = {}) => {
            return !isNil(value) ? moment(value, defaultDateFormats[desc.localType]).format(format) : null;
        };
    }
    return null;
};

export default {
    getFormatter
};
