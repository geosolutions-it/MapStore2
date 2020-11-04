import React from 'react';
import Plot from 'react-plotly.js';
/**
 * Adapter for the data format and options format of the MapStore charts
 * and the Library format.
 */
export const toPlotly = ({
    data,
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
    const x = data.map(d => d[xDataKey]);
    const y = data.map(d => d[yDataKey]);
    return {
        layout: {
            showlegend: legend,
            legend: { "orientation": "h" },
            // https://plotly.com/javascript/setting-graph-size/
            // automargin: true ok for big widgets.
            // small widgets should be adapted accordingly
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
            },
            margin: {
                l: !yAxis ? 5 : undefined,
                r: 5,
                t: 20,
                pad: 4
            },
            autosize: false,
            automargin: false,
            height,
            width
        },
        data: [{
            name: yAxisLabel ?? yDataKey,
            // for pie
            values: y,
            labels: x,
            // for line/bar
            x,
            y,
            type
        }],
        config: {
            // displayModeBar
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
