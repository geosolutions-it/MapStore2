/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import WidgetsTray from './widgets/WidgetsTray';
import autoDisableWidgets from './widgets/autoDisableWidgets';
import * as epics from '../epics/widgetsTray';

/**
 * Plugin that allow to collapse widgets. Shows a small tray where to see the collapsed plugins list.
 * @name WidgetsTray
 * @memberof plugins
 * @prop {boolean|string|array} [toolsOptions.seeHidden] hides the widgets under particular conditions. **Must** be the same of rule of the Widget plugin. @see plugins.Widgets.
 * @class
 */
export default {
    WidgetsTrayPlugin: autoDisableWidgets(WidgetsTray),
    epics
};
