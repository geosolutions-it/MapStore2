/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { get, find } = require('lodash');
const {WIDGETS_REGEX} = require('../actions/widgets');
const { findGroups } = require('./GraphUtils');
const { sameToneRangeColors } = require('./ColorUtils');

const getDependentWidget = (k, widgets) => {
    const [match, id] = WIDGETS_REGEX.exec(k);
    if (match) {
        const widget = find(widgets, { id });
        return widget;
    }
};

const getWidgetDependency = (k, widgets) => {
    const regRes = WIDGETS_REGEX.exec(k);
    const rest = regRes && regRes[2];
    const widget = getDependentWidget(k, widgets);
    return rest
        ? get(widget, rest)
        : widget;
};
const getConnectionList = (widgets = []) => {
    return widgets.reduce(
    (acc, curr) => {
        // note: check mapSync because dependency map is not actually cleaned
        const depMap = (get(curr, "mapSync") && get(curr, "dependenciesMap")) || {};
        const dependencies = Object.keys(depMap).map(k => getDependentWidget(depMap[k], widgets)) || [];
        return [
            ...acc,
            ...(dependencies
                    /**
                     * This filter removes temp orphan dependencies, but can not recover connection when the value of the connected element is undefined
                     * TODO: remove this filter and clean orphan dependencies
                     */
                    .filter(d => d !== undefined)
                    .map(d => [curr.id, d.id]))
        ];
    }, []);
};

module.exports = {
    getWidgetDependency,
    getConnectionList,
    getWidgetsGroups: (widgets = []) => {
        const groups = findGroups(getConnectionList(widgets));
        const colorsOpts = { base: 190, range: 340, options: { base: 10, range: 360, s: 0.67, v: 0.67 } };
        const colors = sameToneRangeColors(colorsOpts.base, colorsOpts.range, groups.length + 1, colorsOpts.options);
        return groups.map((members, i) => ({
            color: colors[i],
            widgets: members
        }));
    }
};
