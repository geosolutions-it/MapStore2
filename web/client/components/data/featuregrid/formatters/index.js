/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {isNil} = require('lodash');
const NumberFormat = require('../../../I18N/Number');

module.exports = {
    getFormatter: (desc) => {
        if (desc.localType === 'boolean') {
            return ({value} = {}) => !isNil(value) ? <span>{value.toString()}</span> : null;
        } else if (['int', 'number'].includes(desc.localType)) {
            return ({value} = {}) => !isNil(value) ? <NumberFormat value={value} numberParams={{maximumFractionDigits: 17}}/> : null;
        }
        return null;
    }
};
