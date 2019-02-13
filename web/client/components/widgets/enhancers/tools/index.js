/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose} = require('recompose');
const withTools = require('./withTools');
const pinnableWidget = require('./pinnableWidget');
const hidableWidget = require('./hidableWidget');
const withInfo = require('./withInfo');
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
    /**
     * widgets icons of collapse/pin
     */
    defaultIcons: () => compose(
        pinnableWidget(),
        collapsibleWidget(),
        withInfo()
    ),
    /**
     * transform `widgetTools` prop into `topLeftItems` and `icons` props
     * user to in the widget header
     */
    withHeaderTools: () => compose(
        withTools(),
        withIcons(),
        withMenu()
    )
};
