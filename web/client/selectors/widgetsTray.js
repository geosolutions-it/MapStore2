/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { createSelector } = require('reselect');
const { getFloatingWidgets, getFloatingWidgetsCurrentLayout, getCollapsedIds, getCollapsedState } = require('./widgets');
const { find, findIndex, sortBy } = require('lodash');

/**
 * Only widgets that are not pinned (static) can be in tray
 * @param {object} widget the widget configuration
 */
const noStaticWidgets = w => !w.dataGrid || !w.dataGrid.static;
/**
 * A selector that retrieves widgets to display in the tray area
 * @return the widgets to display in the tray area
 */
const trayWidgets = createSelector(
    getFloatingWidgets,
    getCollapsedIds,
    getFloatingWidgetsCurrentLayout,
    getCollapsedState,
    (widgets = [], collapsedIds, layout, collapsed = {}) =>
        // sort, filter and add collapsed state to the widgets
        sortBy(
            // only non-static non-hidden widgets should be visible in tray
            widgets
                .filter(noStaticWidgets)
                // collapsed widgets should have the flag - Collapsed
                .map(w => findIndex(collapsedIds, id => id === w.id) >= 0
                    ? {
                        ...w,
                        collapsed: true
                    }
                    : w),
            // sort by layout position (row, column)
            w => {
                const collapsedLayout = collapsed[w.id] && collapsed[w.id].layout;
                const position = find(layout, { i: w.id }) || collapsedLayout || {};
                const { x = 0, y = 0 } = position;
                return y * 100 + x;
            })
);

module.exports = {
    trayWidgets
};
