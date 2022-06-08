/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get, find, isNumber, round, findIndex, includes, isEmpty, cloneDeep, omit, castArray} from 'lodash';

import { MAPS_REGEX, WIDGETS_MAPS_REGEX, WIDGETS_REGEX } from '../actions/widgets';
import { findGroups } from './GraphUtils';
import { sameToneRangeColors } from './ColorUtils';
import uuidv1 from "uuid/v1";

export const getDependentWidget = (k, widgets) => {
    const [match, id] = WIDGETS_REGEX.exec(k);
    if (match) {
        const widget = find(widgets, { id });
        return widget;
    }
    return null;
};

export const getMapDependencyPath = (k, widgetId, widgetMaps) => {
    let [match, mapId] = MAPS_REGEX.exec(k) || [];
    const { maps } = find(widgetMaps, {id: widgetId}) || {};
    if (match && !isEmpty(maps)) {
        const index = findIndex(maps, { mapId });
        return match.replace(mapId, index);
    }
    return k;
};

export const getWidgetDependency = (k, widgets, maps) => {
    const regRes = WIDGETS_REGEX.exec(k);
    let rest = regRes && regRes[2];
    const widgetId = regRes[1];
    rest = getMapDependencyPath(rest, widgetId, maps);
    const widget = getDependentWidget(k, widgets);
    return rest
        ? get(widget, rest)
        : widget;
};
export const getConnectionList = (widgets = []) => {
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
export const shortenLabel = (label, threshold = 1000, decimals = 1) => {
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

export const getWidgetsGroups =  (widgets = []) => {
    const groups = findGroups(getConnectionList(widgets));
    const colorsOpts = { base: 190, range: 340, options: { base: 10, range: 360, s: 0.67, v: 0.67 } };
    const colors = sameToneRangeColors(colorsOpts.base, colorsOpts.range, groups.length + 1, colorsOpts.options);
    return groups.map((members, i) => ({
        color: colors[i],
        widgets: members
    }));
};

/**
 * returns default aggregation operations for
 * charts that can be used in widgtes and for
 * other features
 */
export const getDefaultAggregationOperations = () => {
    return [
        { value: "Count", label: "widgets.operations.COUNT"},
        { value: "Sum", label: "widgets.operations.SUM"},
        { value: "Average", label: "widgets.operations.AVG"},
        { value: "StdDev", label: "widgets.operations.STDDEV"},
        { value: "Min", label: "widgets.operations.MIN"},
        { value: "Max", label: "widgets.operations.MAX"}
    ];
};

/**
 * Convert the dependenciesMapping to support maplist
 * widget for compatibility
 * @param data {object} response from dashboard query
 * @returns {object} data with updated map widgets
 */
export const convertDependenciesMappingForCompatibility = (data) => {
    const mapDependencies = ["layers", "viewport", "zoom", "center"];
    const _data = cloneDeep(data);
    const widgets = _data.widgets || {};
    const tempWidgetMapDependency = [];
    return {
        ..._data,
        widgets: widgets.map(w => {
            let widget = {...w};
            if (w.widgetType === 'map' && w.map) {
                const mapId = uuidv1(); // Add mapId to existing map data
                widget = omit({...w, selectedMapId: mapId, maps: castArray({...w.map, mapId})}, 'map');
                tempWidgetMapDependency.push({widgetId: widget.id, mapId});
            }
            if (!isEmpty(widget.dependenciesMap)) {
                const widgetPath = Object.values(widget.dependenciesMap)[0];
                const [, dependantWidgetId] = WIDGETS_REGEX.exec(widgetPath) || [];
                const {widgetId, mapId} = find(tempWidgetMapDependency, {widgetId: dependantWidgetId}) || {};
                if (widgetId) {
                    return {
                        ...widget,
                        // Update dependenciesMap containing `map` as dependency
                        dependenciesMap: Object.keys(widget.dependenciesMap)
                            .filter(k => widget.dependenciesMap[k] !== undefined)
                            .reduce((dm, k) => {
                                if (includes(mapDependencies, k)) {
                                    return {
                                        ...dm,
                                        [k]: widget.dependenciesMap[k].replace(".map.", `.maps[${mapId}].`)
                                    };
                                }
                                return {...dm, [k]: widget.dependenciesMap[k]};
                            }, {})
                    };
                }
            }
            return widget;
        })
    };
};

/**
 * Update the dependenciesMap of the widgets containing map as dependencies
 * when a map is changed in the widget via map switcher
 * widget for compatibility
 * @param allWidgets {object[]} response from dashboard query
 * @param widgetId {string} widget id of map list
 * @param selectedMapId {string} selected map id
 * @returns {object[]} updated widgets
 */
export const updateDependenciesMapOfMapList = (allWidgets = [], widgetId, selectedMapId) => {
    let widgets = [...allWidgets];
    const widgetsWithDependenciesMaps = widgets.filter(t => t.dependenciesMap);
    const isUpdateNeeded = widgetsWithDependenciesMaps.some(t => Object.values(t.dependenciesMap).some(td => (WIDGETS_REGEX.exec(td) || [])[1] === widgetId));
    if (isUpdateNeeded) {
        widgets = widgets.map(widget => {
            const dependenciesMap = widget.dependenciesMap;
            const modifiedWidgetId = !isEmpty(dependenciesMap) && (WIDGETS_REGEX.exec(Object.values(dependenciesMap)[0]) || [])[1];
            return {
                ...widget,
                ...(!isEmpty(dependenciesMap) && modifiedWidgetId === widgetId && {
                    dependenciesMap: Object.keys(dependenciesMap).reduce((dm, k) => {
                        const [,, mapIdToReplace] = WIDGETS_MAPS_REGEX.exec(dependenciesMap[k]) || [];
                        if (mapIdToReplace) {
                            return {
                                ...dm,
                                [k]: dependenciesMap[k].replace(mapIdToReplace, selectedMapId) // Update map id of the dependenciesMap
                            };
                        }
                        return {...dm, [k]: dependenciesMap[k]};

                    }, {})})
            };
        });
    }
    return widgets;
};
