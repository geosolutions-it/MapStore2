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
    pick,
    isString,
    uniq
} from 'lodash';
import set from "lodash/fp/set";
import { CHARTS_REGEX, TRACES_REGEX, MAPS_REGEX, WIDGETS_MAPS_REGEX, WIDGETS_REGEX } from '../actions/widgets';
import { findGroups } from './GraphUtils';
import { sameToneRangeColors } from './ColorUtils';
import uuidv1 from "uuid/v1";
import { arrayUpsert } from "../utils/ImmutableUtils";


export const FONT = {
    FAMILY: "inherit",
    SIZE: 12,
    COLOR: "#000000"
};

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

export const CHART_PROPS = ["selectedChartId", "selectedTraceId", "id", "mapSync", "widgetType", "charts", "dependenciesMap", "dataGrid", "title", "description"];

const legacyColorsMap = {
    'global.colors.blue': '#0888A1',
    'global.colors.red': '#CD4A29',
    'global.colors.green': '#29CD2E',
    'global.colors.brown': '#CD8029',
    'global.colors.purple': '#CD29C7'
};
const legacyColorsToRamps = {
    'global.colors.blue': 'blues',
    'global.colors.red': 'reds',
    'global.colors.green': 'greens',
    'global.colors.brown': 'ylorbr',
    'global.colors.purple': 'purples',
    'global.colors.random': 'random'
};
/**
 * Return a default trace style
 * @param {string} type trace type one of `line`, `bar` or `pie`
 * @param {string} options.color overrides the default color
 * @param {string} options.ramp overrides the default color ramp value
 * @returns {object} trace style
 */
export const defaultChartStyle = (type, {
    color = legacyColorsMap['global.colors.blue'],
    ramp = 'blues'
} = {}) => {
    if (type === 'pie') {
        return {
            msClassification: {
                method: 'uniqueInterval',
                intervals: 5,
                reverse: false,
                ramp
            }
        };
    }
    if (type === 'bar') {
        return {
            msMode: 'simple',
            line: {
                color: 'rgb(0, 0, 0)',
                width: 0
            },
            marker: {
                color
            }
        };
    }
    return {
        line: {
            color,
            width: 2
        },
        marker: {
            color,
            size: 6
        }
    };
};
/**
 * Convert autoColorOptions style to trace style
 * @param {object} options.autoColorOptions a legacy color value
 * @param {string} options.type trace type one of `line`, `bar` or `pie`
 * @param {string} options.classificationAttributeType type of the classification attribute
 * @returns {object} trace style object
 */
const applyDefaultStyle = ({ autoColorOptions, type, classificationAttributeType }) => {
    if (!autoColorOptions) {
        return { style: defaultChartStyle(type) };
    }
    const method = classificationAttributeType === 'number' ? 'equalInterval' : 'uniqueInterval';
    if (autoColorOptions?.name === 'global.colors.custom') {
        return {
            style: {
                ...(type === 'bar' && { msMode: 'classification' }),
                msClassification: {
                    method,
                    intervals: 5,
                    reverse: false,
                    ramp: 'viridis',
                    defaultColor: autoColorOptions.defaultCustomColor,
                    defaultLabel: autoColorOptions.defaultClassLabel,
                    classes: (method === 'uniqueInterval'
                        ? autoColorOptions.classification
                        : autoColorOptions.rangeClassification) || []
                }
            }
        };
    }
    if (type === 'pie') {
        return {
            style: {
                msClassification: {
                    method,
                    intervals: 5,
                    reverse: false,
                    ramp: legacyColorsToRamps[autoColorOptions.name]
                }
            }
        };
    }
    const color = legacyColorsMap[autoColorOptions.name];
    return { style: defaultChartStyle(type, { color }) };
};
/**
 * Generate the aggregation data key based on the availability of the aggregation function
 * @param {string} options.aggregateFunction aggregation function
 * @param {string} options.aggregationAttribute aggregation attribute
 * @returns {string} aggregation data key
 */
export const getAggregationAttributeDataKey = (options = {}) => {
    return !options.aggregateFunction || options.aggregateFunction === 'None'
        ? options.aggregationAttribute || ''
        : `${options.aggregateFunction}(${options.aggregationAttribute})`;
};
/**
 * Generate a new trace with default values
 * @param {string} options.type trace type one of `line`, `bar` or `pie`
 * @param {string} options.color default color of the trace
 * @param {boolean} options.randomColor use a random color if true and `color` is not defined
 * @param {string} options.geomProp the geometry property name associated with the layer
 * @param {object} options.layer a layer object configuration
 * @param {object} options.filter filter object associated with the layer
 * @returns {object} new trace object
 */
export const generateNewTrace = (options) => {
    const type = options?.type || 'bar';
    const color = options?.color
        ? options.color
        : options?.randomColor
            ? `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
            : undefined;
    return {
        id: uuidv1(),
        type,
        layer: options?.layer,
        ...(options?.geomProp && { geomProp: options.geomProp }),
        ...(options?.filter && { filter: options.filter }),
        options: {},
        style: defaultChartStyle(type, { color })
    };
};
/**
 * Generate a chart supporting multiple traces structure
 * @param {object} chart legacy chart
 * @returns {object} chart structure using traces
 */
export const legacyChartToChartWithTraces = ({
    yAxis,
    xAxisAngle,
    type,
    options: chartOptions,
    autoColorOptions,
    legend,
    cartesian,
    chartId,
    xAxisOpts,
    yAxisOpts: yAxisOptsProp,
    yAxisLabel,
    tickPrefix,
    format,
    tickSuffix,
    formula,
    name,
    geomProp,
    layer,
    barChartType
} = {}) => {
    const { classificationAttributeType, ...options } = chartOptions || {};
    const {
        textinfo,
        includeLegendPercent,
        ...yAxisOpts
    } = yAxisOptsProp || {};
    return {
        name,
        legend,
        cartesian,
        chartId,
        barChartType,
        xAxisOpts: [{
            ...xAxisOpts,
            angle: xAxisAngle,
            id: 0
        }],
        yAxisOpts: [{
            ...yAxisOpts,
            hide: yAxis === false,
            id: 0
        }],
        traces: [{
            id: `trace-${chartId}`,
            name: yAxisLabel,
            type,
            options,
            ...applyDefaultStyle({
                autoColorOptions,
                classificationAttributeType,
                type
            }),
            textinfo,
            tickPrefix,
            format,
            tickSuffix,
            formula,
            geomProp,
            layer,
            includeLegendPercent
        }]
    };
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
            if (w.widgetType === 'chart' && widget?.charts?.find(chart => !chart.traces)) {
                widget.charts = widget.charts.map((chart) => {
                    if (chart.traces) {
                        return chart;
                    }
                    return legacyChartToChartWithTraces(chart);
                });
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
 * @returns {*}
 */
const chartWidgetOperation = ({ editorData, key, value }) => {

    const editorProp = pick(editorData, CHART_PROPS) || {};

    if (key === 'chart-layers') {
        const charts = value?.map((v) => ({
            chartId: uuidv1(),
            traces: [generateNewTrace({
                layer: v
            })]
        }));
        return {
            ...editorProp,
            charts,
            selectedChartId: charts?.[0]?.chartId,
            selectedTraceId: charts?.[0]?.traces?.[0]?.id
        };
    }
    if (key === 'chart-delete') {
        const charts = value;
        return {
            ...editorProp,
            charts,
            selectedChartId: charts?.[0]?.chartId,
            selectedTraceId: charts?.[0]?.traces?.[0]?.id
        };
    }
    if (key === 'chart-add') {
        const newCharts = value?.map(v => ({
            chartId: uuidv1(),
            traces: [generateNewTrace({
                layer: v
            })]
        }));
        const charts = [ ...(editorProp?.charts || []), ...newCharts ];
        return {
            ...editorProp,
            charts,
            selectedChartId: newCharts?.[0]?.chartId || charts?.[0]?.chartId,
            selectedTraceId: newCharts?.[0]?.traces?.[0]?.id || charts?.[0]?.traces?.[0]?.id
        };
    }
    if (key === 'chart-layer-replace') {
        const layer = value.layer[0];
        const charts = (editorProp.charts || []).map((chart) => {
            if (chart.chartId === value.chartId) {
                return {
                    ...chart,
                    traces: (chart?.traces || []).map((trace) => {
                        if (trace.id === value.traceId) {
                            return { ...trace, layer, options: {} };
                        }
                        return trace;
                    })
                };
            }
            return chart;
        });
        return {
            ...editorProp,
            charts
        };
    }

    return editorProp;
};

// Add value to trace[id] paths
const insertTracesOnEditorChange = ({
    identifier,
    id,
    charts,
    pathToUpdate,
    value
}) => {
    if (pathToUpdate.includes('traces[')) {
        const currentChart = charts.find(m => m[identifier] === id);
        const traces = get(currentChart, 'traces', []);
        const [, traceId, tracePathToUpdate] = TRACES_REGEX.exec(pathToUpdate) || [];
        const tracesIds = traces.map((trace) => trace.id);
        const traceIndex = tracesIds.indexOf(traceId);
        if (traceIndex > -1) {
            const newTraces = traces.map((trace) => trace.id === traceId ? set(tracePathToUpdate, value, trace) : trace);
            return set('traces', newTraces, charts.find(m => m[identifier] === id));
        }
    }
    return set(pathToUpdate, value, charts.find(m => m[identifier] === id));
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
            updatedValue = insertTracesOnEditorChange({
                identifier,
                id,
                charts: editorArray,
                pathToUpdate,
                value
            });
        }
        return arrayUpsert(path, updatedValue, {[identifier]: id || value?.[identifier]}, state);
    }
    const editorData = { ...state?.builder?.editor };
    // Widget specific editor changes
    if (key.includes(`chart-`)) {
        // TODO Allow to support all widget types that might support multi widget feature
        return set('builder.editor', chartWidgetOperation({key, value, editorData}), state);
    }
    return set(path, value, state);
};

export const getDependantWidget = ({widgets = [], dependenciesMap = {}}) =>
    widgets?.find(w => w.id === (WIDGETS_REGEX.exec(Object.values(dependenciesMap)?.[0]) || [])[1]) || {};

/**
 * Get the current selected trace data
 * @param {object} chart widget chart data
 * @param {string} chart.selectedChartId selected chart identifier
 * @param {string} chart.selectedTraceId selected traces identifier
 * @param {array} chart.charts widget charts
 * @returns {object} selected trace data
 */
export const extractTraceData = ({ selectedChartId, selectedTraceId, charts } = {}) => {
    const selectedChart = (charts || []).find(chart => chart.chartId === selectedChartId);
    const selectedTrace = (selectedChart?.traces || []).find(trace => trace.id === selectedTraceId);
    return selectedTrace || selectedChart?.traces?.[0];
};
/**
 * Get editing widget from widget data with multi support
 * @param {object} widget editing widget
 * @returns {object} selected widget data
 */
export const getSelectedWidgetData = (widget = {}) => {
    if (widget.widgetType === 'chart' || widget.charts) {
        const widgetData = extractTraceData(widget);
        return widgetData;
    }
    if (widget.widgetType === 'map' || widget.maps) {
        return widget?.maps?.find(c => c.mapId === widget?.selectedMapId) || {};
    }
    return widget;
};

export const DEFAULT_MAP_SETTINGS = {
    projection: 'EPSG:900913',
    units: 'm',
    center: {
        x: 11.22894105149402,
        y: 43.380053862794,
        crs: 'EPSG:4326'
    },
    maxExtent: [
        -20037508.34,
        -20037508.34,
        20037508.34,
        20037508.34
    ],
    mapId: null,
    size: {
        width: 1300,
        height: 920
    },
    version: 2,
    limits: {},
    mousePointer: 'pointer',
    resolutions: [
        156543.03392804097,
        78271.51696402048,
        39135.75848201024,
        19567.87924100512,
        9783.93962050256,
        4891.96981025128,
        2445.98490512564,
        1222.99245256282,
        611.49622628141,
        305.748113140705,
        152.8740565703525,
        76.43702828517625,
        38.21851414258813,
        19.109257071294063,
        9.554628535647032,
        4.777314267823516,
        2.388657133911758,
        1.194328566955879,
        0.5971642834779395,
        0.29858214173896974,
        0.14929107086948487,
        0.07464553543474244,
        0.03732276771737122,
        0.01866138385868561,
        0.009330691929342804,
        0.004665345964671402,
        0.002332672982335701,
        0.0011663364911678506,
        0.0005831682455839253,
        0.00029158412279196264,
        0.00014579206139598132
    ]
};
// add labels and utils to classification classes
const parseClasses = (classes, {
    legendValue
} = {}) => {
    return classes.map((entry, idx, arr) => ({
        ...entry,
        index: idx,
        ...(entry.unique !== undefined
            ? {
                label: entry.title || entry.unique,
                insideClass: (value) => value === entry.unique
            }
            : {
                label: (entry.title || (
                    idx < arr.length - 1
                        ? `>= ${entry.min}<br>< ${entry.max}`
                        : `>= ${entry.min}<br><= ${entry.max}`
                )),
                insideClass: (value) => idx < arr.length - 1
                    ? value >= entry.min && value < entry.max
                    : value >= entry.min && value <= entry.max
            })
    })).map((entry) => ({
        ...entry,
        label: `${entry.label || ''}`
            .replace('${minValue}', entry.min ?? '')
            .replace('${maxValue}', entry.max ?? '')
            .replace('${legendValue}', legendValue || '')
    }));
};
// return correct sorting keys for classification based on the trace type
const getSortingKeys = ({ type, options, sortBy }) => {
    if (type === 'pie') {
        const labelDataKey = options?.groupByAttributes;
        const valueDataKey = getAggregationAttributeDataKey(options);
        const classificationDataKey = options?.classificationAttribute || labelDataKey;
        const sortByKey = sortBy !== 'groupBy' ?  valueDataKey : labelDataKey;
        const isNestedPieChart = !(classificationDataKey === labelDataKey);
        const sortKey = isNestedPieChart ? classificationDataKey : sortByKey;
        // we need to reverse the order when sorting by value data key
        // in this way we see the bigger slice as first from the top
        // with the other displayed clockwise
        const sortFunc = sortByKey === valueDataKey
            ? (a, b) => a.index > b.index ? -1 : 1
            : (a, b) => a.index > b.index ? 1 : -1;
        const legendValue = classificationDataKey;
        return {
            sortKey,
            sortByKey,
            classificationDataKey,
            legendValue,
            customSortFunc: !isNestedPieChart && sortFunc
        };
    }
    if (type === 'bar') {
        const xDataKey = options?.groupByAttributes;
        const classificationDataKey = options?.classificationAttribute || xDataKey;
        const yDataKey = getAggregationAttributeDataKey(options);
        const sortByKey = sortBy !== 'aggregation' ?  xDataKey : yDataKey;
        const sortKey = classificationDataKey === xDataKey
            ? sortByKey
            : classificationDataKey;
        const legendValue = yDataKey;
        return { sortKey, sortByKey, classificationDataKey, legendValue };
    }
    return {};
};
/**
 * Get editing widget from widget data with multi support
 * @param {object} widget editing widget
 * @returns {object} selected widget data
 */
export const generateClassifiedData = ({
    type,
    data,
    sortBy,
    options,
    msClassification,
    classifyGeoJSON,
    excludeOthers,
    applyCustomSortFunctionOnClasses
}) => {
    const {
        ramp = 'viridis',
        intervals = 5,
        reverse,
        method: methodStyle = 'uniqueInterval',
        classes: classesStyle,
        defaultColor = '#ffff00',
        defaultLabel = 'Others'
    } = msClassification || {};

    const { customSortFunc, sortKey, sortByKey, classificationDataKey, legendValue } = getSortingKeys({ type, options, sortBy });

    const customClasses = classesStyle && parseClasses(classesStyle, {
        legendValue
    });
    const isStringData = isString(data?.[0]?.[classificationDataKey]);
    const sortFunc = data.type === 'pie'
        ? (a, b) => a[sortKey] > b[sortKey] ? -1 : 1
        : (a, b) => a[sortKey] > b[sortKey] ? 1 : -1;
    const initialSortedData = [...data].sort(sortFunc);
    const method = isStringData
        ? 'uniqueInterval'
        : methodStyle;
    const computedClasses = (customClasses || parseClasses(
        classifyGeoJSON({
            type: 'FeatureCollection',
            features: initialSortedData.map((properties) => ({ properties, type: 'Feature', geometry: null }))
        }, {
            attribute: classificationDataKey,
            method,
            ramp,
            reverse,
            intervals,
            sort: false
        })
    ));
    const othersClass = {
        color: defaultColor,
        label: (defaultLabel || '')
            .replace('${legendValue}', legendValue || ''),
        index: computedClasses.length
    };
    const classifiedData = initialSortedData.map((properties) => {
        const entry = computedClasses.find(({ insideClass }) => insideClass(properties[classificationDataKey]));
        const selectedEntry = entry ? entry : othersClass;
        return {
            ...selectedEntry,
            properties,
            label: (selectedEntry.label || '').replace('${groupByValue}', properties[options?.groupByAttributes] || '')
        };
    });
    const classes = excludeOthers
        ? computedClasses
        : [...computedClasses, othersClass];
    return {
        sortByKey,
        classes: customSortFunc && applyCustomSortFunctionOnClasses
            ? classes.sort(customSortFunc)
            : classes,
        classifiedData: customSortFunc
            ? classifiedData.sort(customSortFunc)
            : classifiedData
    };
};
/**
 * Ensure a valid number is returned
 * @param {number} num a number
 * @returns {number} valid number
 */
export const parseNumber = (num) => isNumber(num) && !isNaN(num) ? num : 0;
/**
 * Perform a sum aggregation for pie chart data with no aggregation
 * to get the correct number of slices
 * @param {object} data chart data
 * @param {string} options.groupByAttributes group by attribute
 * @param {string} options.aggregationAttribute aggregation attribute
 * @param {string} options.aggregateFunction aggregate function
 * @param {string} options.classificationAttribute classification function
 * @returns {object} aggregated data
 */
export const parsePieNoAggregationFunctionData = (data, options = {}) => {
    const labelDataKey = options?.groupByAttributes;
    const valueDataKey = getAggregationAttributeDataKey(options);
    const hasAggregateFunction = !(!options.aggregateFunction || options.aggregateFunction === 'None');
    const classificationDataKey = options?.classificationAttribute || labelDataKey;
    const isNestedPieChart = !(classificationDataKey === labelDataKey);
    if (data && !hasAggregateFunction && !isNestedPieChart) {
        // we need to sum value with the same label property
        // if the aggregation is missing
        // this is needed to get correct number of slices
        const labelProperties = uniq(data.map((properties) => properties[labelDataKey]));
        return labelProperties.map((labelProperty) => {
            const filteredData = data.filter(properties => properties[labelDataKey] === labelProperty);
            return {
                [labelDataKey]: labelProperty,
                [valueDataKey]: filteredData.reduce((sum, properties) => sum + parseNumber(properties[valueDataKey]), 0)
            };
        });
    }
    return data;
};
/**
 * Verify validity of a chart
 * @param {string} options.groupByAttributes group by attribute
 * @param {string} options.aggregationAttribute aggregation attribute
 * @param {string} options.aggregateFunction aggregate function
 * @param {string} options.classificationAttribute classification function
 * @param {boolean} props.hasAggregateProcess true if the associated service has aggregation
 * @returns {boolean} true if valid
 */
export const isChartOptionsValid = (options = {}, { hasAggregateProcess }) => {
    return !!(
        options.aggregationAttribute
        && options.groupByAttributes
        // if aggregate process is not present, the aggregateFunction is not necessary. if present, is mandatory
        && (!hasAggregateProcess || hasAggregateProcess && options.aggregateFunction)
        || options.classificationAttribute
    );
};
/**
 * Verify if the bar chart stack option can be enabled
 * @param {string} chart a widget chart configuration
 * @returns {boolean} true if the option can be enabled
 */
export const enableBarChartStack = (chart = {}) => {
    const barTraces = (chart?.traces || [])?.filter(trace => trace.type === 'bar');
    // if there is only one bar chart
    // allow the stack selection only for classification
    if (barTraces.length === 1) {
        return barTraces[0]?.style?.msMode === 'classification';
    }
    // if there is a single x/y axis
    // and multiple bar charts
    // allow the stack option
    if (barTraces.length > 1
        && (chart.xAxisOpts || [{ id: 0 }]).length === 1
        && (chart.yAxisOpts || [{ id: 0 }]).length === 1) {
        return true;
    }
    // in other all other cases allow only group
    // the reason is related to the overlay behavior for each new axis added
    return false;
};
