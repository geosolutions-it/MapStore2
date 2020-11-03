import React from 'react';
import Plot from 'react-plotly.js';
/**
 * Adapter for the data format and options format of the MapStore charts
 * and the Library format.
 */
export const toPlotly = ({ data, xAxis, series, type, height, width, cartesian }) => {
    const xDataKey = xAxis.dataKey;
    const yDataKey = series[0].dataKey;
    const x = data.map(d => d[xDataKey]);
    const y = data.map(d => d[yDataKey]);
    return {
        layout: {
            // https://plotly.com/javascript/setting-graph-size/
            // automargin: true ok for big widgets.
            // small widgets should be adapted accordingly
            yaxis: {
                // showticklabels,showline for yAxis false
                showgrid: cartesian
            },
            // xaxis.tickangle for oblique labels and so on...
            margin: {
                l: 40,
                r: 5,
                b: 100,
                t: 20,
                pad: 4
            },
            autosize: false,
            automargin: true,
            height,
            width
        },
        data: [{
            // for pie
            values: y,
            labels: x,
            // for line/bar
            x,
            y,
            type
        }]
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
