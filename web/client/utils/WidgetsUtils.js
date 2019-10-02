/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { get, find, isNumber, round} = require('lodash');
const {WIDGETS_REGEX} = require('../actions/widgets');
const { findGroups } = require('./GraphUtils');
const { sameToneRangeColors } = require('./ColorUtils');

const getDependentWidget = (k, widgets) => {
    const [match, id] = WIDGETS_REGEX.exec(k);
    if (match) {
        const widget = find(widgets, { id });
        return widget;
    }
    return null;
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

/**
 * it checks if a number is higher than threshold and returns a shortened version of it
 * @param {number} label to parse
 * @param {number} threshold threshold to check if it needs to be rounded
 * @param {number} decimals number of decimal to use when rounding
 * @return the shortened number plus a suffix or the label is a string is passed
*/
const shortenLabel = (label, threshold = 1000, decimals = 1) => {
    if (!isNumber(label)) {
        return label;
    }
    let unit;
    let number = round(label);
    let add = number.toString().length % 3;
    if (number >= threshold) {
        let trimedDigits = number.toString().length - ( add === 0 ? add + 3 : add );
        let zeroNumber = (trimedDigits) / 3;
        let trimedNumber = number / Math.pow(10, trimedDigits);
        switch (zeroNumber) {
        case 1 :
            unit = ' K';
            break;
        case 2 :
            unit = ' M';
            break;
        case 3 :
            unit = ' B';
            break;
        case 4 :
            unit = ' T';
            break;
        default:
            unit = '';
        }
        number = round(trimedNumber, decimals) + unit;
    } else {
        number = round(label, Math.abs(4 - number.toString().length));
    }
    return number;
};

module.exports = {
    shortenLabel,
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
