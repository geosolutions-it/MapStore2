import React from 'react';
import Plot from 'react-plotly.js';

function getData({type, xDataKey, yDataKey, data}) {
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
function getMargins({ type, yAxis }) {
    switch (type) {
    case 'pie':
        return { t: 5, b: 5, l: 2, r: 2 };
    default:
        return {
            l: !yAxis ? 5 : undefined,
            r: 5,
            t: 20,
            pad: 4
        };
    }
}
function getLayoutOptions({cartesian, type, yAxis, xAxisAngle} ) {
    switch (type) {
    case 'pie':
        return {};
    // line / bar
    default :
        return {
            yaxis: {
                automargin: true,
                showticklabels: yAxis,
                // showticklabels,showline for yAxis false
                showgrid: cartesian
            },
            xaxis: {
                visible: true,
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
export const toPlotly = ({
    data = [],
    xAxis,
    xAxisAngle,
    series,
    yAxis,
    yAxisLabel,
    type = 'line',
    height, width,
    cartesian,
    legend
}) => {
    const xDataKey = xAxis.dataKey;
    const yDataKey = series[0].dataKey;

    return {
        layout: {
            showlegend: legend,
            // legend: { "orientation": "h" },
            // https://plotly.com/javascript/setting-graph-size/
            // automargin: true ok for big widgets.
            // small widgets should be adapted accordingly
            ...getLayoutOptions({ cartesian, type, yAxis, xAxisAngle}),
            margin: getMargins({type, yAxis}),
            autosize: false,
            automargin: false,
            height,
            width
        },
        data: [{
            type,
            name: yAxisLabel ?? yDataKey,
            ...getData({ type, data, xDataKey, yDataKey})
        }],
        config: {
            displayModeBar: width > 250, // minimal to display 8 tools.
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
export default function PlotlyChart(props) {
    const { data, layout, config } = toPlotly(props);
    return (
        <Plot
            data={data}
            layout={layout}
            config={config}
        />
    );
}
