/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {LineChart, Line} = require('recharts');
const {renderCartesianTools} = require('./cartesian');

module.exports = ({width = 600, height = 300, data, series =[], colorGenerator, autoColorOptions, isAnimationActive, ...props} = {}) => {
    const seriesArray = (Array.isArray(series) ? series : [series]);
    const COLORS = colorGenerator(seriesArray.length, autoColorOptions);
    // WORKAROUND: rechart do not rerender line and bar charts when change colors, y axis and legend label.
    const legendLabel = props.yAxisLabel ? [props.yAxisLabel] : [];
    const yAxisLabel = props.yAxis;
    const key = (COLORS || ["linechart"]).concat(legendLabel, yAxisLabel).join("");
    return (<LineChart key={key} width={width} height={height} data={data}>
       {seriesArray.map(({color, ...serie}, i) => <Line key={`line-${i}`} name={props.yAxisLabel ? props.yAxisLabel : null} isAnimationActive={isAnimationActive} stroke={COLORS[i]} {...serie} />)}
       {renderCartesianTools(props)}
       {props.children}

    </LineChart>);
};
