/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEqual, every, find, omit } from 'lodash';
import { createSelector } from 'reselect';

import { getDashboardWidgets, getDashboardWidgetsLayout } from './widgets';
import { originalDataSelector } from './dashboard';

export const dashboardHasPendingChangesSelector = createSelector(originalDataSelector, getDashboardWidgets, getDashboardWidgetsLayout, (originalData, widgets, layout) => {
    const originalWidgets = originalData?.widgets || [];
    const originalLayouts = originalData?.layouts || {};

    return !isEqual(originalLayouts, layout) || originalWidgets.length !== widgets.length || !every(widgets, widget => {
        const originalWidget = find(originalWidgets, {id: widget.id});
        const originalMap = originalWidget?.map;
        const widgetMap = widget.map;
        const originalCenter = originalMap?.center;
        const widgetCenter = widgetMap?.center;
        const CENTER_EPS = 1e-12;
        return !!originalWidget && isEqual(omit(widget, 'dependenciesMap', 'map'), omit(originalWidget, 'dependenciesMap', 'map')) &&
            (!widgetMap && !originalMap || isEqual(omit(widgetMap, 'center'), omit(originalMap, 'center'))) &&
            (!widgetMap && !originalMap || !originalCenter && !widgetCenter || !!originalCenter && !!widgetCenter &&
                originalCenter.crs === widgetCenter.crs && Math.abs(originalCenter.x - widgetCenter.x) < CENTER_EPS && Math.abs(originalCenter.y - widgetCenter.y) < CENTER_EPS);
    });
});
