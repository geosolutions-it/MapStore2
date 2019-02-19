/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const deleteWidget = require('./deleteWidget');
const {compose} = require('recompose');
const {editableWidget, hidableWidget, defaultIcons, withHeaderTools} = require('./tools');

/**
 * enhancers for the text widget
 */
module.exports = compose(
    deleteWidget,
    editableWidget(),
    hidableWidget(),
    defaultIcons(),
    withHeaderTools()
);
