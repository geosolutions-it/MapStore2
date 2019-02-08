/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose} = require('recompose');
const withTools = require('./withTools');
const pinnableWidget = require('./pinnableWidget');
const hidableWidget = require('./hidableWidget');
const withMenu = require('./withMenu');
const withIcons = require('./withIcons');
const editableWidget = require('./editableWidget');
const exportableWidget = require('./exportableWidget');
const collapsibleWidget = require('./collapsibleWidget');


module.exports = {
    withTools,
    pinnableWidget,
    hidableWidget,
    withMenu,
    withIcons,
    editableWidget,
    exportableWidget,
    collapsibleWidget,
    defaultIcons: () => compose(
        pinnableWidget(),
        collapsibleWidget()
    ),
    /**
     * transform widgetTools into `topLeftItems`, `topRightItems` and `icons`
     */
    withHeaderTools: () => compose(
        withTools(),
        withIcons(),
        withMenu()
    )
};
