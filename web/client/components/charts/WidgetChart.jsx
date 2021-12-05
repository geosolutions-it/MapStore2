/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Suspense } from 'react';
import { sameToneRangeColors, hexToHsv } from '../../utils/ColorUtils';
import { parseExpression } from '../../utils/ExpressionUtils';
import LoadingView from '../misc/LoadingView';
import { includes, isNumber, isString, union } from 'lodash';
const Plot = React.lazy(() => import('./PlotlyChart'));

export const COLOR_DEFAULTS = {
    base: 190,
    range: 0,
    s: 0.95,
    v: 0.63
};
export const defaultColorGenerator = (total, colorOptions) => {
    const { base, range, ...opts } = colorOptions;
    return (sameToneRangeColors(base, range, total + 1, opts) || [0]).slice(1);
};

export const customColorRampGenerator = (color, total) => {
    const hsvDefaultColor = hexToHsv(color);
    const defaultAutoColorOptions = {
        base: color,
        range: 30,
        s: hsvDefaultColor[1],
        v: hsvDefaultColor[2]
    };
    return hsvDefaultColor[0] > 80 && hsvDefaultColor[0] < 250 ?
        defaultColorGenerator(total, defaultAutoColorOptions).reverse() :
        defaultColorGenerator(total, defaultAutoColorOptions);
};

const getClassificationColors = (classifications, colorCategories, customColorEnabled, autoColorOptions) => (
    classifications.map(item => {
        if (isString(item) || isNumber(item)) {
            const matchedColor = colorCategories.filter(colorCategory => colorCategory.value === item)[0];
            // color is exactly matched to a user defined class/color
            return matchedColor ? matchedColor.color :
                // color is not exactly matched and default is chosen (if default exists)
                customColorEnabled && autoColorOptions.classDefaultColor ? autoColorOptions.classDefaultColor :
                    // class default color may not be defined and fall back to default color
                    autoColorOptions.defaultCustomColor ? autoColorOptions.defaultCustomColor : defaultColorGenerator(1, COLOR_DEFAULTS)[0];
        }
        return  defaultColorGenerator(1, autoColorOptions)[0];
    })
);

const getLegendLabel = (value, colorCategories, defaultClassLabel) => {
    let displayValue = defaultClassLabel;
    if (includes(colorCategories.map(colorCat => colorCat.value), value)) {
        displayValue = colorCategories.filter(item => item.value === value)[0].title || value;
        if (!displayValue ?? /^\s*$/.test(displayValue)) {
            displayValue = 'Default';
        }
    }
    return displayValue;
};

/**
 * Splits ungrouped data in arrays on the basis of values of another array
 * containing unique values.
 * @param {number[]|string[]} classValues - the array of non unique values used to map every single value of the ungrouped arrays
 * to the filteredClassValues array
 * @param {number[]|string[]} filteredClassValues : classValues unduplicated items (no duplicates) upon which the splitting is based
 * @param {Array<Array<number|string>>} ungroupedValues -
 * the data shaped as two dimensional array containing the arrays that needs splitting and every single item mapped
 * to filteredClassValues
 * @returns {Array<Array<number|string>>} data shaped as two dimensional containing the same number of arrays of
 * the number of items in the filteredClassValues array.
 * example:
 * classValues = [['A', 'B', 'B', 'C', 'A', 'D', 'C', 'C'], [...], [...]]
 * filteredClassValues = ['A', 'B', 'C', 'D']
 * ungroupedValues = [[1, 2, 3, 4, 5, 6, 7, 8],['Foo','Foo','Bar','Bar','Baz','Foo','Baz','Baz']]
 * result = [ [[1,5],['Foo', 'Baz']], [[2,3],['Foo', 'Bar']], [[4,7,8],['Bar', 'Baz', 'Baz']], [[6],['Foo']] ]
 */
export const getGroupedTraceValues = (classValues, filteredClassValues, ungroupedValues) => {
    // iterate over our base data, for every array
    const groupedValues = ungroupedValues
        // iterate over our filtered base data
        .map(ungroupedValue => filteredClassValues
            // iterate over single values in the classValues array
            .map(item => classValues
                // if the current classValue value of the item mathces the value of the filteredClassValues
                // it means it belongs to the same group and push it in the groupedValues array, the map between
                // ungroupedValue and classValues arrays is the index since the length of both arrays have the same length
                .reduce((acc, cur, index) => (cur === item ? [...acc, ungroupedValue[index]] : acc), [])));
    return groupedValues;
};

const preProcessValues = (formula, values) => (
    values.map(v => {
        const value = v;
        try {
            return parseExpression(formula, {value});
        } catch {
            // if error (e.g. null values), return the value itself
            return v;
        }
    }));

function getData({ type, xDataKey, yDataKey, data, formula, yAxisOpts, classificationAttr, yAxisLabel, autoColorOptions, customColorEnabled }) {
    const x = data.map(d => d[xDataKey]);
    let y = data.map(d => d[yDataKey]);
    const classifications = classificationAttr ? data.map(d => d[classificationAttr]) : [];
    const colorCategories = autoColorOptions?.classification || [];
    const classificationColors = getClassificationColors(classifications, colorCategories, customColorEnabled, autoColorOptions) || [];
    const defaultClassLabel = autoColorOptions.classDefaultLabel ?? 'Default';

    switch (type) {

    case 'pie':
        let pieChartTrace = {
            name: yAxisLabel || yDataKey,
            hovertemplate: `%{label}<br>${yDataKey}<br>%{value}<br>%{percent}<extra></extra>`,
            text: x,
            type,
            textposition: 'inside',
            values: y
        };
        if (classificationAttr && classifications.length && classificationColors.length && customColorEnabled) {
            const legendLabels = classifications.map((item, index) => `${x[index]} - ${getLegendLabel(item, colorCategories, defaultClassLabel)}`);
            pieChartTrace = {
                ...pieChartTrace,
                labels: legendLabels,
                marker: {colors: classificationColors},
                legendgrouptitle: {
                    text: `${xDataKey} - ${classificationAttr}`
                }
            };
        } else {
            pieChartTrace = {
                ...(yDataKey && { legendgroup: yDataKey}),
                legendgrouptitle: {
                    text: `${yDataKey}`
                },
                ...pieChartTrace,
                labels: x,
                ...(customColorEnabled ? { marker: {colors: x.reduce((acc) => ([...acc, autoColorOptions?.classDefaultColor || autoColorOptions?.defaultCustomColor || '#0888A1']), [])} } : {})
            };
        }
        return pieChartTrace;

    case 'bar':
        if (formula) {
            y = preProcessValues(formula, y);
        }
        let barChartTrace = {
            hovertemplate: `${yAxisOpts?.tickPrefix ?? ""}%{y:${yAxisOpts?.format ?? 'g'}}${yAxisOpts?.tickSuffix ?? ""}<extra></extra>`,
            type
        };
        /** Bar chart is classified coloured */
        if (classificationAttr && classifications.length && classificationColors.length && customColorEnabled) {
            const legendLabels = classifications.map(item => getLegendLabel(item, colorCategories, defaultClassLabel));
            const filteredLegendLabels = union(legendLabels);
            const [groupedColors, groupedXValues, groupedYValues] = getGroupedTraceValues(legendLabels, filteredLegendLabels, [classificationColors, x, y]);
            const barChartTraces = filteredLegendLabels.map((item, index) => {
                const trace = {
                    ...barChartTrace,
                    x: groupedXValues[index],
                    y: groupedYValues[index],
                    name: `${yAxisLabel || yDataKey}${item && ` - ${item}`}`,
                    marker: { color: groupedColors[index] }
                };
                return trace;
            });
            return barChartTraces;
        }

        /** Bar chart is evenly coloured */
        barChartTrace = {
            ...barChartTrace,
            x: x,
            y: y,
            name: yAxisLabel || yDataKey,
            ...(classifications.length && classificationColors.length ? {marker: {color: classificationColors}} : {})
        };
        return barChartTrace;

    default:
        if (formula) {
            y = preProcessValues(formula, y);
        }
        return {
            hovertemplate: `${yAxisOpts?.tickPrefix ?? ""}%{y:${yAxisOpts?.format ?? 'd'}}${yAxisOpts?.tickSuffix ?? ""}<extra></extra>`, // uses the format if passed, otherwise shows the full number.
            x,
            y,
            name: yAxisLabel || yDataKey
        };
    }
}
function getMargins({ type, isModeBarVisible}) {
    switch (type) {
    case 'pie':
        return {
            t: isModeBarVisible ? 20 : 5,
            b: 5,
            l: 2,
            r: 2,
            pad: 4
        };
    default:
        return {
            l: 5, // if yAxis is false, reduce left margin
            r: 5,
            b: 30, // at least the space to show the tooltip
            // save space on top if the bar is not visible
            t: isModeBarVisible ? 20 : 5,
            pad: 4
        };
    }
}

function getLayoutOptions({ series = [], cartesian, type, yAxis, xAxisAngle, xAxisOpts = {}, yAxisOpts = {}, data = [], autoColorOptions = COLOR_DEFAULTS, customColorEnabled } ) {
    switch (type) {
    case 'pie':
        return {
            ...(!customColorEnabled && {colorway: defaultColorGenerator(data.length, autoColorOptions)})
        };
    // line / bar
    default :
        return {
            colorway: customColorEnabled && [autoColorOptions.classDefaultColor] || defaultColorGenerator(series.length, autoColorOptions),
            yaxis: {
                type: yAxisOpts?.type,
                automargin: true,
                tickformat: yAxisOpts?.format,
                tickprefix: yAxisOpts?.tickPrefix,
                ticksuffix: yAxisOpts?.tickSuffix,
                showticklabels: yAxis === true,
                // showticklabels,showline for yAxis false
                showgrid: cartesian
            },
            xaxis: {
                showgrid: cartesian,
                type: xAxisOpts?.type,
                showticklabels: !xAxisOpts?.hide,
                // dtick used to force show all x axis labels.
                // TODO: enable only when "category" with time dimension
                // dtick: xAxisAngle ? 0.25 : undefined,
                nticks: xAxisOpts.nTicks, // max number of ticks, to avoid performance issues
                automargin: true,
                tickangle: xAxisAngle ?? 'auto'
            }
        };
    }
}
/**
 * Adapter for the data format and options format of the MapStore charts
 * and the Library format.
 */
export const toPlotly = (props) => {
    const {

        xAxis,
        series = [],
        yAxisLabel,
        type = 'line',
        height,
        width,
        legend,
        classifications,
        autoColorOptions = COLOR_DEFAULTS
    } = props;
    const xDataKey = xAxis?.dataKey;
    const isModeBarVisible = width > 350;
    const classificationAttr = classifications?.dataKey;
    const customColorEnabled = autoColorOptions.name === 'global.colors.custom';
    return {
        layout: {
            showlegend: legend,
            // https://plotly.com/javascript/setting-graph-size/
            // automargin: true ok for big widgets.
            // small widgets should be adapted accordingly
            ...getLayoutOptions({ ...props, customColorEnabled, classificationAttr }),
            margin: getMargins({ ...props, isModeBarVisible}),
            autosize: false,
            height,
            width,
            ...(type === 'pie' && isModeBarVisible && {legend: {x: 1.05, y: 0.5}}), // Position legend to right and centered vertically
            hovermode: 'x unified'
        },
        data: series.map(({ dataKey: yDataKey }) => {
            let allData = getData({ ...props, xDataKey, yDataKey, classificationAttr, type, yAxisLabel, autoColorOptions, customColorEnabled });
            return  allData;
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
 * @prop {string} type one of 'line', 'bar', 'pie'
 * @prop {number} height height for the chart, can be the height of the container div
 * @prop {number} width width for the chart, can be the width of the container div
 * @prop {boolean} legend if present, show legend
 * @prop {object[]} data the data set `[{ name: 'Page A', uv: 0, pv: 0, amt: 0 }]`
 * @prop {object} xAxis contains xAxis `dataKey`, the key from `data` array for x axis (or category).
 * @prop {object} [xAxisOpts] options for xAxis: `type`, `hide`, `nTicks`.
 * @prop {string} [xAxisOpts.type] determine the type of the x axis of `date`, `-` (automatic), `log`, `linear`, `category`, `date`.
 * @prop {object} [xAxisOpts.hide=false] if true, hides the labels of the axis
 * @prop {number} [xAxisOpts.nTicks] max number of ticks. Can be used to force to display all labels, instead of skipping.
 * @prop {number} [xAxisAngle] the angle, in degrees, of xAxisAngle.
 * @prop {object|boolean} [yAxis=true] if false, hide the yAxis. true by default. (should contain future options for yAxis)
 * @prop {object} [yAxisOpts] options for yAxis: `type`, `tickPrefix`, `tickPostfix`, `format`, `formula`
 * @prop {string} [yAxisOpts.type] determine the type of the y axis of `date`, `-` (automatic), `log`, `linear`, `category`, `date`.
 * @prop {string} [yAxisOpts.format] format for y axis value. See {@link https://d3-wiki.readthedocs.io/zh_CN/master/Formatting/}
 * @prop {string} [yAxisOpts.tickPrefix] the prefix on y value
 * @prop {string} [yAxisOpts.tickSuffix] the suffix of y value.
 * @prop {string} [formula] a formula to calculate the final value
 * @prop {string} [yAxisLabel] the label of yAxis, to show in the legend
 * @prop {boolean} [cartesian] show the cartesian grid behind the chart
 * @prop {object} [autoColorOptions] options to generate the colors of the chart.
 * @prop {object[]} series descriptor for every series. Contains the y axis (or value) `dataKey`
 */
export default function WidgetChart({
    onInitialized,
    ...props
}) {
    const { data, layout, config } = toPlotly(props);
    return (
        <Suspense fallback={<LoadingView />}>
            <Plot
                onInitialized={onInitialized}
                data={data.flat()}
                layout={layout}
                config={config}
            />
        </Suspense>
    );
}
