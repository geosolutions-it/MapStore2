/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEqual, some, find, omit, isArray,  isObject} from 'lodash';
import { createSelector } from 'reselect';

import { getDashboardWidgets, getDashboardWidgetsLayout } from './widgets';
import { originalDataSelector } from './dashboard';

const recursiveIsChanged = (a, b) => {
    if (!isObject(a)) {
        return !isEqual(a, b);
    }
    if (isArray(a)) {
        return a.some((v, idx) => {
            return recursiveIsChanged(a[idx], b?.[idx]);
        });
    }
    return Object.keys(a).some((key) => {
        return recursiveIsChanged(a[key], b?.[key]);
    }, {});
};

export const dashboardHasPendingChangesSelector = createSelector(originalDataSelector, getDashboardWidgets, getDashboardWidgetsLayout, (originalData, widgets, layout) => {
    const originalWidgets = originalData?.widgets || [];
    const originalLayouts = originalData?.layouts || {};
    if (recursiveIsChanged(originalLayouts, layout || {})) {
        return true;
    }
    if (originalWidgets.length !== (widgets?.length || 0)) {
        return true;
    }

    return some(widgets || [], widget => {
        const originalWidget = find(originalWidgets, {id: widget.id});
        if (!originalWidget
            || recursiveIsChanged(omit(widget, 'dependenciesMap', 'map', 'maps'), omit(originalWidget, 'dependenciesMap', 'map', 'maps'))
        ) {
            return true;
        }
        const originalMaps = originalWidget?.map ? [originalWidget.map] : originalWidget?.maps || [];
        const widgetMaps = widget.map ? [widget.map] : widget.maps || [];
        if (!widgetMaps?.length && !originalMaps?.length) {
            return false;
        }

        return widgetMaps.some((widgetMap, idx) => {
            const originalMap = originalMaps[idx] || {};
            if (recursiveIsChanged(omit(widgetMap, 'center', 'bbox', 'size'), omit(originalMap, 'center', 'bbox', 'size'))) {
                return true;
            }
            const originalCenter = originalMap?.center;
            const widgetCenter = widgetMap?.center;
            if (!originalCenter && !widgetCenter) {
                return false;
            }
            const CENTER_EPS = 1e-12;
            return !(
                !!originalCenter
                && !!widgetCenter
                && originalCenter.crs === widgetCenter.crs
                && Math.abs(originalCenter.x - widgetCenter.x) < CENTER_EPS
                && Math.abs(originalCenter.y - widgetCenter.y) < CENTER_EPS
            );
        });
    });
});
