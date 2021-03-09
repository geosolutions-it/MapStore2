/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Suspense } from 'react';
import { sameToneRangeColors } from '../../utils/ColorUtils';
import { parseExpression } from '../../utils/ExpressionUtils';
import LoadingView from '../misc/LoadingView';

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

function getData({ type, xDataKey, yDataKey, data, formula}) {
    const x = data.map(d => d[xDataKey]);
    let y = data.map(d => d[yDataKey]);
    switch (type) {
    case 'pie':

        return {
            textposition: 'inside', // this avoids text to overflow the chart div when rendered outside
            values: y,
            labels: x
        };

    default:
        if (formula) {
            y = y.map(v => {
                const value = v;
                try {
                    return parseExpression(formula, {value});
                } catch {
                    // if error (e.g. null values), return the value itself
                    return v;
                }
            });


        }
        return {
            x,
            y
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

function getLayoutOptions({ series = [], cartesian, type, yAxis, xAxisAngle, xAxisOpts = {}, yAxisOpts = {}, data = [], autoColorOptions = COLOR_DEFAULTS} ) {
    switch (type) {
    case 'pie':
        return {
            colorway: defaultColorGenerator(data.length, autoColorOptions)
        };
    // line / bar
    default :
        return {
            colorway: defaultColorGenerator(series.length, autoColorOptions),
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
        legend
    } = props;
    const xDataKey = xAxis?.dataKey;
    const isModeBarVisible = width > 350;
    return {
        layout: {
            showlegend: legend,
            // legend: { "orientation": "h" },
            // https://plotly.com/javascript/setting-graph-size/
            // automargin: true ok for big widgets.
            // small widgets should be adapted accordingly
            ...getLayoutOptions({ ...props }),
            margin: getMargins({ ...props, isModeBarVisible}),
            autosize: false,
            automargin: false,
            height,
            width
        },
        data: series.map(({ dataKey: yDataKey }) => {
            return {
                type,
                name: yAxisLabel || yDataKey,
                ...getData({ ...props, xDataKey, yDataKey})
            };
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
                data={data}
                layout={layout}
                config={config}
            />
        </Suspense>
    );
}
