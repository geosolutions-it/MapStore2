import React from 'react';
import Plot from 'react-plotly.js';
import { sameToneRangeColors } from '../../utils/ColorUtils';
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

function getData({ type, xDataKey, yDataKey, data}) {
    const x = data.map(d => d[xDataKey]);
    const y = data.map(d => d[yDataKey]);
    switch (type) {
    case 'pie':

        return {
            textposition: 'inside', // this avoids text to overflow the chart div when rendered outside
            values: y,
            labels: x
        };

    default:
        return {
            x,
            y
        };
    }
}
function getMargins({ type, yAxis, isModeBarVisible, xAxisAngle }) {
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
            l: !yAxis ? 5 : undefined, // if yAxis is false, reduce left margin
            r: 5,
            // optimization of bottom space, if the angle is fixed to 0
            b: xAxisAngle === 0 ? 25 : undefined,
            // save space on top if the bar is not visible
            t: isModeBarVisible ? 20 : 5,
            pad: 4
        };
    }
}

function getLayoutOptions({ series = [], cartesian, type, yAxis, xAxisAngle, data = [], autoColorOptions = COLOR_DEFAULTS} ) {
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
                automargin: true,
                showticklabels: yAxis === true,
                // showticklabels,showline for yAxis false
                showgrid: cartesian
            },
            xaxis: {
                // dtick used to force show all x axis labels.
                // TODO: enable only when "category" with time dimension
                // dtick: xAxisAngle ? 0.25 : undefined,
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
                name: yAxisLabel ?? yDataKey,
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
 * @prop {number} xAxisAngle the angle, in degrees, of xAxisAngle.
 * @prop {object|boolean} yAxis if false, hide the yAxis. true by default. (should contain future options for yAxis)
 * @prop {string} yAxisLabel the label of yAxis, to show in the legend
 * @prop {boolean} cartesian show the cartesian grid behind the chart
 * @prop {object} autoColorOptions options to generate the colors of the chart.
 * @prop {object[]} series descriptor for every series. Contains the y axis (or value) `dataKey`
 */
export default function WidgetChart({
    onInitialized,
    ...props
}) {
    const { data, layout, config } = toPlotly(props);
    return (
        <Plot
            onInitialized={onInitialized}
            data={data}
            layout={layout}
            config={config}
        />
    );
}
