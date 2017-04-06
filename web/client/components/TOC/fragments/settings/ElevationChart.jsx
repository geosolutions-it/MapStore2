/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} = require('recharts');
const ElevationChartTooltip = require('./ElevationChartTooltip');

module.exports = React.createClass({
    propTypes: {
        elevations: React.PropTypes.object,
        chartStyle: React.PropTypes.object,
        onChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            elevations: {},
            onChange: () => {},
            chartStyle: {
                margin: {
                    top: 5,
                    right: 20,
                    left: 18,
                    bottom: 45
                },
                width: 600,
                height: 200
            }
        };
    },
    renderLineChart() {
        return (
            <LineChart margin={this.props.chartStyle.margin} width={this.props.chartStyle.width} height={this.props.chartStyle.height} data={this.formatData(this.props.elevations.values)}>
                <XAxis
                    hide={true}
                    dataKey="name"/>
                <YAxis
                    hide={true}/>
                <Tooltip content={<ElevationChartTooltip/>}/>
                <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}/>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#82ca9d"
                    activeDot={{r: 8}}/>
            </LineChart>
        );
    },
    render() {
        return (
            <div>
                {this.renderLineChart()}
            </div>
        );
    },
    formatData(values) {
        let data = [];
        values.map(function(o) {
            data.push(
                {
                    "name": this.props.elevations.name,
                    "value": parseFloat(this.props.elevations.positive ? o : -o)
                }
            );
        }, this);
        return data;
    }
});
