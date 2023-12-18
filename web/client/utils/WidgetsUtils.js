/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    get,
    find,
    isNumber,
    round,
    findIndex,
    includes,
    isEmpty,
    cloneDeep,
    omit,
    castArray,
    pick
} from 'lodash';
import set from "lodash/fp/set";
import { CHARTS_REGEX, MAPS_REGEX, WIDGETS_MAPS_REGEX, WIDGETS_REGEX } from '../actions/widgets';
import { findGroups } from './GraphUtils';
import { sameToneRangeColors } from './ColorUtils';
import uuidv1 from "uuid/v1";
import { arrayUpsert } from "../utils/ImmutableUtils";

export const getDependentWidget = (k, widgets) => {
    const [match, id] = WIDGETS_REGEX.exec(k);
    if (match) {
        return find(widgets, { id });
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

export const CHART_PROPS = ["selectedChartId", "id", "mapSync", "widgetType", "charts", "dependenciesMap", "dataGrid", "title", "description"];

/**
 * Convert the dependenciesMapping to support maplist
 * widget for compatibility
 * @param data {object} response from dashboard query
 * @returns {object} data with updated map widgets
 */
export const convertDependenciesMappingForCompatibility = (data) => {
    const mapDependencies = ["layers", "viewport", "zoom", "center"];
    const _data = cloneDeep(data);
    const widgets = _data?.widgets || [];
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
            if (w.widgetType === 'chart' && w.layer) {
                const chartId = uuidv1(); // Add chartId to existing chart data
                const chartData = omit(widget, CHART_PROPS) || {};
                const editorData = pick(widget, CHART_PROPS) || {};
                widget = {
                    ...editorData,
                    selectedChartId: chartId,
                    charts: castArray({...chartData, layer: w.layer, name: 'Chart-1', chartId })
                };
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

/**
 * Generate widget editor props
 * @param {object} action
 * @returns {object} updated editor change props
 */
export const editorChangeProps = (action) => {
    let key = action.key;
    let pathProp = key;
    const value = action.value;
    let regex = '';
    let identifier = '';
    if (key.includes('maps')) {
        pathProp = 'maps';
        regex = MAPS_REGEX;
        identifier = 'mapId';
    } else if (key.includes('charts')) {
        pathProp = 'charts';
        regex = CHARTS_REGEX;
        identifier = 'chartId';
    }
    return { path: `builder.editor.${pathProp}`, value, key, regex, identifier };
};

/**
 * Chart widget specific operation to perform multi chart management
 * @param {object} editorData
 * @param {string} key
 * @param {any} value
 * @param {object} state
 * @returns {*}
 */
const chartWidgetOperation = ({editorData, key, value}, state) => {
    const chartData = omit(editorData, CHART_PROPS) || {};
    const editorProp = pick(editorData, CHART_PROPS) || {};
    let datas = [];
    let selectedChartId = null;
    if (key.includes('layers')) {
        datas = value?.map((v, i) => ({...chartData, name: `Chart-${i + 1}`, chartId: uuidv1(), type: 'bar', layer: v }));
    } else if (key.includes('delete')) {
        datas = value;
    } else {
        const multiData = value?.map(v => ({...chartData, chartId: uuidv1(), type: 'bar', layer: v }));
        datas = editorProp?.charts?.concat(multiData)?.map((c, i) => ({...c, name: isEmpty(c.name) ? `Chart-${i + 1}` : c.name}));
        selectedChartId = multiData?.[0]?.chartId;
    }
    return set('builder.editor', {...editorProp, charts: datas, selectedChartId: selectedChartId || datas?.[0]?.chartId }, state);
};

/**
 * Perform state with widget editor changes
 * @param {object} action
 * @param {object} state object
 * @returns {object|object[]} updated state
 */
export const editorChange = (action, state) => {
    const { key, path, identifier, regex, value } = editorChangeProps(action);
    // Update multi widgets (currently charts and maps)
    if (['maps', 'charts'].some(k => key.includes(k))) {
        if (key === 'maps' && value === undefined) {
            return set(path, value, state);
        }
        const [, id, pathToUpdate] = regex.exec(key) || [];
        let updatedValue = value;
        if (id) {
            const editorArray = get(state, path, []);
            updatedValue = set(pathToUpdate, value, editorArray.find(m => m[identifier] === id));
        }
        return arrayUpsert(path, updatedValue, {[identifier]: id || value?.[identifier]}, state);
    }
    const editorData = { ...state?.builder?.editor };
    // Widget specific editor changes
    if (key.includes(`chart-`)) {
        // TODO Allow to support all widget types that might support multi widget feature
        return chartWidgetOperation({key, value, editorData}, state);
    }
    return set(path, value, state);
};

export const getDependantWidget = ({widgets = [], dependenciesMap = {}}) =>
    widgets?.find(w => w.id === (WIDGETS_REGEX.exec(Object.values(dependenciesMap)?.[0]) || [])[1]) || {};

/**
 * Get editing widget from widget data with multi support
 * @param {object} widget editing widget
 * @returns {object} selected widget data
 */
export const getSelectedWidgetData = (widget = {}) => {
    if (widget.widgetType === 'chart' || widget.charts) {
        return widget?.charts?.find(c => c.chartId === widget?.selectedChartId) || {};
    }
    if (widget.widgetType === 'map' || widget.maps) {
        return widget?.maps?.find(c => c.mapId === widget?.selectedMapId) || {};
    }
    return widget;
};

/**
 * Check if chart widget layers are compatible with table widget layer
 * @param {object} widget current widget object
 * @param {object} tableWidget depedant table widget object
 * @returns {boolean} flag determines if compatible
 */
export const isChartCompatibleWithTableWidget = (widget, tableWidget) => {
    const tableLayerName = tableWidget?.layer?.name;
    return tableLayerName && get(widget, 'charts', [])
        .every(({ layer = {} } = {}) => layer.name === tableLayerName);
};
