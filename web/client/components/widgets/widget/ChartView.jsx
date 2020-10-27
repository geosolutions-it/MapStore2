/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const loadingState = require('../../misc/enhancers/loadingState')();
const errorChartState = require('../enhancers/errorChartState');
const emptyChartState = require('../enhancers/emptyChartState');
const React = require('react');
// const SimpleChart = require('./SimpleChart');
const PlotlyChart = require('../../charts/PlotlyChart').default;
const { withProps } = require('recompose');
// TODO: this should be splitted in two in final implementation.
// One is the adapter for data (wpsChart or what else) and type, options parsing in the component.
const toPlotly = withProps(({ data, xAxis, series, type, height, width }) => {
    const xDataKey = xAxis.dataKey;
    const yDataKey = series[0].dataKey;
    const x = data.map(d => d[xDataKey]);
    const y = data.map(d => d[yDataKey]);
    return {
        layout: {
            // https://plotly.com/javascript/setting-graph-size/
            // automargin: true ok for big widgets.
            // small widgets should be adapted accordingly
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
});

const SimpleChart = loadingState(errorChartState(emptyChartState(
    toPlotly(PlotlyChart)
)));
const ContainerDimensions = require('react-container-dimensions').default;

module.exports = (props) => (<div className="mapstore-widget-chart">
    <ContainerDimensions>
        <SimpleChart {...props} />
    </ContainerDimensions>
</div>);
