/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const handleResourceData = require('./handleResourceData');
const handlePermission = require('./handlePermission');
const handleErrors = require('./handleErrors');
const { compose, branch, renderNothing} = require('recompose');
module.exports = compose(
    branch(
        ({ show }) => !show,
        renderNothing
    ),
    handleResourceData,
    handlePermission(),
    handleErrors
);
