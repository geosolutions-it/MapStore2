/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Suspense } from 'react';
import { isArray, castArray, max, isNaN, isNumber, isNull } from 'lodash';
import LoadingView from '../misc/LoadingView';
import { parseExpression } from '../../utils/ExpressionUtils';
import withClassifyGeoJSONSync from './withClassifyGeoJSONSync';
import {
    getAggregationAttributeDataKey,
    generateClassifiedData,
    legacyChartToChartWithTraces,
    parseNumber,
    parsePieNoAggregationFunctionData,
    enableBarChartStack,
    FONT
} from '../../utils/WidgetsUtils';
import withLegendScrollHandler from './withLegendScrollHandler';
const Plot = React.lazy(() => import('./PlotlyChart'));

const processDataProperties = (formula, key, data) => {
    return data.map((properties) => {
        try {
            return {
                ...properties,
                [key]: parseExpression(formula, { value: properties[key] })
            };
        } catch {
            // if error (e.g. null values), return the value itself
            return properties;
        }
    });
};

const applyPercentageToLabel = (label, value, total) => {
    if (!isNull(value)) { // avoid implicit conversion of null to 0
        const percent = (value / total * 100).toPrecision(3); // use precision to be consistent with formatting of plotlyJS (3 digits)
        if (!isNaN(percent)) {
            return label + " - " + percent + "%";
        }
    }
    return label;
};
/**
 * Returns the labels for the pie chart, adds % to the labels, for legend, if the prop `includeLegendPercent` is true
 * @param {string|number[]} labels the values of the chart ["California", "Ohio", ...]
 * @param {number[]} values array of values to be used to calculate the percentage of the label
 * @param {number} total total of sum
 * @param {boolean} opts.includeLegendPercent if true, it adds the % on the label legend
 * @returns {object} the labels for the pie chart
 */
export const renderPieLabelsWithPercentage = (labels = [], values = [], total, {includeLegendPercent} = {}) => {
    if (!includeLegendPercent) {
        return labels;
    }
    if (includeLegendPercent && isNumber(total) && total !== 0) {
        return labels.map((label, i) => {
            return applyPercentageToLabel(label, values[i], total);
        });
    }
    // prevent cases when division by zero
    return labels;
};

const chartDataTypes = {
    pie: ({
        id,
        data: dataProp,
        options,
        style,
        domain,
        name: traceName,
        classifyGeoJSON,
        textinfo,
        layout = {},
        tickPrefix,
        format,
        tickSuffix,
        formula,
        sortBy = 'aggregation',
        includeLegendPercent
    }) => {
        const labelDataKey = options?.groupByAttributes;
        const valueDataKey = getAggregationAttributeDataKey(options);
        const classificationDataKey = options?.classificationAttribute || labelDataKey;
        const isNestedPieChart = !(classificationDataKey === labelDataKey)
            // if there is ${groupByValue} means the custom classes are combined in a single pie chart
            && !style?.msClassification?.classes?.some(({ title }) => (title || '').includes('${groupByValue}'));
        const data = parsePieNoAggregationFunctionData(
            formula ? processDataProperties(formula, valueDataKey, dataProp) : dataProp,
            options
        );
        const total = includeLegendPercent ? data.reduce((sum, properties) => sum + parseNumber(properties[valueDataKey]), 0) : 0;
        const name = traceName || valueDataKey;
        const { sortByKey, classes, classifiedData } = generateClassifiedData({
            type: 'pie',
            sortBy,
            data,
            options,
            msClassification: style?.msClassification,
            classifyGeoJSON
        });
        const sortedData = !isNestedPieChart && !style?.msClassification?.classes
            ? classifiedData
            : classes.reduce((acc, c, idx) => {
                const filteredData = classifiedData
                    .filter((entry) => entry.index === idx)
                    .sort((a, b) => sortByKey === valueDataKey
                        ? a.properties[sortByKey] > b.properties[sortByKey] ? -1 : 1
                        : a.properties[sortByKey] > b.properties[sortByKey] ? 1 : -1)
                    // index in label is needed to associate the class to the other pie chart when nested
                    .map((entry) => isNestedPieChart ? ({ ...entry, label: `${entry.index + 1}) ${entry.label}` }) : entry);
                if (isNestedPieChart && includeLegendPercent) {
                    const partialSum = filteredData.reduce((sum, {properties}) => sum + parseNumber(properties[valueDataKey]), 0);
                    return [...acc, ...filteredData.map((d) => ({ ...d, label: applyPercentageToLabel(d.label, partialSum, total)}))];
                }
                return [...acc, ...filteredData];
            }, []);

        const colors = sortedData.map((entry) => entry?.color);
        const values = sortedData.map(({ properties }) => properties[valueDataKey]);
        const classificationLabels = sortedData.map((entry) => entry?.label);
        // the index in the label has two roles
        // - associate the entry to the class
        // - create a unique identifier when some label are presented in different class categories
        const labels = sortedData.map(({ properties, index }) => isNestedPieChart ? `${properties[labelDataKey]} (${index + 1})` : properties[labelDataKey]);
        const outerLabels = renderPieLabelsWithPercentage(
            isNestedPieChart
                ? labels
                : classificationLabels,
            values,
            total,
            { includeLegendPercent }
        );
        const commonProperties = {
            type: 'pie',
            textposition: 'inside', // this avoids text to overflow the chart div when rendered outside
            pull: 0.005,
            rotation: 0,
            sort: false,
            // when nested is better to switch to clockwise
            // because the first slice does not unfold in the correct direction (see https://github.com/plotly/plotly.js/issues/4817)
            // so it's not possible to align the slices between the two pie charts
            direction: 'clockwise',
            values,
            textinfo,
            // hide labels with textinfo = "none", in this case we have to omit texttemplate which would win over this.
            texttemplate: textinfo === "none" ? null : "%{percent}"
        };
        return [
            ...(isNestedPieChart
                ? [
                    {
                        ...commonProperties,
                        name: classificationDataKey,
                        legendgroup: `${id}-${classificationDataKey}`,
                        legendgrouptitle: {
                            text: classificationDataKey === valueDataKey ? classificationDataKey : `${valueDataKey} | ${classificationDataKey}`
                        },
                        hovertemplate: `%{label}<br>${classificationDataKey}<br>%{value}<br>%{percent}<extra></extra>`,
                        hoverlabel: {
                            font: {
                                color: layout.color || FONT.COLOR,
                                family: layout.fontFamily || FONT.FAMILY,
                                size: layout.fontSize || FONT.SIZE
                            }
                        },
                        domain: {
                            x: [0.2, 0.8],
                            y: [0.2, 0.8]
                        },
                        labels: classificationLabels,
                        marker: {
                            colors,
                            line: {
                                ...style?.marker?.line
                            }
                        }
                    }
                ] : []),
            {
                ...commonProperties,
                name,
                legendgroup: id,
                legendgrouptitle: {
                    text: name
                },
                hoverlabel: {
                    font: {
                        color: layout?.color || FONT.COLOR,
                        family: layout?.fontFamily || FONT.FAMILY,
                        size: layout?.fontSize || FONT.SIZE
                    }
                },
                hovertemplate: `%{label}<br>${valueDataKey}<br>${tickPrefix ?? ""}%{value${format ? `:${format}` : ''}}${tickSuffix ?? ""}<br>%{percent}<extra></extra>`,
                domain,
                labels: outerLabels,
                ...(isNestedPieChart && {
                    hole: 0.65,
                    opacity: 0.75
                }),
                marker: {
                    colors,
                    line: {
                        ...style?.marker?.line
                    }
                }
            }];
    },
    bar: ({
        id,
        data: dataProp,
        options,
        formula, // refers always to y
        style: styleProperty,
        name: traceName,
        classifyGeoJSON,
        yAxisOpts,
        xAxisOpts,
        sortBy = 'groupBy',
        tickPrefix: tickPrefixProp,
        format: formatProp,
        tickSuffix: tickSuffixProp
    }) => {
        const tickPrefix = tickPrefixProp || yAxisOpts?.tickPrefix;
        const format = formatProp || yAxisOpts?.format;
        const tickSuffix  = tickSuffixProp || yAxisOpts?.tickSuffix;
        const xDataKey = options?.groupByAttributes;
        const yDataKey = getAggregationAttributeDataKey(options);
        const classificationDataKey = options?.classificationAttribute;
        const data = formula ? processDataProperties(formula, yDataKey, dataProp) : dataProp;
        const {
            msMode,
            msClassification,
            ...style
        } = styleProperty || {};

        if (msMode === 'classification') {

            const { sortByKey, classifiedData, classes } = generateClassifiedData({
                type: 'bar',
                sortBy,
                data,
                options,
                msClassification,
                classifyGeoJSON
            });
            return classes.map(({ color, label: name }, idx) => {
                const filteredData = classifiedData
                    .filter((entry) => entry.index === idx)
                    .sort((a, b) => a.properties[sortByKey] > b.properties[sortByKey] ? 1 : -1);
                if (filteredData.length === 0) {
                    return null;
                }
                const text = traceName || classificationDataKey;
                return {
                    type: 'bar',
                    legendgroup: `${id}-${classificationDataKey}`,
                    x: filteredData.map(({ properties }) => properties[xDataKey]),
                    y: filteredData.map(({ properties }) => properties[yDataKey]),
                    name,
                    legendgrouptitle: { text },
                    hovertemplate: `${tickPrefix ?? ""}%{y:${format ?? 'g'}}${tickSuffix ?? ""}<extra>${name}</extra>`,
                    marker: {
                        color,
                        ...(style?.marker?.line && {
                            line: style.marker.line
                        })
                    },
                    ...(xAxisOpts.xaxis && { xaxis: xAxisOpts.xaxis }),
                    ...(yAxisOpts.yaxis && { yaxis: yAxisOpts.yaxis })
                };
            }).filter(chart => chart !== null);
        }
        const sortedData = [...data].sort((a, b) => a[xDataKey] > b[xDataKey] ? 1 : -1);
        const x = sortedData.map(d => d[xDataKey]);
        const y = sortedData.map(d => d[yDataKey]);
        const name = traceName || yDataKey;
        return {
            ...style,
            type: 'bar',
            x,
            y,
            name,
            ...(xAxisOpts.xaxis && { xaxis: xAxisOpts.xaxis }),
            ...(yAxisOpts.yaxis && { yaxis: yAxisOpts.yaxis }),
            hovertemplate: `${tickPrefix ?? ""}%{y:${format ?? 'g'}}${tickSuffix ?? ""}<extra></extra>`
        };
    },
    line: ({
        data: dataProp,
        options,
        formula, // refers always to y
        style,
        name: traceName,
        yAxisOpts,
        xAxisOpts,
        tickPrefix: tickPrefixProp,
        format: formatProp,
        tickSuffix: tickSuffixProp
    }) => {
        const tickPrefix = tickPrefixProp || yAxisOpts?.tickPrefix;
        const format = formatProp || yAxisOpts?.format;
        const tickSuffix  = tickSuffixProp || yAxisOpts?.tickSuffix;
        const xDataKey = options?.groupByAttributes;
        const yDataKey = getAggregationAttributeDataKey(options);
        const data = formula ? processDataProperties(formula, yDataKey, dataProp) : dataProp;
        const name = traceName || yDataKey;
        const sortedData = [...data].sort((a, b) => a[xDataKey] > b[xDataKey] ? 1 : -1);
        const x = sortedData.map(d => d[xDataKey]);
        const y = sortedData.map(d => d[yDataKey]);
        return {
            mode: 'lines', // default mode should be lines
            ...style,
            name,
            hovertemplate: `${tickPrefix ?? ""}%{y:${format ?? 'd'}}${tickSuffix ?? ""}<extra></extra>`, // uses the format if passed, otherwise shows the full number.
            x,
            y,
            ...(xAxisOpts.xaxis && { xaxis: xAxisOpts.xaxis }),
            ...(yAxisOpts.yaxis && { yaxis: yAxisOpts.yaxis })
        };
    }
};

const getData = ({
    id,
    type,
    options,
    classificationDataKey,
    data,
    yAxisOpts,
    xAxisOpts,
    style,
    domain,
    name,
    classifyGeoJSONSync,
    textinfo,
    layout,
    tickPrefix,
    format,
    tickSuffix,
    formula,
    sortBy,
    includeLegendPercent
}) => {
    return classifyGeoJSONSync && chartDataTypes[type || 'line'] ? chartDataTypes[type || 'line']({
        id,
        data,
        options,
        style,
        domain,
        name,
        classificationDataKey,
        classifyGeoJSON: classifyGeoJSONSync,
        formula,
        yAxisOpts,
        xAxisOpts,
        textinfo,
        layout,
        tickPrefix,
        format,
        tickSuffix,
        sortBy,
        includeLegendPercent
    }) : null;
};

function getMargins({ isModeBarVisible }) {
    const modeBarHeight = 25;
    const margin = 8;
    const pad = 4;
    return {
        t: isModeBarVisible ? modeBarHeight : margin,
        b: margin,
        l: margin,
        r: margin,
        pad,
        autoexpand: true
    };
}

function getLayoutOptions({
    cartesian,
    xAxisOpts = [],
    yAxisOpts = [],
    barChartType,
    layout = {},
    height,
    width
}) {

    const leftPx = max(yAxisOpts.map(({ anchor, positionPx, side }) => anchor === 'free' && (side || 'left') === 'left' && positionPx !== undefined ? positionPx : 0));
    const rightPx = max(yAxisOpts.map(({ anchor, positionPx, side }) => anchor === 'free' && side === 'right' && positionPx !== undefined ? positionPx : 0));
    const bottomPx = max(xAxisOpts.map(({ anchor, positionPx, side }) => anchor === 'free' && (side || 'bottom') === 'bottom' && positionPx !== undefined ? positionPx : 0));
    const topPX = max(xAxisOpts.map(({ anchor, positionPx, side }) => anchor === 'free' && side === 'top' && positionPx !== undefined ? positionPx : 0));

    const left = leftPx === 0 ? 0 : leftPx / width;
    const right = rightPx === 0 ? 1 : 1 - (rightPx / width);
    const bottom = bottomPx === 0 ? 0 : bottomPx / height;
    const top = topPX === 0 ? 1 : 1 - (topPX / height);


    const yAxises = (yAxisOpts).reduce((acc, options, idx) => {
        return {
            ...acc,
            [`yaxis${idx === 0 ? '' : idx + 1}`]: {
                automargin: true,
                type: options?.type,
                tickangle: options.angle ?? 'auto',
                showticklabels: !options.hide,
                nticks: options.nTicks, // max number of ticks, to avoid performance issues
                showgrid: cartesian,
                color: options.color || layout.color,
                side: options.side,
                anchor: options.anchor || 'x',
                ...(options.anchor === 'free' && {
                    position: options.side === 'right'
                        ? 1 - ((options.positionPx || 0) / width)
                        : (options.positionPx || 0) / width
                }),
                title: {
                    text: options.title,
                    font: {
                        size: options.fontSize || layout.fontSize  || FONT.SIZE,
                        family: options.fontFamily || layout.fontFamily || FONT.FAMILY
                    }
                },
                tickfont: {
                    size: options.fontSize || layout.fontSize  || FONT.SIZE,
                    family: options.fontFamily || layout.fontFamily || FONT.FAMILY
                },
                tickformat: options?.format,
                tickprefix: options?.tickPrefix,
                ticksuffix: options?.tickSuffix,
                ...(idx !== 0
                    ? { overlaying: 'y' }
                    : { domain: [bottom, top] }
                )
            }
        };
    }, {});

    const xAxises = (xAxisOpts).reduce((acc, options, idx) => {
        return {
            ...acc,
            [`xaxis${idx === 0 ? '' : idx + 1}`]: {
                // dtick used to force show all x axis labels.
                // TODO: enable only when "category" with time dimension
                // dtick: xAxisAngle ? 0.25 : undefined,
                automargin: true,
                type: options?.type,
                tickangle: options.angle ?? 'auto',
                showticklabels: !options.hide,
                nticks: options.nTicks, // max number of ticks, to avoid performance issues
                showgrid: cartesian,
                color: options.color || layout.color,
                side: options.side,
                anchor: options.anchor || 'y',
                ...(options.anchor === 'free' && {
                    position: options.side === 'top'
                        ? 1 - ((options.positionPx || 0) / height)
                        : (options.positionPx || 0) / height
                }),
                title: {
                    text: options.title,
                    font: {
                        size: options.fontSize || layout.fontSize  || FONT.SIZE,
                        family: options.fontFamily || layout.fontFamily || FONT.FAMILY
                    }
                },
                tickfont: {
                    size: options.fontSize || layout.fontSize  || FONT.SIZE,
                    family: options.fontFamily || layout.fontFamily || FONT.FAMILY
                },

                ...(idx !== 0
                    ? { overlaying: 'x' }
                    : { domain: [left, right] }
                )
            }
        };
    }, {});

    return {
        ...(barChartType && { barmode: barChartType}),
        ...yAxises,
        ...xAxises
    };
}

const legacyPropsToTraces = ({ series, xAxis, classifications, classificationAttr, ...props }) => {
    if (series) {
        const options = {
            groupByAttributes: xAxis?.dataKey,
            aggregationAttribute: series?.[0]?.dataKey,
            ...((classifications?.dataKey || classificationAttr) && { classificationAttribute: classifications.dataKey || classificationAttr })
        };
        return {
            ...props,
            ...legacyChartToChartWithTraces({
                ...props,
                options: {
                    ...options,
                    ...props.options
                }
            }),
            data: [props.data]
        };
    }
    return props;
};

/**
 * Adapter for the data format and options format of the MapStore charts
 * and the Library format.
 */
export const toPlotly = (_props) => {
    const props = legacyPropsToTraces(_props);
    const {
        height,
        width,
        legend,
        classifyGeoJSONSync,
        cartesian,
        layout
    } = props;
    const isModeBarVisible = width > 350;
    const traces = props.traces || [];
    const dataProp = props.data || [];
    const types =  [...traces.map((trace) => trace.type)];
    const piesLength = types.filter(type => type === 'pie').length + ((types.includes('bar') || types.includes('line')) ? 1 : 0);
    const gridProperty = piesLength > 1 && {
        grid: {
            rows: Math.ceil(piesLength / 2),
            columns: 2
        }
    };
    const xAxisOpts = castArray(props.xAxisOpts || [{ id: 0 }]).map((opts, idx) => idx === 0 ? opts : { ...opts, xaxis: `x${idx + 1}` });
    const yAxisOpts = castArray(props.yAxisOpts || [{ id: 0 }]).map((opts, idx) => idx === 0 ? opts : { ...opts, yaxis: `y${idx + 1}` });
    const isBarChartStackEnabled = enableBarChartStack({ traces, xAxisOpts, yAxisOpts });
    const barChartType = isBarChartStackEnabled
        ? props.barChartType || 'group'
        : 'group';
    return {
        layout: {
            showlegend: legend ?? false, // Set false when legend is undefined, else pie-chart attempts to display legend
            // https://plotly.com/javascript/setting-graph-size/
            // automargin: true ok for big widgets.
            // small widgets should be adapted accordingly
            ...getLayoutOptions({
                cartesian,
                xAxisOpts,
                yAxisOpts,
                barChartType,
                layout,
                height,
                width
            }),
            font: {
                color: layout?.color || FONT.COLOR,
                size: layout?.fontSize || FONT.SIZE,
                family: layout?.fontFamily || FONT.FAMILY
            },
            margin: getMargins({ isModeBarVisible }),
            autosize: false,
            height,
            width,
            // for pie: Position legend to right and centered vertically
            // for bar: use groupclick to be for item toggle by overriding the default 'togglegroup' with 'toggleitem'
            // ** see: https://plotly.com/javascript/reference/layout/#layout-legend-groupclick
            ...((types.includes('pie') && isModeBarVisible) ? { legend: {x: 1.05, y: 0.5} } : types.includes('bar') ? {legend: {
                "tracegroupgap": 10,
                "groupclick": "toggleitem"
            }} : {}),
            hovermode: 'x unified',
            uirevision: true,
            shapes: [...(layout?.shapes || [])],
            ...gridProperty
        },
        data: traces.filter((trace, idx) => !!dataProp[idx]).reduce((acc, {
            id,
            name,
            type,
            options,
            style,
            xaxis = 0,
            yaxis = 0,
            textinfo,
            tickPrefix,
            format,
            tickSuffix,
            formula,
            sortBy,
            includeLegendPercent
        }, idx) => {
            const traceData = dataProp[idx];
            const domainProperty = type === 'pie' && piesLength > 1 ? {
                domain: {
                    row: Math.floor(idx / (gridProperty.grid.columns)),
                    column: idx % (gridProperty.grid.columns)
                }
            } : {};
            const traceXAxisOpts = xAxisOpts.find(opts => opts.id === xaxis) || xAxisOpts[0] || {};
            const traceYAxisOpts = yAxisOpts.find(opts => opts.id === yaxis) || yAxisOpts[0] || {};
            // classification for bar charts generates an array of trace
            const data = getData({
                id,
                type,
                options,
                data: traceData,
                yAxisOpts: traceYAxisOpts,
                xAxisOpts: traceXAxisOpts,
                style,
                name,
                classifyGeoJSONSync,
                textinfo,
                layout,
                tickPrefix,
                format,
                tickSuffix,
                formula,
                sortBy,
                includeLegendPercent,
                ...domainProperty
            });
            return [ ...acc, ...(isArray(data) ? data : [data]) ];
        }, []).map((trace, idx) => {
            if (traces.length > 1 && !isBarChartStackEnabled && trace?.type === 'bar') {
                // in case isBarChartStackEnabled is false we currently have two condition
                // - a single bar trace is available
                // - multiple bar traces with multiple axis are available
                // in the second case we should add an group offset to correctly position them
                // and visualize them overlapping
                return {
                    ...trace,
                    offsetgroup: idx + 1
                };
            }
            return trace;
        }),
        config: {
            displayModeBar: isModeBarVisible, // minimal to display 8 tools.
            modeBarButtonsToRemove: [
                // to use less space, they looks not so useful
                "lasso2d",
                "select2d",
                "hoverCompareCartesian",
                "hoverClosestCartesian",
                "hoverClosestPie"
            ],
            displaylogo: false
        }
    };
};

/**
 * Plotly base component. Wraps the Plotly chart to fit the widgets chart options
 * format. This conversion should be maintained to keep the chart saved working.
 * @prop {number} height height for the chart, can be the height of the container div
 * @prop {number} width width for the chart, can be the width of the container div
 * @prop {boolean} legend if present, show legend
 * @prop {boolean} [cartesian] show the cartesian grid behind the chart
 * @prop {object[]} data the data set for each trace `[[{ name: 'Page A', uv: 0, pv: 0, amt: 0 }]]
 * @prop {object[]} traces array of traces composing the charts
 * @prop {object[]} [yAxisOpts] array of options for each y axis
 * @prop {string} [yAxisOpts[].type] determine the type of the y axis of `date`, `-` (automatic), `log`, `linear`, `category`, `date`.
 * @prop {string} [yAxisOpts[].format] format for y axis value. See {@link https://d3-wiki.readthedocs.io/zh_CN/master/Formatting/}
 * @prop {string} [yAxisOpts[].tickPrefix] the prefix on y value
 * @prop {string} [yAxisOpts[].tickSuffix] the suffix of y value.
 * @prop {object[]} [xAxisOpts] array of options for each x axis
 * @prop {string} [xAxisOpts[].type] determine the type of the x axis of `date`, `-` (automatic), `log`, `linear`, `category`, `date`.
 * @prop {object} [xAxisOpts[].hide] if true, hides the labels of the axis
 * @prop {number} [xAxisOpts[].nTicks] max number of ticks. Can be used to force to display all labels, instead of skipping.

 * @prop {string} type (deprecated) one of 'line', 'bar', 'pie'
 * @prop {object} xAxis (deprecated) contains xAxis `dataKey`, the key from `data` array for x axis (or category).
 * @prop {number} [xAxisAngle] (deprecated) the angle, in degrees, of xAxisAngle.
 * @prop {object|boolean} [yAxis=true] (deprecated) if false, hide the yAxis. true by default. (should contain future options for yAxis)
 * @prop {string} [formula] (deprecated) a formula to calculate the final value
 * @prop {string} [yAxisLabel] (deprecated) the label of yAxis, to show in the legend
 * @prop {object} [autoColorOptions] (deprecated) options to generate the colors of the chart.
 * @prop {object[]} series (deprecated) descriptor for every series. Contains the y axis (or value) `dataKey`
 */
function WidgetChart({
    onInitialized,
    onHover,
    ...props
}) {
    const { data, layout, config } = toPlotly(props);
    return (
        <Suspense fallback={<LoadingView />}>
            <Plot
                onInitialized={onInitialized}
                onHover={onHover}
                data={data.flat()}
                layout={layout}
                config={config}
            />
        </Suspense>
    );
}

export default withLegendScrollHandler(withClassifyGeoJSONSync(WidgetChart));
