/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {isNil} = require('lodash');

module.exports = {
    getFormatter: (desc) => desc.localType === 'boolean' ?
        ({value} = {}) => !isNil(value) ? <span>{value.toString()}</span> : null :
        null
};
