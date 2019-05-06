/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const WidgetsTray = require('./widgets/WidgetsTray');
const autoDisableWidgets = require('./widgets/autoDisableWidgets');

/**
 * Plugin that allow to collapse widgets. Shows a small tray where to see the collapsed plugins list.
 * @name WidgetsTray
 * @memberof plugins
 * @prop {boolean|string|array} [toolsOptions.seeHidden] hides the widgets under particular conditions. **Must** be the same of rule of the Widget plugin. @see plugins.Widgets.
 * @class
 */
module.exports = {
    WidgetsTrayPlugin: autoDisableWidgets(WidgetsTray),
    epics: require('../epics/widgetsTray')
};
