/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {LineChart, Line} = require('recharts');
const {castArray, isNil, maxBy, head} = require('lodash');
const {renderCartesianTools} = require('./cartesian');

module.exports = ({width = 600, height = 300, data, series =[], colorGenerator, autoColorOptions, isAnimationActive, ...props} = {}) => {
    const seriesArray = castArray(series);
    const COLORS = colorGenerator(seriesArray.length, autoColorOptions);
    const legendLabel = props.yAxisLabel ? [props.yAxisLabel] : [];
    const yAxisLabel = props.yAxis;
    const xAxisAngle = !isNil(props.xAxisAngle) ? [`angle${props.xAxisAngle}`] : [];

    // WORKAROUND: recharts does not re-render line and bar charts when changing colors, y axis, x axis rotation angle and legend label.
    const key = (COLORS || ["linechart"]).concat(legendLabel, yAxisLabel, xAxisAngle).join("");

    const lengthLongestLabels = maxBy(data, (d) => d[props.xAxis.dataKey].length)[props.xAxis.dataKey].length;
    const lengthFirstLabel = head(data) && head(data)[props.xAxis.dataKey].length;
    return (
        <LineChart
            key={key}
            width={width}
            height={height}
            data={data}
            margin={props.xAxisAngle ? {top: 20, right: 30, left: 30 + 10 + lengthFirstLabel, bottom: 5 + (lengthLongestLabels * 5) } : {}}
        >
            {seriesArray.map(({color, ...serie}, i) =>
                <Line
                    key={`line-${i}`}
                    name={props.yAxisLabel ? props.yAxisLabel : null}
                    isAnimationActive={isAnimationActive}
                    stroke={COLORS[i]} {...serie} />)
            }
            {renderCartesianTools(props)}
            {props.children}
        </LineChart>
    );
};
